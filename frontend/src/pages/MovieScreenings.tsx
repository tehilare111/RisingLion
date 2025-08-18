import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Screening = { id: number; datetime: string }

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
    <div className="space-y-3">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
      <div className="flex flex-wrap gap-2">
        {items.map(s => (
          <Link key={s.id} to={`/movies/${id}/seats?screeningId=${s.id}`} className="bg-white border px-3 py-2 rounded">
            {new Date(s.datetime).toLocaleString()}
          </Link>
        ))}
      </div>
    </div>
  )
}
