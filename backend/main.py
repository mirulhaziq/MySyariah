import asyncio
import json
import os
from typing import AsyncGenerator

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from agents.extraction import run_extraction_agent
from agents.compliance import run_compliance_checker
from agents.devils_advocate import run_devils_advocate
from agents.orchestrator import run_orchestrator
from agents.board_simulator import run_board_simulator
from lib.pinecone_client import ingest_document, retrieve_rules
from lib.pdf_extract import extract_pdf_text

app = FastAPI(title="mySyariah API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request models ──────────────────────────────────────────────────────────

class AuditRequest(BaseModel):
    contract_text: str | None = None  # plain text (demo contract or pre-extracted)

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    audit_context: dict | None = None


# ── Health ──────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Audit — Server-Sent Events stream ───────────────────────────────────────

def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


_PING = ": ping\n\n"

async def run_agent(coro):
    """Run an agent coroutine, yielding _PING strings every 5 s so the SSE
    connection doesn't silently drop, then yield the result dict/str last."""
    task = asyncio.create_task(coro)
    while not task.done():
        try:
            await asyncio.wait_for(asyncio.shield(task), timeout=5.0)
        except asyncio.TimeoutError:
            pass
        if not task.done():
            yield _PING
    if task.exception():
        raise task.exception()
    yield task.result()


async def audit_stream(contract_text: str) -> AsyncGenerator[str, None]:
    try:
        # ── Agent 1: Extraction ──────────────────────────────────────────
        yield sse("stage", {"id": 1, "status": "running"})
        yield sse("log", {"message": "[Agent 1] Extraction Agent: Sending contract to GPT-4o for clause extraction..."})

        async for chunk in run_agent(run_extraction_agent(contract_text)):
            if chunk is _PING:
                yield _PING
            else:
                manifest = chunk

        yield sse("stage", {"id": 1, "status": "complete"})
        yield sse("log", {"message": f"[Agent 1] Extraction complete. Contract ID: {manifest.get('contract_id')}. Clauses found: {len(manifest.get('clauses', []))}."})

        # ── Agent 2: Compliance ──────────────────────────────────────────
        yield sse("stage", {"id": 2, "status": "running"})
        yield sse("log", {"message": "[Agent 2] Compliance Checker: Retrieving live BNM/AAOIFI rules from knowledge base..."})

        clause_text = " ".join(c.get("raw_text", "") for c in manifest.get("clauses", []))
        rule_chunks = await retrieve_rules(clause_text)
        yield sse("log", {"message": f"[Agent 2] Retrieved {len(rule_chunks)} rule chunk(s). Running compliance check..."})

        async for chunk in run_agent(run_compliance_checker(manifest, rule_chunks)):
            if chunk is _PING:
                yield _PING
            else:
                verdicts = chunk

        yield sse("stage", {"id": 2, "status": "complete"})
        non_compliant = sum(1 for v in verdicts.get("verdicts", []) if v.get("verdict") == "NON_COMPLIANT")
        compliant = sum(1 for v in verdicts.get("verdicts", []) if v.get("verdict") == "COMPLIANT")
        yield sse("log", {"message": f"[Agent 2] Compliance complete. {compliant} COMPLIANT, {non_compliant} NON_COMPLIANT."})

        # ── Agent 3: Devil's Advocate ────────────────────────────────────
        yield sse("stage", {"id": 3, "status": "running"})
        yield sse("log", {"message": "[Agent 3] Devil's Advocate: Probing compliant clauses for hidden Riba, Gharar, Maysir..."})

        compliant_clauses = [
            c for c in manifest.get("clauses", [])
            if any(
                v.get("clause_id") == c.get("id") and v.get("verdict") == "COMPLIANT"
                for v in verdicts.get("verdicts", [])
            )
        ]
        yield sse("log", {"message": f"[Agent 3] Passing {len(compliant_clauses)} COMPLIANT clause(s) to adversarial analysis..."})

        async for chunk in run_agent(run_devils_advocate(compliant_clauses)):
            if chunk is _PING:
                yield _PING
            else:
                adversarial = chunk

        yield sse("stage", {"id": 3, "status": "complete"})
        loopholes = sum(1 for f in adversarial.get("adversarial_findings", []) if f.get("adversarial_finding") == "LOOPHOLE_FOUND")
        yield sse("log", {"message": f"[Agent 3] Devil's Advocate complete. {loopholes} loophole(s) found."})

        # ── Agent 4: Orchestrator ────────────────────────────────────────
        yield sse("stage", {"id": 4, "status": "running"})
        yield sse("log", {"message": "[Agent 4] Orchestrator: Consolidating verdicts. Computing risk score..."})

        async for chunk in run_agent(run_orchestrator(verdicts, adversarial)):
            if chunk is _PING:
                yield _PING
            else:
                pipeline = chunk

        yield sse("stage", {"id": 4, "status": "complete"})
        yield sse("log", {"message": f"[Agent 4] Orchestrator complete. Risk score: {pipeline.get('risk_score')}/100. Escalation: {'YES' if pipeline.get('escalation_required') else 'NO'}."})

        # ── Agent 5: Board Simulator ─────────────────────────────────────
        yield sse("stage", {"id": 5, "status": "running"})
        yield sse("log", {"message": "[Agent 5] Board Simulator: Drafting formal audit dossier..."})

        async for chunk in run_agent(run_board_simulator(pipeline, verdicts, adversarial, manifest)):
            if chunk is _PING:
                yield _PING
            else:
                board_report = chunk

        yield sse("stage", {"id": 5, "status": "complete"})
        yield sse("log", {"message": "[Agent 5] Board Simulator complete. Audit dossier ready."})
        yield sse("log", {"message": "══════════════════════════════════════════════"})
        yield sse("log", {"message": "AUDIT PIPELINE COMPLETE — Report generated successfully."})
        yield sse("log", {"message": "══════════════════════════════════════════════"})

        yield sse("complete", {
            "manifest": manifest,
            "verdicts": verdicts,
            "adversarial": adversarial,
            "pipeline": pipeline,
            "boardReport": board_report,
        })

    except Exception as e:
        yield sse("error", {"message": str(e)})


@app.post("/api/audit/text")
async def audit_text(body: AuditRequest):
    if not body.contract_text:
        raise HTTPException(400, "contract_text is required")
    return StreamingResponse(
        audit_stream(body.contract_text),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/audit/pdf")
async def audit_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted")
    contents = await file.read()
    text = extract_pdf_text(contents)
    return StreamingResponse(
        audit_stream(text),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Chat ─────────────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(body: ChatRequest):
    from lib.openai_client import call_openai

    system = """You are a Shariah compliance assistant for mySyariah, Maybank Islamic's AI audit tool.
Answer questions ONLY about the provided audit results, contract clauses, BNM/AAOIFI rules as applied to this contract, and remediation steps.
Politely decline off-topic questions."""

    if body.audit_context:
        manifest = body.audit_context.get("manifest", {})
        verdicts = body.audit_context.get("verdicts", {})
        adversarial = body.audit_context.get("adversarial", {})
        board = body.audit_context.get("boardReport", "")
        system += f"""

CONTRACT CONTEXT:
Contract ID: {manifest.get('contract_id')}
Summary: {manifest.get('contract_summary')}
Clauses: {json.dumps(manifest.get('clauses', [])[:10])}

COMPLIANCE VERDICTS:
{json.dumps(verdicts.get('verdicts', []))}

ADVERSARIAL FINDINGS:
{json.dumps(adversarial.get('adversarial_findings', []))}

BOARD REPORT EXCERPT:
{str(board)[:1500]}"""

    messages = [{"role": "system", "content": system}]
    for h in body.history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": body.message})

    reply = await call_openai(messages, json_mode=False, max_tokens=500, temperature=0.3)
    return {"reply": reply}


# ── Ingest regulatory document ───────────────────────────────────────────────

@app.post("/api/ingest")
async def ingest(
    file: UploadFile = File(...),
    source_name: str = "BNM/AAOIFI",
):
    """Upload a regulatory PDF (BNM circular, AAOIFI standard, etc.) and index it in Pinecone."""
    contents = await file.read()
    text = extract_pdf_text(contents)
    chunk_count = await ingest_document(text, source_name)
    return {"message": f"Ingested {chunk_count} chunks from '{source_name}' into Pinecone."}
