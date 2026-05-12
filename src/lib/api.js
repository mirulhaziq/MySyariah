// Development : VITE_API_URL is unset → BASE_URL = '' → relative URLs → Vite proxies to 127.0.0.1:8000
// Production  : set VITE_API_URL=https://your-app.railway.app in Vercel env vars
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const API = {
  auditText: `${BASE_URL}/api/audit/text`,
  auditPdf:  `${BASE_URL}/api/audit/pdf`,
  chat:      `${BASE_URL}/api/chat`,
  ingest:    `${BASE_URL}/api/ingest`,
  health:    `${BASE_URL}/health`,
}
