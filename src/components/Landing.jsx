import { useState, useRef, useCallback } from 'react'

function MaybankLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="6" fill="#FFC200" />
      <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle"
        style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 22, fill: '#000' }}>
        M
      </text>
    </svg>
  )
}

export default function Landing({ file, pageCount, onFileChange, onRunAudit, onOpenDocs }) {
  const [dragOver, setDragOver] = useState(false)
  const [usingDemo, setUsingDemo] = useState(false)
  const fileInputRef = useRef(null)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files[0]
      if (dropped?.type === 'application/pdf') {
        setUsingDemo(false)
        onFileChange(dropped)
      }
    },
    [onFileChange]
  )

  const handleFileInput = (e) => {
    const f = e.target.files[0]
    if (f) {
      setUsingDemo(false)
      onFileChange(f)
    }
  }

  const handleUseDemo = () => {
    if (usingDemo && !file) {
      // Toggle off
      setUsingDemo(false)
    } else {
      setUsingDemo(true)
      onFileChange(null)
    }
  }

  const handleClearFile = (e) => {
    e.stopPropagation()
    onFileChange(null)
    setUsingDemo(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canRun = file !== null || usingDemo

  return (
    <div className="min-h-screen flex flex-col">

      {/* Top bar — Maybank style */}
      <header style={{ background: '#000', borderBottom: '2px solid #FFC200' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MaybankLogo size={36} />
            <div>
              <div className="logo-text text-white text-lg leading-none">
                my<span style={{ color: '#FFC200' }}>Syariah</span>
              </div>
              <div className="text-xs" style={{ color: '#666', fontFamily: 'Outfit, sans-serif' }}>
                Maybank Islamic • Compliance AI
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-fast"
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
            <span
              className="text-xs px-2.5 py-1 rounded"
              style={{
                color: '#000',
                background: '#FFC200',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              PROTOTYPE
            </span>
          </div>
        </div>
      </header>

      {/* Yellow accent bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #FFC200, #FFD940, #FFC200)' }} />

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        <div className="w-full max-w-2xl">

          {/* Hero copy */}
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full"
              style={{ background: '#141414', border: '1px solid #242424' }}
            >
              <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#22c55e' }} />
              <span className="text-xs" style={{ color: '#a0a0a0', fontFamily: 'JetBrains Mono, monospace' }}>
                5-Agent Pipeline Ready
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 leading-tight"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>
              Shariah Audit,
              <br />
              <span style={{ color: '#FFC200' }}>Reimagined.</span>
            </h1>

            <p className="text-lg max-w-md mx-auto leading-relaxed" style={{ color: '#a0a0a0' }}>
              Upload a Murabaha contract and let five AI agents check it against
              BNM SPR-1, IFSA 2013, and AAOIFI Standard 8 — in under two minutes.
            </p>
          </div>

          {/* Divider */}
          <hr className="yellow-rule mb-8" />

          {/* Main card */}
          <div className="card card-glow p-6 sm:p-8 space-y-6" style={{ borderColor: '#242424' }}>

            {/* Backend status */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded"
              style={{ background: '#0a0a0a', border: '1px solid #1e1e1e' }}
            >
              <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#22c55e', flexShrink: 0 }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: '#a0a0a0', fontFamily: 'Syne, sans-serif' }}>
                  AI ENGINE CONNECTED
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#4a4a4a', fontFamily: 'JetBrains Mono, monospace' }}>
                  GPT-4o · BNM/AAOIFI knowledge base · Pinecone RAG
                </p>
              </div>
            </div>

            {/* Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#a0a0a0', fontFamily: 'Syne, sans-serif' }}>
                Contract PDF
              </label>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`rounded border-2 border-dashed p-8 text-center transition-fast ${
                  dragOver ? 'dropzone-active' : ''
                } ${!file ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  borderColor: file ? '#FFC200' : dragOver ? '#FFC200' : '#2e2e2e',
                  background: file ? 'rgba(255,194,0,0.04)' : dragOver ? 'rgba(255,194,0,0.04)' : '#0a0a0a',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2" style={{ color: '#FFC200' }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-semibold text-white">{file.name}</span>
                    </div>
                    <p className="text-xs" style={{ color: '#a0a0a0' }}>
                      {pageCount > 0 ? `${pageCount} page${pageCount !== 1 ? 's' : ''}` : 'Reading...'} &nbsp;•&nbsp;
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={handleClearFile}
                      className="mt-1 text-xs px-3 py-1 rounded transition-fast"
                      style={{
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.25)',
                        background: 'rgba(239,68,68,0.06)',
                      }}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <svg className="w-10 h-10" style={{ color: '#2e2e2e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-sm" style={{ color: '#a0a0a0' }}>
                      Drop your Murabaha contract PDF here
                    </p>
                    <p className="text-xs" style={{ color: '#4a4a4a' }}>or click to browse</p>
                  </div>
                )}
              </div>

              {/* Demo option */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 border-t" style={{ borderColor: '#1f1f1f' }} />
                <span className="text-xs" style={{ color: '#4a4a4a' }}>or</span>
                <div className="flex-1 border-t" style={{ borderColor: '#1f1f1f' }} />
              </div>

              <button
                onClick={handleUseDemo}
                className="mt-3 w-full py-2.5 text-sm rounded border transition-fast flex items-center justify-center gap-2"
                style={{
                  borderColor: (usingDemo && !file) ? '#FFC200' : '#2e2e2e',
                  background: (usingDemo && !file) ? 'rgba(255,194,0,0.08)' : '#0a0a0a',
                  color: (usingDemo && !file) ? '#FFC200' : '#4a4a4a',
                  fontFamily: 'Syne, sans-serif',
                  letterSpacing: '0.03em',
                }}
              >
                {(usingDemo && !file) ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Demo Contract Selected — Click to deselect
                  </>
                ) : (
                  'Use Built-in Demo Contract'
                )}
              </button>

              {(usingDemo && !file) && (
                <div
                  className="mt-2 p-3 rounded text-xs leading-relaxed"
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #1f1f1f',
                    color: '#a0a0a0',
                  }}
                >
                  <span style={{ color: '#FFC200', fontWeight: 600 }}>Demo:</span> Nexus Trading Sdn Bhd Murabaha Agreement —
                  contains <span style={{ color: '#ef4444' }}>4 deliberate Shariah violations</span>: KLIBOR-linked profit,
                  compounding late payment penalty, Singapore governing law, and guaranteed ibra.
                </div>
              )}
            </div>

            {/* Run button */}
            <button
              onClick={onRunAudit}
              disabled={!canRun}
              className="w-full py-4 rounded font-bold text-sm tracking-widest transition-fast"
              style={{
                fontFamily: 'Syne, sans-serif',
                background: canRun ? '#FFC200' : '#1a1a1a',
                color: canRun ? '#000' : '#4a4a4a',
                cursor: canRun ? 'pointer' : 'not-allowed',
                boxShadow: canRun ? '0 0 24px rgba(255,194,0,0.2)' : 'none',
              }}
            >
              {canRun ? 'RUN SHARIAH AUDIT  →' : 'SELECT A CONTRACT TO CONTINUE'}
            </button>

            {!canRun && (
              <p className="text-xs text-center" style={{ color: '#4a4a4a' }}>
                Upload a Murabaha contract PDF or use the demo contract to begin.
              </p>
            )}
          </div>

          {/* Standards badges */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { label: 'BNM SPR-1', sub: '2009' },
              { label: 'AAOIFI Std 8', sub: 'Murabaha' },
              { label: 'IFSA', sub: '2013' },
              { label: 'AAOIFI Std 3', sub: 'Default' },
              { label: 'BNM SGPD', sub: '2019' },
            ].map((b) => (
              <div
                key={b.label}
                className="px-3 py-1.5 rounded flex items-center gap-1.5"
                style={{ background: '#141414', border: '1px solid #242424' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FFC200' }} />
                <span className="text-xs" style={{ color: '#a0a0a0', fontFamily: 'JetBrains Mono, monospace' }}>
                  {b.label}
                </span>
                <span className="text-xs" style={{ color: '#4a4a4a' }}>{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a' }} className="py-4 px-6 text-center">
        <p className="text-xs" style={{ color: '#4a4a4a' }}>
          mySyariah is an AI prototype by Maybank Islamic. Results require countersignature by a licensed Shariah Officer.
        </p>
      </footer>
    </div>
  )
}
