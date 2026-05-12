import json

from lib.openai_client import call_openai, safe_parse_json

SYSTEM_PROMPT = """You are the Orchestrator Agent for Auto-Auditor. You receive compliance verdicts and adversarial findings and produce the final pipeline state.

Rules:
- If Devil's Advocate raises LOOPHOLE_FOUND on a COMPLIANT clause, mark it DISPUTED
- Escalation is required if ANY of these are true:
  * Any clause is DISPUTED
  * Estimated contract value > RM 10,000,000
  * Overall risk score > 60
  * Fewer than 70% of clauses are COMPLIANT

Risk score formula:
- Start at 0
- +20 for each NON_COMPLIANT clause
- +15 for each DISPUTED clause
- +10 for each HIGH severity Devil's Advocate finding
- +5 for each MEDIUM severity finding
- Cap at 100

Return ONLY valid JSON, no markdown, no preamble:
{
  "contract_id": "string",
  "total_clauses": number,
  "compliant_count": number,
  "non_compliant_count": number,
  "disputed_count": number,
  "risk_score": number,
  "escalation_required": true or false,
  "escalation_reason": "string or null",
  "clause_final_states": [
    {
      "id": "C001",
      "final_status": "COMPLIANT or NON_COMPLIANT or DISPUTED"
    }
  ]
}"""


async def run_orchestrator(verdicts: dict, adversarial: dict) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Evaluate pipeline state from these findings:\n\n"
                f"COMPLIANCE VERDICTS:\n{json.dumps(verdicts, indent=2)}\n\n"
                f"ADVERSARIAL FINDINGS:\n{json.dumps(adversarial, indent=2)}"
            ),
        },
    ]
    response = await call_openai(messages, json_mode=True)
    return safe_parse_json(response)
