import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import ErrorCard from './ErrorCard'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [toasts, setToasts] = useState<Array<{ id: number; title?: string; message: string }>>([])
  const timersRef = useRef<Record<number, number>>({})

  useEffect(() => {
    function onErr(e: any){
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts(prev => [...prev, { id, title: e.detail?.title, message: e.detail?.message }])
      // Auto-dismiss after 5s
      const timeoutId = window.setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        delete timersRef.current[id]
      }, 5000)
      timersRef.current[id] = timeoutId
    }
    window.addEventListener('app-error', onErr as any)
    return () => {
      window.removeEventListener('app-error', onErr as any)
      // Clear pending timers
      Object.values(timersRef.current).forEach(clearTimeout)
      timersRef.current = {}
    }
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">RisingLion</Link>
          <nav className="flex gap-4 items-center">
            <NavLink to="/" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Home</NavLink>
            {user && <NavLink to="/bookings">My bookings</NavLink>}
            {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
            {!user ? (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/signup">Sign up</NavLink>
              </>
            ) : (
              <button onClick={logout} className="text-red-600">Logout</button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto p-4">
        {children}
      </main>
      {/* Bottom-left toasts */}
      <div className="fixed bottom-4 left-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className="max-w-xs">
            <ErrorCard
              title={t.title}
              message={t.message}
              onClose={() => {
                if (timersRef.current[t.id]) { clearTimeout(timersRef.current[t.id]); delete timersRef.current[t.id] }
                setToasts(prev => prev.filter(x => x.id !== t.id))
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
