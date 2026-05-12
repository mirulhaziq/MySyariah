import { safeStr } from '../lib/safeStr'

const VIOLATION_CONFIG = {
  RIBA:   { label: 'RIBA',   desc: 'Prohibited interest / usury',  color: '#ef4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)'   },
  GHARAR: { label: 'GHARAR', desc: 'Excessive uncertainty',         color: '#f97316', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)'  },
  MAYSIR: { label: 'MAYSIR', desc: 'Speculation / gambling',        color: '#FFC200', bg: 'rgba(255,194,0,0.07)',  border: 'rgba(255,194,0,0.2)'   },
}

const SEVERITY_COLORS = {
  HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  MEDIUM: { color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  LOW:    { color: '#a0a0a0', bg: 'rgba(160,160,160,0.1)' },
}

export default function AdversarialFlags({ adversarial }) {
  const findings = (adversarial?.adversarial_findings ?? []).filter(
    (f) => f.adversarial_finding === 'LOOPHOLE_FOUND'
  )

  if (findings.length === 0) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded border"
        style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.2)' }}
      >
        <svg className="w-5 h-5 shrink-0" style={{ color: '#22c55e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm" style={{ color: '#a0a0a0' }}>
          No hidden violations detected by the Devil's Advocate agent.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {findings.map((f, i) => {
        const violationType = safeStr(f.violation_type, 'RIBA')
        const vc = VIOLATION_CONFIG[violationType] || VIOLATION_CONFIG.RIBA
        const severityKey = safeStr(f.severity, 'MEDIUM')
        const sc = SEVERITY_COLORS[severityKey] || SEVERITY_COLORS.MEDIUM

        const displayClauseId   = safeStr(f.clause_id, '?')
        const displayFinding    = safeStr(f.finding_detail, '')
        const displayArgument   = safeStr(f.argument, '')
        const displaySeverity   = safeStr(f.severity, 'MEDIUM')
        const displayAction     = safeStr(f.recommended_action, 'FLAG_FOR_REVIEW')

        return (
          <div
            key={i}
            className="rounded border p-4 space-y-3"
            style={{ background: vc.bg, borderColor: vc.border }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="mono text-xs font-semibold" style={{ color: '#a0a0a0' }}>
                  {displayClauseId}
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded"
                  style={{
                    color: vc.color,
                    background: `${vc.color}15`,
                    border: `1px solid ${vc.color}40`,
                    fontFamily: 'Syne, sans-serif',
                    letterSpacing: '0.08em',
                  }}
                >
                  {vc.label}
                </span>
                <span className="text-xs" style={{ color: '#4a4a4a' }}>{vc.desc}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ color: sc.color, background: sc.bg, fontFamily: 'Syne, sans-serif' }}
                >
                  {displaySeverity}
                </span>
                <ActionBadge action={displayAction} />
              </div>
            </div>

            {displayFinding && (
              <div>
                <p className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: '#4a4a4a', fontFamily: 'Syne, sans-serif' }}>
                  Finding
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>{displayFinding}</p>
              </div>
            )}

            {displayArgument && (
              <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs uppercase tracking-wider mb-1"
                  style={{ color: vc.color, fontFamily: 'Syne, sans-serif', opacity: 0.8 }}>
                  Challenger's Argument
                </p>
                <p className="text-sm leading-relaxed italic" style={{ color: '#a0a0a0' }}>
                  "{displayArgument}"
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ActionBadge({ action }) {
  const config = {
    ESCALATE:       { color: '#ef4444', label: '↑ ESCALATE' },
    FLAG_FOR_REVIEW: { color: '#f97316', label: '⚑ FLAG' },
    CLEAR:          { color: '#22c55e', label: '✓ CLEAR' },
  }
  const c = config[action] || config.FLAG_FOR_REVIEW
  return (
    <span
      className="text-xs px-2 py-0.5 rounded border"
      style={{
        color: c.color,
        borderColor: `${c.color}40`,
        background: `${c.color}10`,
        fontFamily: 'Syne, sans-serif',
        letterSpacing: '0.04em',
      }}
    >
      {c.label}
    </span>
  )
}
