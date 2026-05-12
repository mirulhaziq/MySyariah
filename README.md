# Auto-Auditor

**AI-powered Shariah compliance auditing for cross-border Murabaha contracts.**

A hackathon prototype that runs a 5-agent GPT-4o pipeline directly in the browser — no backend required. Upload a Murabaha contract PDF and receive a full audit dossier with risk scoring, clause-by-clause verdicts, adversarial analysis, and a simulated Shariah Advisory Board recommendation in under two minutes.

---

## Live Demo

Open `http://localhost:5173` after running `npm run dev`, or deploy to Vercel with `npx vercel --prod`.

No backend. No server. All OpenAI calls are made directly from the browser using your own API key.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| AI | OpenAI GPT-4o (direct fetch) |
| PDF parsing | pdfjs-dist 3.11 (CDN worker) |
| Deploy | Vercel |

---

## Project Structure

```
auto-auditor/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
└── src/
    ├── main.jsx
    ├── App.jsx                        # State machine, audit orchestration
    ├── index.css                      # Global styles, Tailwind, CSS variables
    ├── agents/
    │   ├── extractionAgent.js         # Agent 1 — clause extraction
    │   ├── complianceChecker.js       # Agent 2 — BNM/AAOIFI compliance
    │   ├── devilsAdvocate.js          # Agent 3 — Riba/Gharar/Maysir hunting
    │   ├── orchestrator.js            # Agent 4 — risk scoring & escalation
    │   └── boardSimulator.js          # Agent 5 — formal audit dossier
    ├── components/
    │   ├── Landing.jsx                # API key input + PDF dropzone
    │   ├── AuditRunner.jsx            # Animated 5-stage stepper
    │   ├── Results.jsx                # Full audit results dashboard
    │   ├── RiskGauge.jsx              # SVG circular risk score gauge
    │   ├── ClauseTable.jsx            # Filterable, expandable clause table
    │   └── AdversarialFlags.jsx       # RIBA / GHARAR / MAYSIR finding cards
    └── lib/
        ├── openai.js                  # fetch-based GPT-4o caller + JSON parser
        ├── pdfExtract.js              # pdfjs-dist text extraction
        └── demoContract.js            # Built-in sample Murabaha contract
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An OpenAI API key with GPT-4o access

### Install & run

```bash
git clone <repo-url>
cd auto-auditor
npm install
npm run dev
```

Open `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## User Flow

### 1. Landing Screen

- Enter your OpenAI API key — stored in `localStorage`, never leaves your browser
- Upload a Murabaha contract PDF via drag-and-drop or file picker
- Or click **Use Built-in Demo Contract** to run the audit without a PDF

### 2. Run Audit

Click **RUN SHARIAH AUDIT**. The 5-agent pipeline activates sequentially.

### 3. Audit Running Screen

A live stepper shows each agent's status:

| Stage | Agent | Task |
|---|---|---|
| 1 | Extraction Agent | Parses contract into a structured clause manifest |
| 2 | Compliance Checker | Checks each clause against BNM & AAOIFI standards |
| 3 | Devil's Advocate | Probes compliant clauses for hidden violations |
| 4 | Orchestrator | Computes risk score, flags disputes, triggers escalation |
| 5 | Board Simulator | Drafts formal audit dossier as a Shariah Advisory Board |

A live log stream shows real-time progress from each agent.

### 4. Results Screen

Full audit report with:

- **Status badge** — `APPROVED`, `ESCALATED`, or `REJECTED`
- **Risk score gauge** — circular SVG gauge, colour-coded (green ≤30, amber 31–60, red >60)
- **Summary stats** — total clauses, compliant, non-compliant, disputed counts
- **Escalation banner** — highlighted warning if officer review is required
- **Clause table** — filterable by verdict, expandable rows with full reasoning and citations
- **Adversarial findings** — violation cards tagged RIBA / GHARAR / MAYSIR with severity and challenger arguments
- **Board dossier** — formal audit memo from the Board Simulator agent
- **Audit trail** — timestamped log of every pipeline step
- **Export button** — downloads the full report as a `.txt` file

---

## The 5-Agent Pipeline

All agents call `gpt-4o` via direct browser `fetch`. Each agent's output is the input for the next.

### Agent 1 — Extraction Agent

Parses raw contract text and produces a structured JSON manifest of all clauses, classified by type.

**Clause types:** `PARTIES`, `ASSET`, `COST_PRICE`, `PROFIT_MARGIN`, `OWNERSHIP_TRANSFER`, `PAYMENT_TERMS`, `LATE_PAYMENT`, `GUARANTEE`, `GOVERNING_LAW`, `REBATE`, `TERMINATION`, `OTHER`

**Output:**
```json
{
  "contract_id": "AUTO-1715000000000",
  "contract_summary": "...",
  "jurisdiction": "Malaysia",
  "estimated_value_RM": 2400000,
  "clauses": [
    {
      "id": "C001",
      "type": "PROFIT_MARGIN",
      "raw_text": "...",
      "extracted_value": "...",
      "initial_flags": []
    }
  ]
}
```

### Agent 2 — Compliance Checker

Evaluates each clause against the following standards:

- **BNM Shariah Governance Policy Document (SGPD) 2019**
- **BNM Murabaha Shariah Parameter Reference (SPR 1) 2009**
- **Islamic Financial Services Act (IFSA) 2013**
- **AAOIFI Shariah Standard No. 8 — Murabaha**
- **AAOIFI Shariah Standard No. 3 — Default and Insolvency**

Key rules enforced:
1. Cost price must be explicitly disclosed
2. Profit margin must be fixed at contract inception — not variable
3. Bank must have actual or constructive ownership before sale
4. Asset must be tangible, identified, and Shariah-permissible
5. Late payment penalties must be ta'widh — not compounding interest
6. Ibra (rebate) must not be contractually obligated
7. Cross-border contracts must specify governing law

Every verdict includes a citation (`BNM SPR 1 Section 4.2`, `AAOIFI Standard 8 Article 3`, etc.).

**Output:**
```json
{
  "verdicts": [
    {
      "clause_id": "C004",
      "verdict": "NON_COMPLIANT",
      "confidence": 0.97,
      "citation": "BNM SPR 1 Section 5.1",
      "reasoning": "...",
      "remediation": "..."
    }
  ]
}
```

### Agent 3 — Devil's Advocate

Receives only the clauses marked `COMPLIANT` by Agent 2 and hunts for what the Compliance Checker may have missed.

**Targets:**

| Category | Examples |
|---|---|
| Hidden Riba | Profit linked to KLIBOR/SOFR, fees scaling with balance, guaranteed ibra |
| Hidden Gharar | Vague asset descriptions, conditional ownership transfer, ambiguous governing law |
| Hidden Maysir | Penalty/rebate tied to market performance, option-like mechanisms |

**Output:**
```json
{
  "adversarial_findings": [
    {
      "clause_id": "C009",
      "adversarial_finding": "LOOPHOLE_FOUND",
      "violation_type": "RIBA",
      "severity": "HIGH",
      "finding_detail": "...",
      "argument": "...",
      "recommended_action": "ESCALATE"
    }
  ]
}
```

### Agent 4 — Orchestrator

Merges compliance verdicts and adversarial findings into a final pipeline state.

**Rules:**
- Any `COMPLIANT` clause with a `LOOPHOLE_FOUND` from Agent 3 → promoted to `DISPUTED`
- Escalation triggered if: any clause is `DISPUTED`, contract value > RM 10M, risk score > 60, or fewer than 70% of clauses are compliant

**Risk score formula:**

| Condition | Points |
|---|---|
| Each `NON_COMPLIANT` clause | +20 |
| Each `DISPUTED` clause | +15 |
| Each HIGH severity DA finding | +10 |
| Each MEDIUM severity DA finding | +5 |
| Cap | 100 |

**Output:**
```json
{
  "contract_id": "AUTO-1715000000000",
  "total_clauses": 11,
  "compliant_count": 6,
  "non_compliant_count": 3,
  "disputed_count": 2,
  "risk_score": 85,
  "escalation_required": true,
  "escalation_reason": "...",
  "clause_final_states": [...]
}
```

### Agent 5 — Board Simulator

Acts as a simulated Shariah Advisory Board. Receives the full pipeline output and produces a formal audit dossier structured as:

```
AUTO-AUDITOR AUDIT REPORT
Contract ID: AUTO-...
Date: ...
Status: APPROVED / CONDITIONAL APPROVAL / ESCALATED / REJECTED

EXECUTIVE SUMMARY
...

BOARD RECOMMENDATION
...

KEY FINDINGS
...

ADVERSARIAL FLAGS SUMMARY
...

AUDIT TRAIL NOTE
...
```

This is the only agent that returns plain text rather than JSON.

---

## Built-in Demo Contract

The demo simulates a Murabaha agreement between **Maybank Islamic Berhad** and **Nexus Trading Sdn Bhd** and deliberately contains four Shariah violations:

| Clause | Violation | Rule Violated |
|---|---|---|
| Clause 4 — Profit Margin | KLIBOR-linked variable profit | BNM SPR 1 — profit must be fixed at inception |
| Clause 7 — Late Payment | Compounding monthly penalty (1.5%/month) | AAOIFI Std 3 — penalties must be ta'widh, not compounding |
| Clause 8 — Governing Law | Singapore jurisdiction | BNM SGPD — Malaysian Islamic contracts require Malaysian governing law |
| Clause 9 — Ibra | Contractually guaranteed rebate | BNM SPR 1 — ibra must be discretionary, not obligated |

The expected audit result is **ESCALATED** with a risk score above 60.

---

## Deployment

### Vercel (recommended)

```bash
npx vercel --prod
```

`vercel.json` is pre-configured. No environment variables required — the API key is entered by the user at runtime and stored in their browser's `localStorage`.

### Manual build

```bash
npm run build
# Serve the dist/ folder with any static host
```

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Background | `#0a0a0f` | Page background |
| Surface | `#12121a` | Cards, panels |
| Border | `#1e1e2e` | Card borders, dividers |
| Accent | `#7c3aed` | Primary actions, active states |
| Gold | `#d4a847` | Section headings, decorative |
| Compliant | `#10b981` | Compliant verdicts, approved status |
| Disputed | `#f59e0b` | Disputed verdicts, escalated status |
| Violation | `#ef4444` | Non-compliant verdicts, rejected status |

**Fonts:**
- `Syne` — headings, labels, badges
- `JetBrains Mono` — contract data, audit trail, IDs
- `Outfit` — body copy, descriptions

---

## Standards Reference

| Standard | Full Name | Scope |
|---|---|---|
| BNM SPR 1 | Murabaha Shariah Parameter Reference 2009 | Malaysian Murabaha rules |
| BNM SGPD | Shariah Governance Policy Document 2019 | Malaysian Islamic finance governance |
| IFSA 2013 | Islamic Financial Services Act 2013 | Malaysian Islamic banking law |
| AAOIFI Std 8 | Murabaha and Murabaha to the Purchase Orderer | International Murabaha standards |
| AAOIFI Std 3 | Default and Insolvency | Late payment and default handling |

---

## Limitations

- **Not legal advice.** This tool is an AI prototype and does not constitute a Shariah or legal opinion.
- **Requires countersignature.** All contracts with risk score > 60 or value > RM 10M require review by a licensed Shariah Officer.
- **API key security.** The OpenAI key is stored in `localStorage`. Do not use on shared or public computers.
- **GPT-4o dependency.** Audit quality depends on the model's knowledge of Islamic finance. Edge cases may require human review regardless of the automated verdict.
- **No persistence.** Audit results are not saved. Use the Export button to download a copy before leaving the page.

---

## License

MIT — built as a hackathon prototype.
