import { useEffect, useState } from 'react'
import { authFetch } from '../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Ticket = { id: number; seatId: number }

type Booking = { id: number; screeningId: number; totalPrice: number; tickets: Ticket[] }

export default function MyBookings() {
  const [items, setItems] = useState<Booking[]>([])
  useEffect(() => { authFetch(`${API}/bookings/me`).then(r => r.json()).then(setItems) }, [])
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">My bookings</h1>
      {items.map(b => (
        <div key={b.id} className="bg-white border rounded p-3">
          <div>ID: {b.id} • Screening: {b.screeningId}</div>
          <div>Tickets: {b.tickets.map(t => t.seatId).join(', ')}</div>
          <div>Total: {b.totalPrice}</div>
        </div>
      ))}
    </div>
  )
}
