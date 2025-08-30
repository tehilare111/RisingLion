import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { authFetch, useAuth } from '../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Seat = { id: number; row: string; number: number; taken: boolean }

type Screening = { id: number; ticketPrice: number }

export default function SeatBooking() {
  const { id } = useParams()
  const loc = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const screeningId = new URLSearchParams(loc.search).get('screeningId')
  const [seats, setSeats] = useState<Seat[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [screening, setScreening] = useState<Screening | null>(null)

  useEffect(() => {
    if (!screeningId) return
    fetch(`${API}/screenings/${screeningId}/seats`).then(r => r.json()).then(setSeats)
    fetch(`${API}/screenings/${screeningId}`).then(r => r.json()).then(setScreening)
  }, [screeningId])

  const total = useMemo(() => (screening ? selected.length * Number(screening.ticketPrice) : selected.length), [selected, screening])
  const columns = useMemo(() => (seats.length ? Math.max(...seats.map(s => s.number)) : 12), [seats])

  function toggleSeat(id: number, taken: boolean) {
    if (taken) return
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function book() {
    if (!user) { navigate('/login'); return }
    const res = await authFetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ screeningId: Number(screeningId), seatIds: selected }) })
    if (res.status === 409) {
      window.dispatchEvent(new CustomEvent('app-error', { detail: { message: 'Some seats were just taken. Please reselect.' } }))
      setSelected([])
      setSeats(await (await fetch(`${API}/screenings/${screeningId}/seats`)).json())
      return
    }
    if (!res.ok) {
      try { const p = await res.json(); if (p?.detail || p?.message) { window.dispatchEvent(new CustomEvent('app-error', { detail: { message: p.detail || p.message } })) } }
      catch { /* no message -> show nothing; button state unchanged */ }
      return
    }
    navigate('/bookings')
  }

  const rows = Array.from(new Set(seats.map(s => s.row)))

  return (
    <div className="space-y-4">
      <div className="text-sm text-brand-brown">Ticket price: {screening ? screening.ticketPrice : '—'}</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
        {rows.map(row => (
          <div key={row} className="contents">
            {seats.filter(s => s.row === row).map(s => (
              <button key={s.id} onClick={() => toggleSeat(s.id, s.taken)} className={`border rounded p-2 text-center ${s.taken ? 'bg-gray-300' : selected.includes(s.id) ? 'bg-brand-gold text-brand-black' : 'bg-white'} border-brand-brown/30`}>{row}{s.number}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold text-brand-black">Selected: {selected.length} • Total: {total}$</div>
        <button disabled={!selected.length} onClick={book} className="btn-brand disabled:opacity-50">Book</button>
      </div>
    </div>
  )
}
