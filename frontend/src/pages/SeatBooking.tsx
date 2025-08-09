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

  function toggleSeat(id: number, taken: boolean) {
    if (taken) return
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  async function book() {
    if (!user) { navigate('/login'); return }
    const res = await authFetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ screeningId: Number(screeningId), seatIds: selected }) })
    if (res.status === 409) { alert('Some seats were just taken. Please reselect.'); setSelected([]); setSeats(await (await fetch(`${API}/screenings/${screeningId}/seats`)).json()); return }
    if (!res.ok) { alert('Booking failed'); return }
    navigate('/bookings')
  }

  const rows = Array.from(new Set(seats.map(s => s.row)))

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">Ticket price: {screening ? screening.ticketPrice : '—'}</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(...seats.map(s => s.number), 12)}, minmax(0,1fr))` }}>
        {rows.map(row => (
          <div key={row} className="contents">
            {seats.filter(s => s.row === row).map(s => (
              <button key={s.id} onClick={() => toggleSeat(s.id, s.taken)} className={`border rounded p-2 text-center ${s.taken ? 'bg-gray-300' : selected.includes(s.id) ? 'bg-green-500 text-white' : 'bg-white'}`}>{row}{s.number}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="font-semibold">Selected: {selected.length} • Total: {total}</div>
        <button disabled={!selected.length} onClick={book} className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded">Book</button>
      </div>
    </div>
  )
}
