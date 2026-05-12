import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[mySyariah] Render error:', error)
    console.error('[mySyariah] Component stack:', info?.componentStack)
    this.setState({ info })
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ background: '#0a0a0a' }}
        >
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
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

            {/* Error card */}
            <div
              className="rounded border p-6 space-y-4"
              style={{ background: '#141414', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Rendering Error
                </h2>
              </div>

              <p className="text-sm" style={{ color: '#a0a0a0' }}>
                The results screen encountered an error. The audit data was collected successfully —
                this is a display issue only.
              </p>

              <div
                className="p-3 rounded text-xs mono"
                style={{ background: '#0a0a0a', color: '#ef4444', border: '1px solid #1f1f1f', overflowX: 'auto' }}
              >
                {this.state.error?.message || String(this.state.error)}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    this.setState({ error: null, info: null })
                    this.props.onReset?.()
                  }}
                  className="text-sm px-5 py-2.5 rounded font-bold transition-fast"
                  style={{ background: '#FFC200', color: '#000', fontFamily: 'Syne, sans-serif' }}
                >
                  RETURN TO HOME
                </button>
                <button
                  onClick={() => this.setState({ error: null, info: null })}
                  className="text-sm px-5 py-2.5 rounded border transition-fast"
                  style={{ borderColor: '#2e2e2e', color: '#a0a0a0', fontFamily: 'Syne, sans-serif' }}
                >
                  RETRY RENDER
                </button>
              </div>
            </div>

            <p className="text-xs mt-4 text-center" style={{ color: '#4a4a4a' }}>
              Open DevTools console (F12) for the full error stack trace.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
