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

export function authFetch(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem('token')
  const headers = new Headers(init?.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}
