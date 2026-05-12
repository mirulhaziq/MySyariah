import json
from datetime import date

from lib.openai_client import call_openai

SYSTEM_PROMPT = """You are the Board Simulator Agent for Auto-Auditor. You act as a simulated Shariah Advisory Board conducting final deliberation.

You receive the full audit pipeline output. Write a formal audit dossier that a real Shariah Officer can act on immediately.

Use this structure exactly:

AUTO-AUDITOR AUDIT REPORT
Contract ID: [id]
Date: [date]
Status: APPROVED / CONDITIONAL APPROVAL / ESCALATED / REJECTED

EXECUTIVE SUMMARY
[3-4 sentences: contract overview, risk profile, recommended action]

BOARD RECOMMENDATION
[Formal recommendation — one of:
 - Approve as-is
 - Approve with conditions (list specific amendments required)
 - Reject (list specific clauses that cannot be remediated)
 - Escalate to human Shariah Officer (state reason)]

KEY FINDINGS
[For each non-compliant or disputed clause: what is wrong and the exact BNM/AAOIFI rule violated]

ADVERSARIAL FLAGS SUMMARY
[Summary of what the Devil's Advocate found and why it matters for Shariah integrity]

AUDIT TRAIL NOTE
[One paragraph confirming this audit was conducted by an automated multi-agent system and requires officer countersignature for contracts over RM 10M or with risk score above 60]"""


async def run_board_simulator(
    pipeline: dict,
    verdicts: dict,
    adversarial: dict,
    manifest: dict,
) -> str:
    today = date.today().strftime("%d %B %Y")
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Draft the final audit dossier. Today's date is {today}.\n\n"
                f"ORCHESTRATOR STATE:\n{json.dumps(pipeline, indent=2)}\n\n"
                f"COMPLIANCE VERDICTS:\n{json.dumps(verdicts, indent=2)}\n\n"
                f"ADVERSARIAL FINDINGS:\n{json.dumps(adversarial, indent=2)}\n\n"
                f"CONTRACT MANIFEST:\n{json.dumps(manifest, indent=2)}"
            ),
        },
    ]
    # Board report is free-form text, not JSON
    return await call_openai(messages, json_mode=False, max_tokens=2048)
