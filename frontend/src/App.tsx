import { Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import MovieDetails from './pages/MovieDetails'
import MovieScreenings from './pages/MovieScreenings'
import SeatBooking from './pages/SeatBooking'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminCategories from './pages/admin/AdminCategories'
import AdminTheaters from './pages/admin/AdminTheaters'
import AdminUsers from './pages/admin/AdminUsers'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyBookings from './pages/MyBookings'

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user?.isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movies/:id/screenings" element={<MovieScreenings />} />
          <Route path="/movies/:id/seats" element={<SeatBooking />} />
          <Route path="/bookings" element={<MyBookings />} />

          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/movies" element={<AdminRoute><AdminMovies /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/theaters" element={<AdminRoute><AdminTheaters /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
