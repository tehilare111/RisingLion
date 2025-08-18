import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import ErrorCard from '../components/ErrorCard'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined)
  const nav = useNavigate()
  const { signup } = useAuth()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await signup(username, email, password); nav('/') }
    catch (e: any) { setError(e?.message || 'Signup failed'); setErrorTitle(e?.title) }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Sign up</h1>
      {error && <ErrorCard title={errorTitle} message={error} onClose={() => { setError(''); setErrorTitle(undefined) }} />}
      <input className="border p-2 rounded w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Create account</button>
    </form>
  )
}
