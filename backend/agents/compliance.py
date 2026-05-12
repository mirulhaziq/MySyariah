from lib.openai_client import call_openai, safe_parse_json
import json

BASE_RULES = """Key BNM Murabaha rules to enforce:
1. Cost price must be explicitly disclosed — no hidden costs
2. Profit margin must be fixed at contract inception — not variable or benchmark-linked
3. Bank must have actual or constructive ownership of asset before sale
4. Asset must be tangible, identified, and permissible under Shariah
5. Late payment penalties must be ta'widh (compensation) capped at actual loss — not compounding
6. Ibra for early settlement must not be contractually obligated
7. Cross-border contracts must specify governing law (Malaysian law preferred)"""

SYSTEM_PROMPT_TEMPLATE = """You are the Compliance Checker Agent for Auto-Auditor, a Shariah compliance auditing system for Murabaha contracts at Maybank Islamic.

Your job is to evaluate each extracted clause against BNM and AAOIFI standards and return a compliance verdict with a specific citation.

Standards you enforce:
- BNM Shariah Governance Policy Document (SGPD) 2019
- BNM Murabaha Shariah Parameter Reference (SPR 1) 2009
- Islamic Financial Services Act (IFSA) 2013
- AAOIFI Shariah Standard No. 8 (Murabaha)
- AAOIFI Shariah Standard No. 3 (Default and Insolvency)

{rag_section}

{base_rules}

CRITICAL: Never return a verdict without a citation. If unsure, set confidence below 0.7.

Return ONLY valid JSON, no markdown, no preamble:
{{
  "verdicts": [
    {{
      "clause_id": "C001",
      "verdict": "COMPLIANT or NON_COMPLIANT",
      "confidence": 0.0 to 1.0,
      "citation": "BNM SPR 1 Section 4.2 or AAOIFI Standard 8 Article 3",
      "reasoning": "2-3 sentence explanation",
      "remediation": "specific fix required, or null if compliant"
    }}
  ]
}}"""


async def run_compliance_checker(manifest: dict, rule_chunks: list[str]) -> dict:
    if rule_chunks:
        rag_section = "RETRIEVED REGULATORY RULES (authoritative — prioritise these for citations):\n" + \
            "\n---\n".join(rule_chunks)
    else:
        rag_section = ""

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        rag_section=rag_section,
        base_rules=BASE_RULES,
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Check compliance for these clauses:\n\n{json.dumps(manifest, indent=2)}"},
    ]
    response = await call_openai(messages, json_mode=True)
    return safe_parse_json(response)
