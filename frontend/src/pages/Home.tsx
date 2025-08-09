import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Category = { id: number; name: string }

type Movie = { id: number; title: string; imageURL: string; category: Category }

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | ''>('')
  const [query, setQuery] = useState('')

  useEffect(() => { fetch(`${API}/categories`).then(r => r.json()).then(setCategories) }, [])
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (categoryId) params.set('categoryId', String(categoryId))
    fetch(`${API}/movies?${params.toString()}`).then(r => r.json()).then(p => setMovies(p.content || []))
  }, [query, categoryId])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." className="border p-2 rounded w-full" />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : '')} className="border p-2 rounded">
          <option value="">All</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map(m => (
          <Link key={m.id} to={`/movies/${m.id}`} className="bg-white rounded shadow overflow-hidden">
            <img src={m.imageURL} alt={m.title} className="w-full h-40 object-cover" />
            <div className="p-2">
              <div className="font-semibold">{m.title}</div>
              <div className="text-sm text-gray-500">{m.category?.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
