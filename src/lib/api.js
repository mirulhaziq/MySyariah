// Central API client — points at the Railway FastAPI backend.
// Set VITE_API_URL in your .env to your Railway deployment URL.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API = {
  auditText: `${BASE_URL}/api/audit/text`,
  auditPdf:  `${BASE_URL}/api/audit/pdf`,
  chat:      `${BASE_URL}/api/chat`,
  ingest:    `${BASE_URL}/api/ingest`,
  health:    `${BASE_URL}/health`,
}
