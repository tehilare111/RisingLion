import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type User = { id: number; email: string; isAdmin: boolean }

type AuthContextType = {
  token: string | null
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>(null as any)

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token')
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
  }, [token, user])

  async function login(email: string, password: string) {
    const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    setToken(data.accessToken)
    setUser(data.user)
  }

  async function signup(username: string, email: string, password: string) {
    const res = await fetch(`${API}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) })
    if (!res.ok) throw new Error('Signup failed')
    const data = await res.json()
    setToken(data.accessToken)
    setUser(data.user)
  }

  function logout() { setToken(null); setUser(null) }

  const value = useMemo(() => ({ token, user, login, signup, logout }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }

export async function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem('token')
  const headers = new Headers(init?.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(input, { ...init, headers })
  if (!res.ok) {
    try {
      const problem = await res.clone().json()
      const message = problem?.detail || problem?.message
      if (message) {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { message } }))
      }
    } catch {
      // No body / not JSON -> don't show a generic HTTP code toast; caller can handle
    }
  }
  return res
}

export async function fetchJsonOrThrow(input: RequestInfo, init?: RequestInit): Promise<any> {
  const res = await authFetch(input, init)
  if (!res.ok) {
    let title = 'Request failed'
    let message = `${res.status} ${res.statusText}`
    try {
      const problem = await res.json()
      // Spring ProblemDetail typically provides title/detail
      if (problem?.title) title = problem.title
      if (problem?.detail) message = problem.detail
      else if (problem?.message) message = problem.message
    } catch {}
    const err = new Error(message) as Error & { title?: string; status?: number }
    err.title = title
    err.status = res.status
    throw err
  }
  try { return await res.json() } catch { return null }
}
