import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Category = { id: number; name: string }

type Movie = {
  id: number
  title: string
  duration: number
  description: string
  releaseDate: string // YYYY-MM-DD
  imageURL: string
  category: Category
}

type Page<T> = { content: T[]; totalPages: number; number: number; size: number; totalElements: number }

export default function AdminMovies(){
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(0)
  const [moviesPage, setMoviesPage] = useState<Page<Movie> | null>(null)

  // New movie form state
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [imageURL, setImageURL] = useState('')
  const [categoryId, setCategoryId] = useState<number | ''>('')

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [eTitle, setETitle] = useState('')
  const [eDuration, setEDuration] = useState<number | ''>('')
  const [eDescription, setEDescription] = useState('')
  const [eReleaseDate, setEReleaseDate] = useState('')
  const [eImageURL, setEImageURL] = useState('')
  const [eCategoryId, setECategoryId] = useState<number | ''>('')

  async function loadCategories(){
    const res = await fetch(`${API}/categories`)
    setCategories(await res.json())
  }

  async function loadMovies(p = page){
    const res = await fetch(`${API}/movies?page=${p}`)
    setMoviesPage(await res.json())
  }

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadMovies(0); setPage(0) }, [])

  const canCreate = useMemo(() => !!(title.trim() && duration && releaseDate && categoryId), [title, duration, releaseDate, categoryId])

  async function createMovie(e: React.FormEvent){
    e.preventDefault()
    if (!canCreate) return
    await authFetch(`${API}/admin/movies`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), duration: Number(duration), description: description.trim(), releaseDate, imageURL: imageURL.trim(), categoryId: Number(categoryId) })
    })
    // reset
    setTitle(''); setDuration(''); setDescription(''); setReleaseDate(''); setImageURL(''); setCategoryId('')
    loadMovies(0); setPage(0)
  }

  function startEdit(m: Movie){
    setEditingId(m.id)
    setETitle(m.title); setEDuration(m.duration); setEDescription(m.description || '')
    setEReleaseDate(m.releaseDate); setEImageURL(m.imageURL || ''); setECategoryId(m.category?.id ?? '')
  }
  function cancelEdit(){ setEditingId(null) }

  async function saveEdit(e: React.FormEvent){
    e.preventDefault()
    if (editingId == null || !eTitle.trim() || !eDuration || !eReleaseDate || !eCategoryId) return
    await authFetch(`${API}/admin/movies/${editingId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: eTitle.trim(), duration: Number(eDuration), description: eDescription.trim(), releaseDate: eReleaseDate, imageURL: eImageURL.trim(), categoryId: Number(eCategoryId) })
    })
    setEditingId(null)
    loadMovies(page)
  }

  async function remove(m: Movie){
    await authFetch(`${API}/admin/movies/${m.id}`, { method: 'DELETE' })
    // If removing last item on last page, refetch previous page
    const newCount = (moviesPage?.content.length || 1) - 1
    const targetPage = newCount <= 0 && page > 0 ? page - 1 : page
    setPage(targetPage)
    loadMovies(targetPage)
  }

  function goto(p: number){ setPage(p); loadMovies(p) }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Movies</h1>

      {/* Create */}
      <form onSubmit={createMovie} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded">
        <div>
          <label className="block text-sm text-gray-600">Title</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Movie title" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Duration (min)</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={duration} onChange={e=>setDuration(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Release date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm text-gray-600">Category</label>
          <select className="w-full border rounded px-3 py-2" value={categoryId} onChange={e=>setCategoryId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600">Image URL</label>
          <input className="w-full border rounded px-3 py-2" value={imageURL} onChange={e=>setImageURL(e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
        </div>
        <div className="md:col-span-3">
          <button className="px-3 py-2 border rounded bg-blue-600 text-white disabled:opacity-50" disabled={!canCreate}>Add Movie</button>
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Title</th>
              <th className="p-2">Duration</th>
              <th className="p-2">Release</th>
              <th className="p-2">Category</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {moviesPage?.content.map(m => (
              <tr key={m.id} className="border-t align-top">
                <td className="p-2">
                  {editingId === m.id ? (
                    <input className="border rounded px-2 py-1 w-full" value={eTitle} onChange={e=>setETitle(e.target.value)} />
                  ) : m.title}
                  <div className="text-xs text-gray-500 truncate max-w-xs">{m.description}</div>
                </td>
                <td className="p-2 text-center">
                  {editingId === m.id ? (
                    <input type="number" className="border rounded px-2 py-1 w-24 text-right" value={eDuration} onChange={e=>setEDuration(e.target.value ? Number(e.target.value) : '')} />
                  ) : `${m.duration} min`}
                </td>
                <td className="p-2 text-center">
                  {editingId === m.id ? (
                    <input type="date" className="border rounded px-2 py-1" value={eReleaseDate} onChange={e=>setEReleaseDate(e.target.value)} />
                  ) : m.releaseDate}
                </td>
                <td className="p-2 text-center">
                  {editingId === m.id ? (
                    <select className="border rounded px-2 py-1" value={eCategoryId} onChange={e=>setECategoryId(e.target.value ? Number(e.target.value) : '')}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : m.category?.name}
                </td>
                <td className="p-2 space-x-2 whitespace-nowrap">
                  {editingId === m.id ? (
                    <>
                      <button onClick={saveEdit} className="px-2 py-1 border rounded bg-blue-600 text-white">Save</button>
                      <button onClick={cancelEdit} className="px-2 py-1 border rounded">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(m)} className="px-2 py-1 border rounded">Edit</button>
                      <button onClick={() => remove(m)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {moviesPage && moviesPage.totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border rounded" disabled={page===0} onClick={()=>goto(page-1)}>Prev</button>
          <div>Page {page+1} / {moviesPage.totalPages}</div>
          <button className="px-2 py-1 border rounded" disabled={page+1>=moviesPage.totalPages} onClick={()=>goto(page+1)}>Next</button>
        </div>
      )}
    </div>
  )
}
