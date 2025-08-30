import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ErrorCard from '../components/ErrorCard'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('min123!')
  const [error, setError] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const nav = useNavigate()
  const { login } = useAuth()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await login(email, password); nav('/') }
    catch (e: any) { setError(e?.message || 'Login failed') }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setSessionExpired(params.get('session') === 'expired')
  }, [])

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold font-display text-brand-black">Login</h1>
      {sessionExpired && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded p-3 text-sm">
          Your session expired. Please sign in again.
        </div>
      )}
      {error && <ErrorCard message={error} onClose={() => { setError('') }} />}
      <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn-brand">Login</button>
    </form>
  )
}
