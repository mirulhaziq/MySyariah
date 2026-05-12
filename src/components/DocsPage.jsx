/* ─── mySyariah — System Documentation Page ──────────────────────── */

function Section({ id, number, title, children }) {
  return (
    <section id={id} className="space-y-6">
      <div className="flex items-center gap-4">
        <span
          className="text-3xl font-extrabold"
          style={{ color: '#FFC200', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}
        >
          {String(number).padStart(2, '0')}
        </span>
        <h2
          className="text-2xl font-bold text-white"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #1e1e1e' }} />
      {children}
    </section>
  )
}

function Card({ children, accent }) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        background: '#141414',
        border: `1px solid ${accent ? accent + '30' : '#242424'}`,
        borderLeft: `3px solid ${accent || '#FFC200'}`,
      }}
    >
      {children}
    </div>
  )
}

function Badge({ label, color }) {
  return (
    <span
      className="inline-block text-xs font-bold px-2 py-0.5 rounded"
      style={{
        color,
        background: color + '15',
        border: `1px solid ${color}30`,
        fontFamily: 'Syne, sans-serif',
        letterSpacing: '0.06em',
      }}
    >
      {label}
    </span>
  )
}

/* ─── Section 1: Architecture Diagram ──────────────────────────── */
const AGENTS = [
  {
    id: 'A1',
    role: 'PARSER',
    name: 'Extraction Agent',
    roleLabel: 'Router + Parser',
    color: '#FFC200',
    input: 'Raw contract text (PDF or plain text)',
    output: 'Structured clause manifest (JSON)',
    responsibility:
      'Reads the full contract, identifies every clause, classifies it by type (ASSET, PROFIT_MARGIN, LATE_PAYMENT, etc.), and raises initial red flags. Acts as the entry point that structures unstructured text into a machine-readable format all downstream agents can consume.',
    flags: ['Variable profit rate language', 'Vague asset descriptions', 'Missing ownership transfer'],
  },
  {
    id: 'A2',
    role: 'EXECUTOR',
    name: 'Compliance Checker',
    roleLabel: 'Executor Agent',
    color: '#3b82f6',
    input: 'Clause manifest from Agent 1',
    output: 'Compliance verdicts with citations (JSON)',
    responsibility:
      'Evaluates each clause individually against BNM SPR-1, AAOIFI Standard 8, IFSA 2013, and BNM SGPD 2019. Issues COMPLIANT or NON_COMPLIANT for each clause with a mandatory citation and confidence score. No verdict is issued without a regulatory reference.',
    flags: ['BNM SPR 1 — profit must be fixed', 'AAOIFI Std 3 — ta\'widh only', 'IFSA 2013 — Malaysian jurisdiction'],
  },
  {
    id: 'A3',
    role: 'CRITIC',
    name: "Devil's Advocate",
    roleLabel: 'Critic Agent',
    color: '#a855f7',
    input: 'Clauses marked COMPLIANT by Agent 2',
    output: 'Adversarial findings with violation types (JSON)',
    responsibility:
      'Receives only the clauses that passed Agent 2. Assumes the contract drafter was sophisticated and deliberate. Hunts for hidden Riba (interest), Gharar (uncertainty), and Maysir (speculation) that surface-level compliance checks miss. Outputs LOOPHOLE_FOUND or CLEAR for each clause.',
    flags: ['Benchmark-linked rates (KLIBOR, SOFR)', 'Conditional ownership transfer', 'Guaranteed ibra clauses'],
  },
  {
    id: 'A4',
    role: 'AGGREGATOR',
    name: 'Orchestrator',
    roleLabel: 'Aggregator Agent',
    color: '#f97316',
    input: 'Verdicts (A2) + Adversarial findings (A3)',
    output: 'Final pipeline state with risk score (JSON)',
    responsibility:
      'Merges outputs from all upstream agents. Promotes COMPLIANT clauses with loopholes to DISPUTED. Applies the risk score formula (+20 per NON_COMPLIANT, +15 per DISPUTED, +10 per HIGH finding). Triggers escalation if thresholds are breached. Produces the definitive per-clause final status.',
    flags: ['Risk score > 60 → escalate', 'Contract > RM 10M → escalate', 'Compliance rate < 70% → escalate'],
  },
  {
    id: 'A5',
    role: 'DELIBERATOR',
    name: 'Board Simulator',
    roleLabel: 'Deliberator Agent',
    color: '#22c55e',
    input: 'Full pipeline state from all agents',
    output: 'Formal audit dossier (plain text)',
    responsibility:
      'Acts as a simulated Shariah Advisory Board. Receives the full pipeline context and produces a formal audit dossier with executive summary, board recommendation, key findings, adversarial flags summary, and an audit trail note. Output is always advisory — human countersignature required for high-risk contracts.',
    flags: ['APPROVED', 'CONDITIONAL APPROVAL', 'ESCALATED', 'REJECTED'],
  },
]

/* ─── Section 2: Tool Definitions ───────────────────────────────── */
const TOOLS = [
  {
    name: 'OpenAI GPT-4o',
    type: 'LLM API',
    provider: 'External — OpenAI',
    purpose: 'Powers all 5 AI agents. Used for clause extraction, compliance checking, adversarial probing, risk orchestration, board simulation, and the chat assistant.',
    status: 'LIVE',
    statusColor: '#22c55e',
    endpoint: 'api.openai.com/v1/chat/completions',
    auth: 'Bearer API key (user-supplied)',
  },
  {
    name: 'pdfjs-dist 3.x',
    type: 'Client Library',
    provider: 'Mozilla (CDN worker)',
    purpose: 'Client-side PDF parsing. Extracts text content from uploaded Murabaha contract PDFs page by page without any server upload.',
    status: 'LIVE',
    statusColor: '#22c55e',
    endpoint: 'cdnjs (worker) + npm bundle',
    auth: 'None',
  },
  {
    name: 'BNM SPR-1 2009',
    type: 'Regulatory Knowledge',
    provider: 'Bank Negara Malaysia',
    purpose: 'Murabaha Shariah Parameter Reference rules embedded into Agent 2 and Agent 3 system prompts as compliance standards.',
    status: 'EMBEDDED',
    statusColor: '#FFC200',
    endpoint: 'Prompt-level knowledge',
    auth: 'N/A',
  },
  {
    name: 'AAOIFI Standards 8 & 3',
    type: 'Regulatory Knowledge',
    provider: 'AAOIFI',
    purpose: 'International Murabaha (Std 8) and Default/Insolvency (Std 3) standards embedded in agent prompts.',
    status: 'EMBEDDED',
    statusColor: '#FFC200',
    endpoint: 'Prompt-level knowledge',
    auth: 'N/A',
  },
  {
    name: 'JAKIM Halal Database',
    type: 'External API',
    provider: 'JAKIM Malaysia',
    purpose: 'Would verify that the financed asset is halal-certified. Currently checked via Agent 1 prompt heuristics only.',
    status: 'PLANNED',
    statusColor: '#4a4a4a',
    endpoint: 'api.jakim.gov.my (TBD)',
    auth: 'Government API key',
  },
  {
    name: 'BNM BNMLINK API',
    type: 'External API',
    provider: 'Bank Negara Malaysia',
    purpose: 'Live regulatory updates, BNM policy changes, and SPR amendment feeds to keep compliance rules current.',
    status: 'PLANNED',
    statusColor: '#4a4a4a',
    endpoint: 'api.bnm.gov.my (TBD)',
    auth: 'Institutional API key',
  },
  {
    name: 'Core Banking System',
    type: 'Internal API',
    provider: 'Maybank Internal',
    purpose: 'Verify contract value against live disbursement records, check customer financing history, and validate counterparty KYC status.',
    status: 'PLANNED',
    statusColor: '#4a4a4a',
    endpoint: 'Internal microservice (TBD)',
    auth: 'mTLS + OAuth 2.0',
  },
  {
    name: 'WhatsApp Business API',
    type: 'Notification API',
    provider: 'Meta',
    purpose: 'Push escalation alerts to the assigned Shariah Officer when a contract triggers human-in-the-loop review.',
    status: 'PLANNED',
    statusColor: '#4a4a4a',
    endpoint: 'graph.facebook.com/v18.0/messages',
    auth: 'Bearer token',
  },
]

/* ─── Section 3: Guardrails ─────────────────────────────────────── */
const GUARDRAILS = [
  {
    title: 'JSON Schema Validation + safeStr()',
    color: '#FFC200',
    icon: '🔒',
    problem: 'GPT-4o sometimes returns objects or arrays where strings are expected, crashing the renderer.',
    solution: 'Every agent response is parsed with safeParseJSON(). All rendered values pass through safeStr(), which coerces objects → "key: value | …", arrays → comma-joined, null → "—". A React ErrorBoundary catches any remaining render failures.',
    trigger: 'Every API response, every render cycle.',
  },
  {
    title: 'No Auto-Approval Gate',
    color: '#ef4444',
    icon: '🚫',
    problem: 'An AI model could hallucinate a clean compliance result for a contract with serious Riba violations.',
    solution: 'The Board Simulator (Agent 5) is explicitly prompted: output is ALWAYS advisory. The UI shows a "Requires Shariah Officer Review" banner and the dossier contains an Audit Trail Note stating countersignature is mandatory for risk score > 60 or value > RM 10M. The app has no "approve" button.',
    trigger: 'Every audit, without exception.',
  },
  {
    title: 'Sequential Pipeline Isolation',
    color: '#3b82f6',
    icon: '🔗',
    problem: 'If agents share a single prompt context, earlier errors contaminate later reasoning.',
    solution: 'Each agent is a separate OpenAI API call with its own system prompt and only the specific prior outputs it needs. Agent 3 receives only COMPLIANT clauses — it cannot see NON_COMPLIANT ones and cannot reverse Agent 2\'s findings.',
    trigger: 'By design — pipeline architecture.',
  },
  {
    title: 'Confidence Scoring',
    color: '#a855f7',
    icon: '📊',
    problem: 'Agent 2 may lack sufficient context to confidently evaluate an unusual clause.',
    solution: 'The Compliance Checker returns a confidence score (0.0–1.0) for each verdict. Verdicts with confidence < 0.7 are flagged in the prompt instructions for conservative treatment. Scores are visible in the exported report.',
    trigger: 'Agent 2 response parsing.',
  },
  {
    title: 'Adversarial Second Opinion',
    color: '#f97316',
    icon: '👿',
    problem: 'A single compliance agent may be fooled by sophisticated drafting that technically complies but violates the spirit of Shariah.',
    solution: 'The Devil\'s Advocate agent (Agent 3) is a mandatory second pass on ALL compliant clauses. It is prompted to assume bad faith by the drafter and to construct the strongest possible challenge. Any LOOPHOLE_FOUND automatically promotes the clause to DISPUTED.',
    trigger: 'Every clause marked COMPLIANT by Agent 2.',
  },
  {
    title: 'API Key Security',
    color: '#22c55e',
    icon: '🔑',
    problem: 'User\'s OpenAI key must not be logged, proxied, or exposed to third parties.',
    solution: 'The key is stored only in the user\'s own browser localStorage. All API calls are made directly from the user\'s browser to OpenAI — there is no backend server, no proxy, and no analytics. The .gitignore excludes .env from version control.',
    trigger: 'Architecture-level — no server exists.',
  },
  {
    title: 'Context-Scoped Chatbot',
    color: '#FFC200',
    icon: '💬',
    problem: 'A general-purpose chatbot could answer off-topic queries or hallucinate contract details.',
    solution: 'The chatbot system prompt explicitly restricts answers to: this specific contract, its audit findings, BNM/AAOIFI rules as applied to this contract, and remediation steps. Off-topic questions receive a polite refusal. The context window includes the full clause manifest, verdicts, and adversarial findings.',
    trigger: 'Every chatbot message.',
  },
]

/* ─── Section 4: HITL ───────────────────────────────────────────── */
const HITL_STEPS = [
  {
    trigger: 'Risk Score > 60',
    actor: 'Shariah Officer',
    action: 'Full manual review of all NON_COMPLIANT and DISPUTED clauses. Officer must sign off before contract proceeds.',
    automated: 'Orchestrator computes score, sets escalation_required = true. UI shows orange escalation banner.',
    urgency: 'MANDATORY',
    color: '#ef4444',
  },
  {
    trigger: 'Contract Value > RM 10,000,000',
    actor: 'Senior Shariah Officer + Legal',
    action: 'Senior officer countersignature and legal review. Board Simulator dossier is submitted to the full Shariah Advisory Board.',
    automated: 'Orchestrator checks estimated_value_RM from manifest. Escalation triggered regardless of risk score.',
    urgency: 'MANDATORY',
    color: '#ef4444',
  },
  {
    trigger: 'Any DISPUTED Clause',
    actor: 'Shariah Officer',
    action: 'Officer reviews the specific disputed clause, the Devil\'s Advocate argument, and the original contract text. Makes final ruling: compliant, remediate, or reject.',
    automated: 'Orchestrator promotes COMPLIANT → DISPUTED when Agent 3 returns LOOPHOLE_FOUND.',
    urgency: 'MANDATORY',
    color: '#f97316',
  },
  {
    trigger: 'Compliance Rate < 70%',
    actor: 'Shariah Officer + Contract Drafting Team',
    action: 'Full contract redraft required. Officer issues formal rejection notice with clause-by-clause remediation requirements from the audit report.',
    automated: 'Orchestrator calculates (compliant_count / total_clauses) < 0.7 → escalation.',
    urgency: 'MANDATORY',
    color: '#f97316',
  },
  {
    trigger: 'Non-Malaysian Governing Law',
    actor: 'Legal Counsel + Compliance',
    action: 'Legal team assesses whether foreign jurisdiction conflicts with IFSA 2013 requirements. May require dual-jurisdiction opinion letter.',
    automated: 'Agent 1 flags GOVERNING_LAW clause. Agent 2 cites BNM SGPD 2019. Orchestrator escalates.',
    urgency: 'REVIEW',
    color: '#FFC200',
  },
  {
    trigger: 'Agent Confidence Score < 0.7',
    actor: 'Shariah Compliance Analyst',
    action: 'Analyst manually reviews the low-confidence clause against the full BNM/AAOIFI standard referenced. Updates verdict in the exported report.',
    automated: 'Agent 2 sets confidence < 0.7. Visible in exported .txt report under each verdict.',
    urgency: 'REVIEW',
    color: '#FFC200',
  },
  {
    trigger: 'Devil\'s Advocate recommends ESCALATE',
    actor: 'Shariah Officer',
    action: 'Immediate escalation regardless of overall risk score. Officer reviews the specific adversarial argument and determines if the clause constitutes a Shariah prohibition.',
    automated: 'Agent 3 sets recommended_action = ESCALATE. Orchestrator triggers escalation.',
    urgency: 'MANDATORY',
    color: '#ef4444',
  },
]

/* ─── Main export ────────────────────────────────────────────────── */
export default function DocsPage({ onBack }) {
  const sections = [
    { id: 'architecture', label: 'Agent Architecture' },
    { id: 'tools', label: 'Tool Definitions' },
    { id: 'guardrails', label: 'Guardrails & Safety' },
    { id: 'hitl', label: 'Human-in-the-Loop' },
  ]

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── Top bar ── */}
      <header style={{ background: '#000', borderBottom: '2px solid #FFC200', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm transition-fast"
              style={{ color: '#a0a0a0', fontFamily: 'Syne, sans-serif' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFC200'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
            <div className="h-4 w-px" style={{ background: '#1e1e1e' }} />
            <div className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="6" fill="#FFC200" />
                <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle"
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, fill: '#000' }}>M</text>
              </svg>
              <span className="logo-text text-white text-base">
                my<span style={{ color: '#FFC200' }}>Syariah</span>
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,194,0,0.1)', color: '#FFC200', border: '1px solid rgba(255,194,0,0.2)', fontFamily: 'Syne, sans-serif' }}
            >
              SYSTEM DOCS
            </span>
          </div>

          {/* Section nav */}
          <div className="hidden md:flex items-center gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="text-xs px-3 py-1.5 rounded transition-fast"
                style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#FFC200'; e.currentTarget.style.background = 'rgba(255,194,0,0.06)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#4a4a4a'; e.currentTarget.style.background = 'transparent' }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10">
        <div className="mb-2">
          <span className="text-xs font-bold tracking-widest" style={{ color: '#FFC200', fontFamily: 'Syne, sans-serif' }}>
            TECHNICAL DOCUMENTATION
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>
          mySyariah<br />
          <span style={{ color: '#FFC200' }}>System Architecture</span>
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: '#a0a0a0' }}>
          A multi-agent AI pipeline for Shariah compliance auditing of cross-border Murabaha contracts.
          Built for Maybank Islamic — powered by GPT-4o, governed by BNM SPR-1 and AAOIFI Standard 8.
        </p>

        {/* Quick stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'AI Agents', value: '5' },
            { label: 'Standards', value: '5' },
            { label: 'HITL Triggers', value: '7' },
            { label: 'Guardrails', value: '7' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center" style={{ borderColor: '#1e1e1e' }}>
              <div className="text-3xl font-bold mono" style={{ color: '#FFC200' }}>{s.value}</div>
              <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-20">

        {/* ════════ SECTION 1: ARCHITECTURE ════════ */}
        <Section id="architecture" number={1} title="Agent Architecture Diagram">
          <p style={{ color: '#a0a0a0' }} className="text-sm leading-relaxed">
            mySyariah uses a sequential 5-agent pipeline. Each agent has a distinct cognitive role drawn from
            multi-agent system design: one agent parses, one executes compliance checks, one critiques,
            one aggregates, and one deliberates. No agent can see future agents' outputs or reverse past decisions.
          </p>

          {/* System Architecture Diagram */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #242424', background: '#0d0d0d' }}
          >
            <div
              className="px-4 py-2 flex items-center gap-2"
              style={{ borderBottom: '1px solid #1a1a1a', background: '#111' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#FFC200' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs ml-2 mono" style={{ color: '#4a4a4a' }}>
                auto-auditor — end-to-end multi-agent system
              </span>
            </div>
            <img
              src="/agent-architecture.png"
              alt="Auto-Auditor End-to-End Multi-Agent System Architecture"
              className="w-full block"
              style={{ maxHeight: 520, objectFit: 'contain', background: '#0d0d0d' }}
            />
          </div>

          {/* Pipeline flow */}
          <div className="relative">
            {/* Input node */}
            <div className="flex justify-center mb-2">
              <div className="px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: '#1e1e1e', color: '#a0a0a0', border: '1px solid #2e2e2e', fontFamily: 'Syne, sans-serif' }}>
                INPUT: Contract PDF or plain text
              </div>
            </div>

            {/* Agents */}
            <div className="space-y-0">
              {AGENTS.map((agent, i) => (
                <div key={agent.id} className="flex flex-col items-center">
                  {/* Arrow down */}
                  <div className="flex flex-col items-center" style={{ height: 32 }}>
                    <div style={{ width: 2, flex: 1, background: `${agent.color}40` }} />
                    <svg width="12" height="8" viewBox="0 0 12 8" fill={agent.color} style={{ opacity: 0.6 }}>
                      <path d="M6 8L0 0h12z" />
                    </svg>
                  </div>

                  {/* Agent card */}
                  <div className="w-full rounded-lg overflow-hidden"
                    style={{ border: `1px solid ${agent.color}25`, background: '#141414' }}>
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: `1px solid ${agent.color}20`, background: `${agent.color}08` }}>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: agent.color, color: '#000', fontFamily: 'Syne, sans-serif' }}>
                        {agent.id}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {agent.name}
                          </span>
                          <Badge label={agent.role} color={agent.color} />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#4a4a4a' }}>{agent.roleLabel}</p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="px-5 py-4 grid sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-semibold uppercase tracking-wider mb-1"
                          style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>Input</p>
                        <p style={{ color: '#a0a0a0' }}>{agent.input}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wider mb-1"
                          style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>Output</p>
                        <p style={{ color: '#a0a0a0' }}>{agent.output}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wider mb-1"
                          style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>Flags Raised On</p>
                        <ul className="space-y-0.5">
                          {agent.flags.map((f) => (
                            <li key={f} className="flex items-start gap-1.5" style={{ color: '#a0a0a0' }}>
                              <span style={{ color: agent.color, marginTop: 2 }}>›</span>{f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Responsibility */}
                    <div className="px-5 pb-4">
                      <p className="text-xs leading-relaxed" style={{ color: '#666' }}>
                        <span style={{ color: agent.color, fontWeight: 600 }}>Role: </span>
                        {agent.responsibility}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final arrow + output */}
            <div className="flex flex-col items-center">
              <div style={{ width: 2, height: 32, background: 'rgba(34,197,94,0.4)' }} />
              <div className="px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', fontFamily: 'Syne, sans-serif' }}>
                OUTPUT: Audit Report + Interactive Chatbot
              </div>
            </div>
          </div>
        </Section>

        {/* ════════ SECTION 2: TOOL DEFINITIONS ════════ */}
        <Section id="tools" number={2} title="Tool Definitions">
          <p style={{ color: '#a0a0a0' }} className="text-sm leading-relaxed">
            The table below lists every API, library, and knowledge source used by the mySyariah pipeline —
            both currently live and planned for future integration.
          </p>

          <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #1e1e1e' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Outfit, sans-serif' }}>
              <thead>
                <tr style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e' }}>
                  {['Tool / API', 'Type', 'Provider', 'Purpose', 'Auth', 'Status'].map((h) => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: 11,
                      fontFamily: 'Syne, sans-serif', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', color: '#4a4a4a',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t, i) => (
                  <tr key={t.name}
                    style={{ borderBottom: i < TOOLS.length - 1 ? '1px solid #141414' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="font-semibold text-white text-sm">{t.name}</span>
                      <div className="text-xs mt-0.5 mono" style={{ color: '#4a4a4a' }}>{t.endpoint}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge label={t.type} color="#FFC200" />
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#a0a0a0' }}>{t.provider}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: '#a0a0a0', maxWidth: 260 }}>{t.purpose}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>{t.auth}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ color: t.statusColor, background: t.statusColor + '15', border: `1px solid ${t.statusColor}30`, fontFamily: 'Syne, sans-serif' }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Card>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#FFC200', fontFamily: 'Syne, sans-serif' }}>
              No-Backend Architecture
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
              All tool calls are made directly from the user's browser. There is no server, proxy, or middleware.
              The OpenAI API key is stored in the user's own localStorage and sent only to <span className="mono text-xs" style={{ color: '#FFC200' }}>api.openai.com</span>.
              PDF text extraction runs entirely client-side via pdfjs-dist. No contract data ever leaves the user's device
              except for the OpenAI API call.
            </p>
          </Card>
        </Section>

        {/* ════════ SECTION 3: GUARDRAILS ════════ */}
        <Section id="guardrails" number={3} title="Guardrails & Safety">
          <p style={{ color: '#a0a0a0' }} className="text-sm leading-relaxed">
            mySyariah implements defence-in-depth across the LLM pipeline, data layer, and UI rendering layer.
            No single guardrail is relied upon exclusively — failures are caught at multiple checkpoints.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {GUARDRAILS.map((g) => (
              <Card key={g.title} accent={g.color}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{g.icon}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {g.title}
                    </h4>
                    <p className="text-xs mt-0.5" style={{ color: '#4a4a4a' }}>Triggered: {g.trigger}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                      style={{ color: '#ef4444', fontFamily: 'Syne, sans-serif' }}>Risk</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#a0a0a0' }}>{g.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                      style={{ color: '#22c55e', fontFamily: 'Syne, sans-serif' }}>Mitigation</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#a0a0a0' }}>{g.solution}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ════════ SECTION 4: HITL ════════ */}
        <Section id="hitl" number={4} title="Human-in-the-Loop (HITL) Strategy">
          <p style={{ color: '#a0a0a0' }} className="text-sm leading-relaxed">
            mySyariah is designed as an <strong style={{ color: '#fff' }}>AI-assisted</strong> audit tool, not an autonomous decision-maker.
            The following decision points always require a qualified human Shariah Officer to intervene
            before a contract can proceed. The system never approves a contract — it only recommends.
          </p>

          {/* HITL principle box */}
          <div className="rounded-lg p-5" style={{ background: 'rgba(255,194,0,0.06)', border: '1px solid rgba(255,194,0,0.2)' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#FFC200', fontFamily: 'Syne, sans-serif' }}>
              Core Principle
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
              The AI pipeline's role is to <strong style={{ color: '#fff' }}>surface, structure, and prioritise</strong> compliance
              issues — not to resolve them. Every audit report ends with an Audit Trail Note confirming
              that human countersignature is required for any contract with risk score &gt; 60 or value &gt; RM 10M.
              The "APPROVE" decision belongs exclusively to a licensed Shariah Officer.
            </p>
          </div>

          {/* HITL steps */}
          <div className="space-y-4">
            {HITL_STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center" style={{ width: 36, flexShrink: 0 }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: step.color + '15', border: `2px solid ${step.color}40`, color: step.color, fontFamily: 'Syne, sans-serif' }}>
                    {i + 1}
                  </div>
                  {i < HITL_STEPS.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: '#1e1e1e', marginTop: 4 }} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>
                      {step.trigger}
                    </span>
                    <Badge
                      label={step.urgency}
                      color={step.urgency === 'MANDATORY' ? '#ef4444' : '#FFC200'}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded p-3" style={{ background: '#141414', border: '1px solid #1e1e1e' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: '#a0a0a0', fontFamily: 'Syne, sans-serif' }}>
                        🤖 Automated Action
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{step.automated}</p>
                    </div>
                    <div className="rounded p-3" style={{ background: '#141414', border: `1px solid ${step.color}20` }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1"
                        style={{ color: step.color, fontFamily: 'Syne, sans-serif' }}>
                        👤 Human: {step.actor}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#a0a0a0' }}>{step.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 32, textAlign: 'center' }}>
          <p className="text-xs" style={{ color: '#4a4a4a' }}>
            mySyariah System Documentation — Maybank Islamic Prototype © {new Date().getFullYear()}.
            For internal use only. All AI outputs require Shariah Officer validation before contract execution.
          </p>
        </div>
      </div>
    </div>
  )
}
