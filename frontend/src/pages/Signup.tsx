import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { signup } = useAuth()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await signup(username, email, password); nav('/') } catch (e) { setError('Signup failed') }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Sign up</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <input className="border p-2 rounded w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Create account</button>
    </form>
  )
}
