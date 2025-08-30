import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Screening = { id: number; datetime: string; theaterId: number; fullyBooked?: boolean }

export default function MovieScreenings() {
  const { id } = useParams()
  // Use local date (not UTC) for default to avoid off-by-one issues
  const [date, setDate] = useState<string>(() => new Date().toLocaleDateString('en-CA'))
  const [items, setItems] = useState<Screening[]>([])
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetch(`${API}/movies/${id}/screenings?date=${date}`).then(async r => {
      if (!r.ok) {
        try { const p = await r.json(); setError(p?.detail || p?.message || 'Failed to load screenings'); setErrorTitle(p?.title) }
        catch { setError('Failed to load screenings') }
        return []
      }
      return r.json()
    }).then(setItems as any)
  }, [id, date])

  return (
    <div className="space-y-4">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(s => {
          const dt = new Date(s.datetime)
          const isPast = dt.getTime() < Date.now()
          const unavailable = isPast || s.fullyBooked
          const cardCls = unavailable ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-brand'
          return (
            <div key={s.id} className={`border border-brand-brown/20 rounded-lg bg-white p-4 flex flex-col gap-2 ${cardCls}`}>
              <div className="text-lg font-semibold text-brand-black">{dt.toLocaleString()}</div>
              <div className="text-sm text-brand-brown">Theater #{s.theaterId}</div>
              <div className="mt-2">
                {unavailable ? (
                  <button disabled className="px-3 py-2 rounded border border-brand-brown/30 bg-gray-200 text-gray-500">{s.fullyBooked ? 'Fully booked' : 'Unavailable'}</button>
                ) : (
                  <Link to={`/movies/${id}/seats?screeningId=${s.id}`} className="btn-brand inline-block">Select seats</Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
