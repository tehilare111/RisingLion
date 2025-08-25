import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import ErrorCard from './ErrorCard'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([])
  const timersRef = useRef<Record<number, number>>({})

  useEffect(() => {
    function onErr(e: any){
      const id = Date.now() + Math.floor(Math.random() * 1000)
      setToasts(prev => [...prev, { id, message: e.detail?.message }])
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
    <div className="min-h-screen flex flex-col bg-brand-cream relative isolate">
      {/* Background watermark */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <img src="/rising-lion.png" alt="" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] max-w-[80vw] opacity-10 select-none" />
      </div>
      <header className="brand-header">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3" title="Rising Lion">
            <img
              src="/rising-lion.svg"
              alt="Rising Lion"
              className="h-16 w-16 object-contain"
              onError={(e) => { (e.currentTarget as HTMLImageElement).onerror = null; (e.currentTarget as HTMLImageElement).src = '/rising-lion.png' }}
            />
            <div>
              <div className="brand-title">Rising Lion</div>
              <div className="brand-subtitle -mt-1">Cinema</div>
            </div>
          </Link>
          <nav className="flex gap-1 md:gap-2 items-center text-brand-black">
            <NavLink to="/" className={({ isActive }) => `${'brand-nav-link'} ${isActive ? 'bg-brand-gold/20 text-brand-black' : ''}`}>Home</NavLink>
            {user && <NavLink to="/bookings" className={({ isActive }) => `${'brand-nav-link'} ${isActive ? 'bg-brand-gold/20 text-brand-black' : ''}`}>My bookings</NavLink>}
            {user?.isAdmin && <NavLink to="/admin" className={({ isActive }) => `${'brand-nav-link'} ${isActive ? 'bg-brand-gold/20 text-brand-black' : ''}`}>Admin</NavLink>}
            {!user ? (
              <div className="flex gap-2">
                <NavLink to="/login" className="btn-outline">Login</NavLink>
                <NavLink to="/signup" className="btn-brand">Sign up</NavLink>
              </div>
            ) : (
              <button onClick={logout} className="btn-outline">Logout</button>
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
