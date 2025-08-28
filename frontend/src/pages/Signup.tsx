import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ErrorCard from '../components/ErrorCard'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { signup } = useAuth()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await signup(username, email, password); nav('/') }
    catch (e: any) { setError(e?.message || 'Signup failed') }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold font-display text-brand-black">Sign up</h1>
      {error && <ErrorCard message={error} onClose={() => { setError('') }} />}
      <input className="border p-2 rounded w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="btn-brand">Create account</button>
    </form>
  )
}
