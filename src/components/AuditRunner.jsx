import { useEffect, useRef, useState } from 'react'

const STAGE_META = [
  { icon: '⬡', label: 'Extraction Agent',   sub: 'Parsing contract clauses into structured manifest' },
  { icon: '⬡', label: 'Compliance Checker', sub: 'Evaluating against BNM SPR-1 & AAOIFI Std 8'      },
  { icon: '⬡', label: "Devil's Advocate",   sub: 'Probing compliant clauses for hidden violations'   },
  { icon: '⬡', label: 'Orchestrator',       sub: 'Computing risk score & escalation decision'        },
  { icon: '⬡', label: 'Board Simulator',    sub: 'Drafting formal Shariah audit dossier'             },
]

function useElapsed(running) {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (running) {
      setElapsed(0)
      ref.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => clearInterval(ref.current)
  }, [running])
  const m = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const s = String(elapsed % 60).padStart(2, '0')
  return `${m}:${s}`
}

export default function AuditRunner({ stages, error, onRetry, auditTrail }) {
  const doneCount  = stages.filter((s) => s.status === 'complete').length
  const runningIdx = stages.findIndex((s) => s.status === 'running')
  const hasError   = !!error
  const isRunning  = !hasError && doneCount < 5
  const pct        = Math.round((doneCount / 5) * 100)
  const elapsed    = useElapsed(isRunning)
  const logEndRef  = useRef(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [auditTrail])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>

      {/* Animated top progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3, background: '#111' }}>
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: hasError
              ? '#ef4444'
              : 'linear-gradient(90deg, #FFC200, #FFD940, #FFC200)',
            boxShadow: hasError ? 'none' : '0 0 12px rgba(255,194,0,0.6)',
          }}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full px-4 py-16 gap-8">

        {/* ── Left panel ── */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="6" fill="#FFC200" />
              <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle"
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, fill: '#000' }}>
                M
              </text>
            </svg>
            <span className="logo-text text-white text-lg">
              my<span style={{ color: '#FFC200' }}>Syariah</span>
            </span>
          </div>

          {/* Big percentage */}
          <div>
            <div
              className="text-8xl font-extrabold leading-none transition-all duration-500"
              style={{
                fontFamily: 'Syne, sans-serif',
                color: hasError ? '#ef4444' : '#FFC200',
                letterSpacing: '-0.04em',
              }}
            >
              {hasError ? 'ERR' : `${pct}%`}
            </div>
            <div className="mt-2 text-sm" style={{ color: '#4a4a4a', fontFamily: 'JetBrains Mono, monospace' }}>
              {hasError
                ? 'Pipeline failed — see error below'
                : doneCount === 5
                ? 'All agents complete'
                : `Agent ${doneCount + 1} of 5 running · ${elapsed}`}
            </div>
          </div>

          {/* Segmented progress bar */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const st = stages[n - 1]?.status
              return (
                <div
                  key={n}
                  className="flex-1 rounded-full transition-all duration-500"
                  style={{
                    height: 6,
                    background:
                      st === 'complete' ? '#FFC200'
                      : st === 'running' ? '#FFC20066'
                      : st === 'error'   ? '#ef4444'
                      : '#1a1a1a',
                    boxShadow: st === 'running' ? '0 0 8px rgba(255,194,0,0.5)' : 'none',
                  }}
                />
              )
            })}
          </div>

          {/* Stage list */}
          <div className="space-y-2">
            {STAGE_META.map((meta, i) => {
              const st = stages[i]?.status || 'waiting'
              const isActive = st === 'running'
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-300"
                  style={{
                    background: isActive ? 'rgba(255,194,0,0.05)' : '#111',
                    border: `1px solid ${
                      isActive ? 'rgba(255,194,0,0.2)'
                      : st === 'complete' ? 'rgba(34,197,94,0.15)'
                      : st === 'error'    ? 'rgba(239,68,68,0.15)'
                      : '#1a1a1a'
                    }`,
                  }}
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {st === 'complete' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: '#22c55e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {st === 'running' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,194,0,0.1)', border: '1px solid #FFC200' }}>
                        <div className="spinner" />
                      </div>
                    )}
                    {st === 'error' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444' }}>
                        <svg className="w-3.5 h-3.5" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {st === 'waiting' && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ border: '1px solid #222', background: '#0a0a0a' }}>
                        <span className="text-xs font-bold mono" style={{ color: '#333' }}>{i + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{
                        fontFamily: 'Syne, sans-serif',
                        color:
                          st === 'complete' ? '#fff'
                          : st === 'running' ? '#FFC200'
                          : st === 'error'   ? '#ef4444'
                          : '#333',
                      }}
                    >
                      {meta.label}
                    </div>
                    <div className="text-xs truncate" style={{ color: isActive ? '#666' : '#2a2a2a' }}>
                      {meta.sub}
                    </div>
                  </div>

                  {/* Right badge */}
                  {st === 'complete' && (
                    <span className="text-xs shrink-0 font-bold px-2 py-0.5 rounded"
                      style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', fontFamily: 'Syne, sans-serif' }}>
                      DONE
                    </span>
                  )}
                  {st === 'running' && (
                    <span className="text-xs shrink-0 font-bold px-2 py-0.5 rounded"
                      style={{ color: '#FFC200', background: 'rgba(255,194,0,0.08)', fontFamily: 'Syne, sans-serif' }}>
                      RUNNING
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Error */}
          {hasError && (
            <div className="p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-sm mb-3" style={{ color: '#ef4444' }}>
                <span className="font-bold">Error:</span> {error}
              </p>
              <button
                onClick={onRetry}
                className="text-xs px-4 py-2 rounded font-bold"
                style={{ background: '#FFC200', color: '#000', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }}
              >
                RETRY AUDIT
              </button>
            </div>
          )}
        </div>

        {/* ── Right panel — terminal log ── */}
        <div className="lg:w-96 flex flex-col">
          <div
            className="flex-1 rounded-xl overflow-hidden flex flex-col"
            style={{ border: '1px solid #1a1a1a', background: '#0d0d0d', minHeight: 400, maxHeight: 600 }}
          >
            {/* Terminal title bar */}
            <div className="flex items-center gap-2 px-4 py-3 shrink-0"
              style={{ background: '#111', borderBottom: '1px solid #1a1a1a' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFC200' }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs ml-2 mono" style={{ color: '#333' }}>audit.log</span>
              {isRunning && (
                <span className="ml-auto flex items-center gap-1.5 text-xs mono" style={{ color: '#333' }}>
                  <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#22c55e' }} />
                  live
                </span>
              )}
            </div>

            {/* Log lines */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              {auditTrail.length === 0 ? (
                <p className="text-xs mono" style={{ color: '#2a2a2a' }}>Waiting for pipeline to start...</p>
              ) : (
                auditTrail.map((entry, i) => {
                  const msg = entry.message
                  const color =
                    msg.includes('ERROR') || msg.includes('FAILED') ? '#ef4444'
                    : msg.includes('COMPLETE') || msg.includes('complete') ? '#22c55e'
                    : msg.startsWith('[Agent') ? '#FFC200'
                    : msg.startsWith('══') ? '#333'
                    : '#555'
                  return (
                    <div key={i} className="flex gap-2 text-xs mono leading-relaxed">
                      <span className="shrink-0 tabular-nums" style={{ color: '#2a2a2a' }}>
                        {new Date(entry.ts).toLocaleTimeString('en-GB')}
                      </span>
                      <span style={{ color }}>{msg}</span>
                    </div>
                  )
                })
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Elapsed',  value: elapsed },
              { label: 'Agents',   value: `${doneCount}/5` },
              { label: 'Log lines', value: auditTrail.length },
            ].map((s) => (
              <div key={s.label} className="rounded-lg px-3 py-2 text-center"
                style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                <div className="text-sm font-bold mono" style={{ color: '#FFC200' }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#333', fontFamily: 'Syne, sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
