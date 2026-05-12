import { useState, useRef, useEffect, useCallback } from 'react'
import { safeStr } from '../lib/safeStr'


/* ─── Quick reply sets ───────────────────────────────────────────── */
const QUICK_REPLIES_NO_AUDIT = [
  'How does mySyariah work?',
  'What is Murabaha?',
  'What is Riba?',
  'What is BNM SPR-1?',
]

const QUICK_REPLIES_WITH_AUDIT = [
  'What are the main violations?',
  'Explain the risk score',
  'How to fix non-compliant clauses?',
  'What did the board recommend?',
]

/* ─── Main component ─────────────────────────────────────────────── */
export default function Chatbot({ auditResults }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const prevAuditRef = useRef(null)

  // Build initial greeting
  const buildGreeting = useCallback((results) => {
    if (!results) {
      return "Hello! I'm the mySyariah Assistant. Run an audit to unlock contract-specific Q&A, or ask me about Shariah compliance concepts."
    }
    const score = results?.pipeline?.risk_score ?? '?'
    const id = results?.pipeline?.contract_id || 'this contract'
    const nc = results?.pipeline?.non_compliant_count ?? 0
    const esc = results?.pipeline?.escalation_required
    return `Audit complete for **${id}**.\n\nRisk score: **${score}/100** — ${nc} non-compliant clause${nc !== 1 ? 's' : ''} found${esc ? ', escalation required' : ''}.\n\nAsk me anything about the findings.`
  }, [])

  // Init messages on mount
  useEffect(() => {
    setMessages([{ id: 1, role: 'assistant', text: buildGreeting(auditResults), ts: new Date() }])
  }, []) // eslint-disable-line

  // Re-greet when audit finishes
  useEffect(() => {
    if (auditResults && auditResults !== prevAuditRef.current) {
      prevAuditRef.current = auditResults
      const greeting = buildGreeting(auditResults)
      setMessages([{ id: Date.now(), role: 'assistant', text: greeting, ts: new Date() }])
      if (!open) setUnread((n) => n + 1)
    }
  }, [auditResults, open, buildGreeting])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Clear unread when opened
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, ts: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { API } = await import('../lib/api')
      const history = messages.slice(-10).map((m) => ({
        role: m.role === 'error' ? 'assistant' : m.role,
        content: safeStr(m.text),
      }))

      const response = await fetch(API.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history,
          audit_context: auditResults || null,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const reply = data.choices[0].message.content

      setMessages((prev) => [...prev, { id: Date.now(), role: 'assistant', text: reply, ts: new Date() }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'error', text: err.message || 'Something went wrong.', ts: new Date() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const quickReplies = auditResults ? QUICK_REPLIES_WITH_AUDIT : QUICK_REPLIES_NO_AUDIT

  return (
    <>
      {/* ── Chat window ── */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(560px, calc(100vh - 120px))',
            background: '#111111',
            border: '1px solid #2a2a2a',
            borderRadius: 16,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,194,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: '#000',
              borderBottom: '2px solid #FFC200',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#FFC200',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 16, color: '#000',
                flexShrink: 0,
              }}
            >
              M
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                mySyariah Assistant
              </div>
              <div style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                {loading ? 'Typing…' : 'Online — Shariah AI'}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <BotAvatar />
                <div style={{
                  background: '#1e1e1e', border: '1px solid #2a2a2a',
                  borderRadius: '18px 18px 18px 4px',
                  padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center',
                }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#FFC200',
                        display: 'inline-block',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {!loading && messages.length <= 2 && (
            <div
              style={{
                padding: '0 12px 8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                flexShrink: 0,
              }}
            >
              {quickReplies.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  style={{
                    fontSize: 11,
                    padding: '5px 10px',
                    borderRadius: 20,
                    border: '1px solid rgba(255,194,0,0.4)',
                    background: 'transparent',
                    color: '#FFC200',
                    cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(255,194,0,0.1)' }}
                  onMouseLeave={(e) => { e.target.style.background = 'transparent' }}
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #1a1a1a',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexShrink: 0,
              background: '#0d0d0d',
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              placeholder="Ask about this contract…"
              style={{
                flex: 1,
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: 24,
                padding: '9px 14px',
                fontSize: 13,
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#FFC200' }}
              onBlur={(e) => { e.target.style.borderColor = '#2a2a2a' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38,
                borderRadius: '50%',
                background: input.trim() && !loading ? '#FFC200' : '#1a1a1a',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !loading ? '#000' : '#444'} strokeWidth="2.5">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: open ? '#1a1a1a' : '#FFC200',
          border: open ? '2px solid #2a2a2a' : '2px solid #FFC200',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(255,194,0,0.35)',
          transition: 'all 0.2s ease',
          zIndex: 9999,
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}

        {/* Unread badge */}
        {unread > 0 && !open && (
          <span
            style={{
              position: 'absolute',
              top: -4, right: -4,
              width: 18, height: 18,
              borderRadius: '50%',
              background: '#ef4444',
              border: '2px solid #0a0a0a',
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {unread}
          </span>
        )}
      </button>

      {/* Bounce keyframes injected once */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────── */
function BotAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      background: '#FFC200', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 12, color: '#000',
    }}>
      M
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  const isError = msg.role === 'error'

  const timeStr = msg.ts instanceof Date
    ? msg.ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : ''

  // Render text with **bold** support
  const renderText = (text) => {
    const parts = String(text).split(/(\*\*[^*]+\*\*)/)
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} style={{ color: isUser ? '#000' : '#fff' }}>{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    )
  }

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '80%' }}>
          <div style={{
            background: '#FFC200',
            color: '#000',
            borderRadius: '18px 18px 4px 18px',
            padding: '10px 14px',
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: 'Outfit, sans-serif',
          }}>
            {renderText(msg.text)}
          </div>
          <div style={{ fontSize: 10, color: '#4a4a4a', textAlign: 'right', marginTop: 3 }}>{timeStr}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <BotAvatar />
      <div style={{ maxWidth: '80%' }}>
        <div style={{ fontSize: 10, color: '#4a4a4a', marginBottom: 3, fontFamily: 'Syne, sans-serif' }}>
          mySyariah Assistant
        </div>
        <div style={{
          background: isError ? 'rgba(239,68,68,0.1)' : '#1e1e1e',
          color: isError ? '#ef4444' : '#e0e0e0',
          border: isError ? '1px solid rgba(239,68,68,0.25)' : '1px solid #2a2a2a',
          borderRadius: '18px 18px 18px 4px',
          padding: '10px 14px',
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: 'Outfit, sans-serif',
          whiteSpace: 'pre-wrap',
        }}>
          {renderText(msg.text)}
        </div>
        <div style={{ fontSize: 10, color: '#4a4a4a', marginTop: 3 }}>{timeStr}</div>
      </div>
    </div>
  )
}
