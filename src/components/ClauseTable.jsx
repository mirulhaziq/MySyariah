import { useState, Fragment } from 'react'
import { safeStr } from '../lib/safeStr'

const VERDICT_COLORS = {
  COMPLIANT:     { text: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  NON_COMPLIANT: { text: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
  DISPUTED:      { text: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
}

const ROW_CLASS = {
  COMPLIANT:     'row-compliant',
  NON_COMPLIANT: 'row-violation',
  DISPUTED:      'row-disputed',
}

export default function ClauseTable({ manifest, verdicts, adversarial, pipeline }) {
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const clauses = manifest?.clauses ?? []

  const verdictsMap = {}
  ;(verdicts?.verdicts ?? []).forEach((v) => { verdictsMap[v.clause_id] = v })

  const adversarialMap = {}
  ;(adversarial?.adversarial_findings ?? []).forEach((f) => { adversarialMap[f.clause_id] = f })

  const finalStatesMap = {}
  ;(pipeline?.clause_final_states ?? []).forEach((s) => { finalStatesMap[s.id] = s.final_status })

  const rows = clauses.map((c) => {
    const verdict = verdictsMap[c.id]
    const adv = adversarialMap[c.id]
    const finalStatus = safeStr(finalStatesMap[c.id] || verdict?.verdict, 'UNKNOWN')
    return { clause: c, verdict, adv, finalStatus }
  })

  const filtered = filter === 'ALL' ? rows : rows.filter((r) => r.finalStatus === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'DISPUTED'].map((f) => {
          const count = f === 'ALL' ? rows.length : rows.filter((r) => r.finalStatus === f).length
          const isActive = filter === f
          const vc = VERDICT_COLORS[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded border transition-fast"
              style={{
                fontFamily: 'Syne, sans-serif',
                letterSpacing: '0.05em',
                color:       isActive ? (f === 'ALL' ? '#FFC200' : vc.text)   : '#4a4a4a',
                background:  isActive ? (f === 'ALL' ? 'rgba(255,194,0,0.1)' : vc.bg) : 'transparent',
                borderColor: isActive ? (f === 'ALL' ? 'rgba(255,194,0,0.3)' : vc.border) : '#1f1f1f',
              }}
            >
              {f.replace('_', ' ')} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-sm" style={{ color: '#4a4a4a' }}>
          No clauses matching this filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="audit-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th style={{ width: 130 }}>Type</th>
                <th>Extracted Value</th>
                <th style={{ width: 150 }}>Verdict</th>
                <th>Citation</th>
                <th style={{ width: 110 }}>DA Flag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ clause, verdict, adv, finalStatus }) => {
                const vc = VERDICT_COLORS[finalStatus] || VERDICT_COLORS.COMPLIANT
                const hasLoophole = adv?.adversarial_finding === 'LOOPHOLE_FOUND'
                const isExpanded = expanded === clause.id

                // Safe display values — API may return objects for any field
                const displayId           = safeStr(clause.id, '?')
                const displayType         = safeStr(clause.type, 'OTHER')
                const displayValue        = safeStr(clause.extracted_value || clause.raw_text, '—')
                const displayCitation     = safeStr(verdict?.citation, '—')
                const displayViolation    = safeStr(adv?.violation_type, 'FLAGGED')
                const displayRawText      = safeStr(clause.raw_text, '—')
                const displayReasoning    = safeStr(verdict?.reasoning, '')
                const displayRemediation  = safeStr(verdict?.remediation, '')
                const displayArgument     = safeStr(adv?.argument, '')
                const displayFinalStatus  = finalStatus.replace('_', ' ')

                return (
                  <Fragment key={displayId}>
                    <tr
                      className={`${ROW_CLASS[finalStatus] || ''} cursor-pointer`}
                      onClick={() => setExpanded(isExpanded ? null : clause.id)}
                    >
                      <td>
                        <span className="mono text-xs font-semibold" style={{ color: '#a0a0a0' }}>
                          {displayId}
                        </span>
                      </td>

                      <td>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            background: 'rgba(255,194,0,0.08)',
                            color: '#FFC200',
                            border: '1px solid rgba(255,194,0,0.18)',
                            fontFamily: 'JetBrains Mono, monospace',
                          }}
                        >
                          {displayType}
                        </span>
                      </td>

                      <td>
                        <span className="text-xs" style={{ color: '#a0a0a0' }}>
                          {displayValue.length > 120 ? displayValue.slice(0, 120) + '…' : displayValue}
                        </span>
                      </td>

                      <td>
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded"
                          style={{
                            color: vc.text,
                            background: vc.bg,
                            border: `1px solid ${vc.border}`,
                            fontFamily: 'Syne, sans-serif',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: vc.text }} />
                          {displayFinalStatus}
                        </span>
                      </td>

                      <td>
                        <span className="text-xs mono" style={{ color: '#FFC200', opacity: 0.8 }}>
                          {displayCitation}
                        </span>
                      </td>

                      <td>
                        {hasLoophole ? (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded"
                            style={{
                              color: '#f97316',
                              background: 'rgba(249,115,22,0.1)',
                              border: '1px solid rgba(249,115,22,0.25)',
                              fontFamily: 'Syne, sans-serif',
                            }}
                          >
                            {displayViolation}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: '#2e2e2e' }}>—</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className={ROW_CLASS[finalStatus] || ''}>
                        <td colSpan={6} className="!pt-0 !pb-5">
                          <div className="ml-4 space-y-4 border-l-2 pl-4 pt-2" style={{ borderColor: '#242424' }}>

                            <ExpandRow label="Contract Text" color="#4a4a4a">
                              <span className="mono">"{displayRawText}"</span>
                            </ExpandRow>

                            {displayReasoning && (
                              <ExpandRow label="Compliance Reasoning" color="#4a4a4a">
                                {displayReasoning}
                              </ExpandRow>
                            )}

                            {displayRemediation && (
                              <ExpandRow label="Required Remediation" color="#ef4444">
                                {displayRemediation}
                              </ExpandRow>
                            )}

                            {hasLoophole && displayArgument && (
                              <ExpandRow label="Devil's Advocate Argument" color="#f97316">
                                {displayArgument}
                              </ExpandRow>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs mt-3" style={{ color: '#4a4a4a' }}>
        Click any row to expand full clause details and reasoning.
      </p>
    </div>
  )
}

function ExpandRow({ label, color, children }) {
  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color, fontFamily: 'Syne, sans-serif' }}
      >
        {label}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: '#a0a0a0' }}>
        {children}
      </p>
    </div>
  )
}
