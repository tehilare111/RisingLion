import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('min123!')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { login } = useAuth()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try { await login(email, password); nav('/') } catch (e) { setError('Invalid credentials') }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Login</h1>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-2 rounded w-full" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  )
}
