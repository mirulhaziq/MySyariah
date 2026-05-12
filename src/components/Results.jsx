import RiskGauge from './RiskGauge'
import ClauseTable from './ClauseTable'
import AdversarialFlags from './AdversarialFlags'
import { safeStr } from '../lib/safeStr'

function getOverallStatus(pipeline) {
  if (!pipeline) return { status: 'UNKNOWN', color: '#a0a0a0' }
  const risk_score = Number(pipeline.risk_score) || 0
  const non_compliant_count = Number(pipeline.non_compliant_count) || 0
  const escalation_required = Boolean(pipeline.escalation_required)
  if (non_compliant_count > 0 && risk_score > 60) return { status: 'REJECTED', color: '#ef4444' }
  if (escalation_required) return { status: 'ESCALATED', color: '#f97316' }
  if (risk_score <= 30 && non_compliant_count === 0) return { status: 'APPROVED', color: '#22c55e' }
  return { status: 'ESCALATED', color: '#f97316' }
}

function Section({ title, children }) {
  return (
    <div className="card card-glow" style={{ borderColor: '#242424' }}>
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid #1a1a1a' }}
      >
        <span className="w-1 h-4 rounded-full" style={{ background: '#FFC200' }} />
        <h3
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: '#a0a0a0', fontFamily: 'Syne, sans-serif' }}
        >
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold mono" style={{ color: color || '#fff' }}>{value}</div>
      <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>
        {label}
      </div>
    </div>
  )
}

function exportReport(results, auditTrail) {
  const { manifest, verdicts, adversarial, pipeline, boardReport } = results

  const header = `
╔══════════════════════════════════════════════════════════════╗
║              mySyariah AUDIT REPORT                          ║
║              Maybank Islamic Compliance AI                   ║
╚══════════════════════════════════════════════════════════════╝

Contract ID   : ${pipeline?.contract_id || 'N/A'}
Exported      : ${new Date().toLocaleString('en-GB')}
Risk Score    : ${pipeline?.risk_score ?? 'N/A'}/100
Escalation    : ${pipeline?.escalation_required ? 'REQUIRED — ' + (pipeline?.escalation_reason || '') : 'NOT REQUIRED'}
`.trim()

  const clauseSection = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLAUSE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${(verdicts?.verdicts ?? []).map((v) =>
`[${v.clause_id}] ${v.verdict} (confidence: ${((v.confidence || 0) * 100).toFixed(0)}%)
  Citation   : ${v.citation || 'N/A'}
  Reasoning  : ${v.reasoning || 'N/A'}
  Remediation: ${v.remediation || 'None required'}
`).join('\n')}`

  const adversarialSection = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVERSARIAL FINDINGS (Devil's Advocate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${(adversarial?.adversarial_findings ?? []).filter((f) => f.adversarial_finding === 'LOOPHOLE_FOUND')
    .map((f) =>
`[${f.clause_id}] ${f.violation_type || 'FLAGGED'} — Severity: ${f.severity || 'N/A'}
  Finding : ${f.finding_detail || 'N/A'}
  Argument: ${f.argument || 'N/A'}
  Action  : ${f.recommended_action || 'N/A'}
`).join('\n') || '  No loopholes found.'}`

  const boardSection = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOARD SIMULATOR AUDIT DOSSIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${boardReport || 'N/A'}`

  const trailSection = `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT TRAIL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${auditTrail.map((e) => `[${new Date(e.ts).toISOString()}] ${e.message}`).join('\n')}`

  const full = [header, clauseSection, adversarialSection, boardSection, trailSection].join('\n')
  const blob = new Blob([full], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mysyariah-${pipeline?.contract_id || 'report'}-${Date.now()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function Results({ results, auditTrail, onNewAudit, onOpenDocs }) {
  const { manifest, verdicts, adversarial, pipeline, boardReport } = results
  const { status, color: statusColor } = getOverallStatus(pipeline)
  const loopholeCount = (adversarial?.adversarial_findings ?? []).filter(
    (f) => f.adversarial_finding === 'LOOPHOLE_FOUND'
  ).length

  return (
    <div className="min-h-screen">

      {/* Top yellow line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #FFC200, #FFD940, #FFC200)' }} />

      {/* Sticky header */}
      <div
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(10,10,10,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1a1a1a',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="6" fill="#FFC200" />
                <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle"
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, fill: '#000' }}>
                  M
                </text>
              </svg>
              <span className="logo-text text-white text-sm">
                my<span style={{ color: '#FFC200' }}>Syariah</span>
              </span>
            </div>

            <div className="h-4 w-px" style={{ background: '#2e2e2e' }} />

            <span className="mono text-xs" style={{ color: '#a0a0a0' }}>
              {pipeline?.contract_id || 'N/A'}
            </span>

            <span
              className="text-xs font-bold px-3 py-1 rounded"
              style={{
                color: status === 'APPROVED' ? '#000' : statusColor,
                background: status === 'APPROVED' ? statusColor : `${statusColor}18`,
                border: status === 'APPROVED' ? 'none' : `1px solid ${statusColor}40`,
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.08em',
              }}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 text-xs px-4 py-2 rounded border transition-fast"
              style={{
                borderColor: '#2e2e2e',
                color: '#a0a0a0',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOCUMENTATION
            </button>
            <button
              onClick={() => exportReport(results, auditTrail)}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded border transition-fast"
              style={{
                borderColor: '#2e2e2e',
                color: '#a0a0a0',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              EXPORT
            </button>
            <button
              onClick={onNewAudit}
              className="text-xs px-4 py-2 rounded font-bold transition-fast"
              style={{
                background: '#FFC200',
                color: '#000',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              NEW AUDIT
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Risk gauge */}
          <div className="card card-glow p-6 flex flex-col items-center justify-center gap-3"
            style={{ borderColor: '#242424' }}>
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>
              Risk Score
            </p>
            <RiskGauge score={pipeline?.risk_score ?? 0} />
          </div>

          {/* Stats */}
          <div className="card card-glow p-6 grid grid-cols-2 gap-6 items-center"
            style={{ borderColor: '#242424' }}>
            <Stat label="Total Clauses" value={pipeline?.total_clauses ?? '—'} />
            <Stat label="Compliant" value={pipeline?.compliant_count ?? '—'} color="#22c55e" />
            <Stat label="Non-Compliant" value={pipeline?.non_compliant_count ?? '—'} color="#ef4444" />
            <Stat label="Disputed" value={pipeline?.disputed_count ?? '—'} color="#f97316" />
          </div>

          {/* Status card */}
          <div
            className="card card-glow p-6 flex flex-col justify-between"
            style={{ borderColor: `${statusColor}20` }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>
                Audit Status
              </p>
              <p
                className="text-4xl font-extrabold leading-none"
                style={{ color: statusColor, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
              >
                {status}
              </p>
              {pipeline?.escalation_reason && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: '#a0a0a0' }}>
                  {safeStr(pipeline.escalation_reason)}
                </p>
              )}
            </div>
            <div className="mt-4 space-y-1.5">
              {[
                { label: 'Jurisdiction', value: safeStr(manifest?.jurisdiction) },
                {
                  label: 'Est. Value',
                  value: manifest?.estimated_value_RM
                    ? `RM ${Number(manifest.estimated_value_RM).toLocaleString()}`
                    : '—',
                },
                { label: 'DA Flags', value: loopholeCount, color: loopholeCount > 0 ? '#f97316' : '#22c55e' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span style={{ color: '#4a4a4a' }}>{row.label}</span>
                  <span className="mono font-semibold" style={{ color: row.color || '#a0a0a0' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Escalation banner */}
        {pipeline?.escalation_required && (
          <div
            className="rounded border p-4 flex items-start gap-3"
            style={{ background: 'rgba(249,115,22,0.05)', borderColor: 'rgba(249,115,22,0.25)' }}
          >
            <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#f97316' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-bold" style={{ color: '#f97316', fontFamily: 'Syne, sans-serif' }}>
                Requires Shariah Officer Review
              </p>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#a0a0a0' }}>
                {safeStr(pipeline.escalation_reason) ||
                  'This contract has been flagged for escalation. A licensed Shariah Officer must review and countersign before this contract can proceed.'}
              </p>
            </div>
          </div>
        )}

        {/* Contract summary */}
        {manifest?.contract_summary && (
          <div
            className="p-4 rounded border flex items-start gap-3"
            style={{ background: 'rgba(255,194,0,0.04)', borderColor: 'rgba(255,194,0,0.15)' }}
          >
            <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FFC200' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
              <span className="font-semibold text-white">Contract: </span>
              {safeStr(manifest.contract_summary)}
            </p>
          </div>
        )}

        {/* Clause table */}
        <Section title="Clause Analysis">
          <ClauseTable manifest={manifest} verdicts={verdicts} adversarial={adversarial} pipeline={pipeline} />
        </Section>

        {/* Adversarial flags */}
        <Section title={`Adversarial Findings — ${loopholeCount} Flag${loopholeCount !== 1 ? 's' : ''}`}>
          <AdversarialFlags adversarial={adversarial} />
        </Section>

        {/* Board dossier */}
        <Section title="Board Simulator — Audit Dossier">
          <div
            className="report-text p-4 rounded border"
            style={{
              color: '#a0a0a0',
              background: '#0a0a0a',
              borderColor: '#1f1f1f',
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            {safeStr(boardReport) || 'No board report generated.'}
          </div>
        </Section>

        {/* Audit trail */}
        <Section title="Audit Trail">
          <div
            className="space-y-1"
            style={{ fontFamily: 'JetBrains Mono, monospace', maxHeight: 280, overflowY: 'auto' }}
          >
            {auditTrail.map((entry, i) => (
              <div key={i} className="flex gap-3 text-xs">
                <span className="shrink-0 tabular-nums" style={{ color: '#2e2e2e' }}>
                  [{new Date(entry.ts).toISOString()}]
                </span>
                <span
                  style={{
                    color:
                      String(entry.message).includes('ERROR') || String(entry.message).includes('FAILED') ? '#ef4444'
                      : String(entry.message).includes('complete') || String(entry.message).includes('COMPLETE') ? '#22c55e'
                      : String(entry.message).startsWith('[Agent') ? '#FFC200'
                      : '#a0a0a0',
                  }}
                >
                  {safeStr(entry.message)}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap pt-2 pb-10">
          <p className="text-xs max-w-md leading-relaxed" style={{ color: '#4a4a4a' }}>
            This report was generated by mySyariah, an automated multi-agent AI system by Maybank Islamic.
            It does not constitute legal or Shariah advice. Countersignature by a licensed Shariah Officer
            is required for contracts exceeding RM 10M or with risk scores above 60.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => exportReport(results, auditTrail)}
              className="flex items-center gap-2 text-sm px-5 py-2.5 rounded border transition-fast"
              style={{
                borderColor: '#2e2e2e',
                color: '#a0a0a0',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              EXPORT REPORT
            </button>
            <button
              onClick={onNewAudit}
              className="text-sm px-5 py-2.5 rounded font-bold transition-fast glow-accent"
              style={{
                background: '#FFC200',
                color: '#000',
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.04em',
              }}
            >
              NEW AUDIT
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
