import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
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
      <main className="flex-1 max-w-6xl mx-auto p-4">{children}</main>
    </div>
  )
}
