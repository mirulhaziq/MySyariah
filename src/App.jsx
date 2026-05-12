import { useState, useCallback } from 'react'
import Landing from './components/Landing'
import AuditRunner from './components/AuditRunner'
import Results from './components/Results'
import ErrorBoundary from './components/ErrorBoundary'
import Chatbot from './components/Chatbot'
import DocsPage from './components/DocsPage'
import { extractPdfText } from './lib/pdfExtract'
import { DEMO_CONTRACT } from './lib/demoContract'
import { API } from './lib/api'

const INITIAL_STAGES = [
  { id: 1, name: 'Extraction Agent', description: 'Parsing contract clauses...' },
  { id: 2, name: 'Compliance Checker', description: 'Checking BNM & AAOIFI standards...' },
  { id: 3, name: "Devil's Advocate", description: 'Probing for Riba, Gharar, Maysir...' },
  { id: 4, name: 'Orchestrator', description: 'Evaluating disputes & escalations...' },
  { id: 5, name: 'Board Simulator', description: 'Drafting audit dossier...' },
]

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [prevScreen, setPrevScreen] = useState('landing')
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [stages, setStages] = useState(INITIAL_STAGES.map((s) => ({ ...s, status: 'waiting' })))
  const [auditResults, setAuditResults] = useState(null)
  const [auditTrail, setAuditTrail] = useState([])
  const [error, setError] = useState(null)

  const handleFileChange = useCallback(async (f) => {
    setFile(f)
    if (f) {
      try {
        const { pages } = await extractPdfText(f)
        setPageCount(pages)
      } catch (_) {
        setPageCount(1)
      }
    } else {
      setPageCount(0)
    }
  }, [])

  const setStageStatus = (id, status) => {
    setStages((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  const addTrail = (message) => {
    setAuditTrail((prev) => [...prev, { ts: new Date().toISOString(), message }])
  }

  const handleRunAudit = useCallback(async () => {
    setScreen('running')
    setError(null)
    setAuditTrail([])
    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'waiting' })))

    try {
      // ── connectivity check ──────────────────────────────────────────
      addTrail('Checking backend connection...')
      try {
        await fetch(API.health)
        addTrail('Backend reachable. Starting audit pipeline...')
      } catch {
        throw new Error(
          `Cannot reach backend at ${API.health}. ` +
          `Make sure uvicorn is running: cd backend && uvicorn main:app --reload --host 0.0.0.0`
        )
      }

      let url, init

      if (file) {
        addTrail('Uploading PDF to backend...')
        const formData = new FormData()
        formData.append('file', file)
        url = API.auditPdf
        init = { method: 'POST', body: formData }
      } else {
        addTrail('No PDF provided — loading demo contract: Nexus Trading Murabaha Agreement.')
        url = API.auditText
        init = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contract_text: DEMO_CONTRACT }),
        }
      }

      let response
      try {
        response = await fetch(url, init)
      } catch (fetchErr) {
        throw new Error(`Fetch failed for ${url}: ${fetchErr.message}`)
      }

      if (!response.ok) {
        const err = await response.text().catch(() => response.statusText)
        throw new Error(`Backend error ${response.status}: ${err}`)
      }

      // Read SSE stream
      if (!response.body) throw new Error('Server returned no response body. Check backend logs.')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let eventType = null  // must live outside the while loop

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete last line

        for (const line of lines) {
          if (line.startsWith(':') || line === '') continue  // skip keepalive pings & blank lines
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            if (!eventType) continue
            let data
            try {
              data = JSON.parse(line.slice(6))
            } catch {
              eventType = null
              continue
            }

            if (eventType === 'stage') {
              setStageStatus(data.id, data.status)
            } else if (eventType === 'log') {
              addTrail(data.message)
            } else if (eventType === 'complete') {
              setAuditResults({
                manifest: data.manifest,
                verdicts: data.verdicts,
                adversarial: data.adversarial,
                pipeline: data.pipeline,
                boardReport: data.boardReport,
              })
              await new Promise((r) => setTimeout(r, 600))
              setScreen('results')
            } else if (eventType === 'error') {
              throw new Error(data.message)
            }

            eventType = null
          }
        }
      }
    } catch (err) {
      console.error('Audit pipeline error:', err)
      setError(err.message || 'Unknown error occurred during audit.')
      setStages((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'error' } : s))
      )
    }
  }, [file])

  const handleOpenDocs = useCallback(() => {
    setPrevScreen(screen)
    setScreen('docs')
  }, [screen])

  const handleCloseDocs = useCallback(() => {
    setScreen(prevScreen)
  }, [prevScreen])

  const handleNewAudit = useCallback(() => {
    setScreen('landing')
    setAuditResults(null)
    setFile(null)
    setPageCount(0)
    setError(null)
    setStages(INITIAL_STAGES.map((s) => ({ ...s, status: 'waiting' })))
    setAuditTrail([])
  }, [])

  return (
    <div className="min-h-screen bg-grid bg-diamond" style={{ fontFamily: "'Outfit', sans-serif" }}>
      {screen === 'landing' && (
        <Landing
          file={file}
          pageCount={pageCount}
          onFileChange={handleFileChange}
          onRunAudit={handleRunAudit}
          onOpenDocs={handleOpenDocs}
        />
      )}
      {screen === 'running' && (
        <AuditRunner
          stages={stages}
          error={error}
          onRetry={handleRunAudit}
          auditTrail={auditTrail}
        />
      )}
      {screen === 'results' && auditResults && (
        <ErrorBoundary onReset={handleNewAudit}>
          <Results
            results={auditResults}
            auditTrail={auditTrail}
            onNewAudit={handleNewAudit}
            onOpenDocs={handleOpenDocs}
          />
        </ErrorBoundary>
      )}

      {screen === 'docs' && (
        <DocsPage onBack={handleCloseDocs} />
      )}

      {screen !== 'running' && screen !== 'docs' && (
        <Chatbot auditResults={auditResults} />
      )}
    </div>
  )
}
