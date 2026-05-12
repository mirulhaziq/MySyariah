import os
import time
from typing import List

import httpx
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "mysyariah-compliance")
PINECONE_ENABLED = bool(PINECONE_API_KEY)
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

EMBED_MODEL = "text-embedding-3-small"
EMBED_DIM = 1536
CHUNK_SIZE = 500       # characters per chunk
CHUNK_OVERLAP = 50
TOP_K = 8              # rule chunks to inject per audit


def _get_index():
    from pinecone import Pinecone, ServerlessSpec
    pc = Pinecone(api_key=PINECONE_API_KEY)
    existing = [idx.name for idx in pc.list_indexes()]
    if PINECONE_INDEX not in existing:
        pc.create_index(
            name=PINECONE_INDEX,
            dimension=EMBED_DIM,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        # Wait for index to be ready
        while not pc.describe_index(PINECONE_INDEX).status["ready"]:
            time.sleep(1)
    return pc.Index(PINECONE_INDEX)


def _chunk_text(text: str) -> List[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + CHUNK_SIZE
        chunks.append(text[start:end])
        start += CHUNK_SIZE - CHUNK_OVERLAP
    return [c.strip() for c in chunks if c.strip()]


async def _embed(texts: List[str]) -> List[List[float]]:
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/embeddings",
            json={"model": EMBED_MODEL, "input": texts},
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        )
        resp.raise_for_status()
        data = resp.json()["data"]
        return [d["embedding"] for d in data]


async def ingest_document(text: str, source_name: str) -> int:
    if not PINECONE_ENABLED:
        raise RuntimeError("Pinecone is not configured. Set PINECONE_API_KEY in backend/.env")
    """Chunk, embed, and upsert a regulatory document into Pinecone."""
    chunks = _chunk_text(text)
    index = _get_index()

    batch_size = 50
    total = 0
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        embeddings = await _embed(batch)
        vectors = [
            {
                "id": f"{source_name.replace(' ', '_')}_{i + j}",
                "values": emb,
                "metadata": {"text": chunk, "source": source_name},
            }
            for j, (chunk, emb) in enumerate(zip(batch, embeddings))
        ]
        index.upsert(vectors=vectors)
        total += len(vectors)

    return total


async def retrieve_rules(query_text: str) -> List[str]:
    """Retrieve the most relevant regulatory rule chunks for a given contract text."""
    if not PINECONE_ENABLED:
        return []  # fallback: agents use built-in prompt knowledge
    try:
        index = _get_index()
        embeddings = await _embed([query_text[:2000]])
        results = index.query(
            vector=embeddings[0],
            top_k=TOP_K,
            include_metadata=True,
        )
        chunks = [
            f"[{m['metadata']['source']}] {m['metadata']['text']}"
            for m in results["matches"]
            if m.get("metadata", {}).get("text")
        ]
        return chunks
    except Exception:
        # Graceful fallback — if Pinecone is unavailable, agents run without RAG
        return []
