import { useEffect, useState } from 'react'

// Normalize: trim trailing slash so we don't produce double slashes
const raw = import.meta.env.VITE_API_URL ?? ''
const API_BASE = typeof raw === 'string' ? raw.replace(/\/+$/, '') : ''

function App() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const controller = new AbortController()
    const url = API_BASE ? `${API_BASE}/api/health` : '/api/health'
    fetch(url, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then(() => setBackendStatus('ok'))
      .catch((err) => {
        if (err?.name !== 'AbortError') setBackendStatus('error')
      })
    return () => controller.abort()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold text-gray-900">aine-training</h1>
      <p className="mt-2 text-gray-600">Frontend + Backend shell. Todo list in later stories.</p>
      <p className="mt-4 text-sm text-gray-500">
        Backend: {backendStatus === 'loading' && 'Checking…'}
        {backendStatus === 'ok' && 'Reachable'}
        {backendStatus === 'error' && 'Not reachable'}
      </p>
    </main>
  )
}

export default App
