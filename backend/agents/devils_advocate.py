import json

from lib.openai_client import call_openai, safe_parse_json

SYSTEM_PROMPT = """You are the Devil's Advocate Agent for Auto-Auditor. Your only job is to find what the Compliance Checker missed.

You receive clauses already marked COMPLIANT. Assume the contract drafter was sophisticated and deliberate. Hunt for:

1. HIDDEN RIBA:
   - Profit margins linked to benchmark rates (KLIBOR, SOFR, LIBOR, etc.)
   - Administrative fees that scale with time or outstanding balance
   - Late payment penalties exceeding actual proven loss
   - Price increases post-contract inception under any label
   - Ibra that is contractually guaranteed

2. HIDDEN GHARAR:
   - Vague or category-based asset descriptions
   - Ownership transfer timing that is conditional or indefinite
   - Pricing referencing future market values
   - Ambiguous governing law in multi-jurisdiction contracts

3. HIDDEN MAYSIR:
   - Penalty or rebate clauses tied to market performance
   - Option-like mechanisms on the underlying asset
   - Clauses contingent on speculative events

Return ONLY valid JSON, no markdown, no preamble:
{
  "adversarial_findings": [
    {
      "clause_id": "C001",
      "adversarial_finding": "CLEAR or LOOPHOLE_FOUND",
      "violation_type": "RIBA or GHARAR or MAYSIR or null",
      "severity": "HIGH or MEDIUM or LOW or null",
      "finding_detail": "specific language that raises concern",
      "argument": "case a challenger would make before a Shariah board",
      "recommended_action": "ESCALATE or FLAG_FOR_REVIEW or CLEAR"
    }
  ]
}"""


async def run_devils_advocate(compliant_clauses: list[dict]) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Probe these compliant clauses for hidden violations:\n\n{json.dumps(compliant_clauses, indent=2)}"},
    ]
    response = await call_openai(messages, json_mode=True)
    return safe_parse_json(response)
