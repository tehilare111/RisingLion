import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Screening = { id: number; datetime: string }

export default function MovieScreenings() {
  const { id } = useParams()
  // Use local date (not UTC) for default to avoid off-by-one issues
  const [date, setDate] = useState<string>(() => new Date().toLocaleDateString('en-CA'))
  const [items, setItems] = useState<Screening[]>([])

  useEffect(() => {
    fetch(`${API}/movies/${id}/screenings?date=${date}`).then(r => r.json()).then(setItems)
  }, [id, date])

  return (
    <div className="space-y-3">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded" />
      <div className="flex flex-wrap gap-2">
        {items.map(s => (
          <Link key={s.id} to={`/movies/${id}/seats?screeningId=${s.id}`} className="bg-white border px-3 py-2 rounded">
            {new Date(s.datetime).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })}
          </Link>
        ))}
      </div>
    </div>
  )
}
