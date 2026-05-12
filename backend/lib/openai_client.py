import json
import os
import re

import httpx
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")


async def call_openai(
    messages: list[dict],
    json_mode: bool = True,
    max_tokens: int = 4096,
    temperature: float = 0.1,
) -> str:
    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            OPENAI_URL,
            json=payload,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def safe_parse_json(text: str) -> dict:
    """Parse JSON from an OpenAI response, stripping markdown fences if present."""
    text = text.strip()
    # Strip ```json ... ``` fences
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"JSON parse error: {e}\nRaw: {text[:300]}")
