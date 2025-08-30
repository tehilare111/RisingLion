import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Ticket = { id: number; seatId: number }

type Booking = {
  id: number
  screeningId: number
  theaterId: number
  movieTitle: string
  screeningDatetime: string
  totalPrice: number
  tickets: Ticket[]
}

export default function MyBookings() {
  const [items, setItems] = useState<Booking[]>([])
  useEffect(() => { authFetch(`${API}/bookings/me`).then(r => r.json()).then(setItems) }, [])
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  const filtered = useMemo(() => {
    const now = Date.now()
    const withTs = items.map(b => ({ ...b, ts: new Date(b.screeningDatetime).getTime() }))
    let list = withTs
    if (filter === 'upcoming') list = withTs.filter(b => b.ts >= now)
    if (filter === 'past') list = withTs.filter(b => b.ts < now)
    // Sort: upcoming ascending, past descending, all by date desc
    if (filter === 'upcoming') return list.sort((a,b) => a.ts - b.ts)
    if (filter === 'past') return list.sort((a,b) => b.ts - a.ts)
    return list.sort((a,b) => b.ts - a.ts)
  }, [items, filter])
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold font-display text-brand-black">My bookings</h1>
      <div className="flex gap-2">
        <button onClick={() => setFilter('upcoming')} className={`px-3 py-1 rounded border ${filter==='upcoming' ? 'bg-brand-gold text-brand-black border-brand-brown/30' : 'bg-white border-brand-brown/30'}`}>Upcoming</button>
        <button onClick={() => setFilter('past')} className={`px-3 py-1 rounded border ${filter==='past' ? 'bg-brand-gold text-brand-black border-brand-brown/30' : 'bg-white border-brand-brown/30'}`}>Past</button>
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded border ${filter==='all' ? 'bg-brand-gold text-brand-black border-brand-brown/30' : 'bg-white border-brand-brown/30'}`}>All</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(b => (
          <div key={b.id} className="border border-brand-brown/20 rounded-lg bg-white p-4 flex flex-col gap-3 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="text-sm text-brand-brown">Booking #{b.id}</div>
                <div className="text-lg font-semibold text-brand-black">{b.movieTitle}</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-brand-cream text-brand-black font-semibold whitespace-nowrap">
                Total: {b.totalPrice}$
              </div>
            </div>
            <div className="text-sm">
              <div className="text-brand-black">{new Date(b.screeningDatetime).toLocaleString()}</div>
              <div className="text-brand-brown">Theater #{b.theaterId}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {b.tickets.length ? b.tickets.map(t => (
                <span key={t.id} className="px-2 py-1 rounded border border-brand-brown/30 text-sm bg-brand-cream/60">Seat #{t.seatId}</span>
              )) : <span className="text-sm text-brand-brown">No seats</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
