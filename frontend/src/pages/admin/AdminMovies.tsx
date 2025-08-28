import { useEffect, useMemo, useState } from 'react'
import { authFetch, fetchJsonOrThrow } from '../../auth/AuthContext'

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
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined)

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
    try { setCategories(await fetchJsonOrThrow(`${API}/categories`)) }
    catch (e: any) { setError(e?.message || 'Failed to load categories'); setErrorTitle(e?.title) }
  }

  async function loadMovies(p = page){
    try { setMoviesPage(await fetchJsonOrThrow(`${API}/movies?page=${p}`)) }
    catch (e: any) { setError(e?.message || 'Failed to load movies'); setErrorTitle(e?.title) }
  }

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadMovies(0); setPage(0) }, [])

  const canCreate = useMemo(() => !!(title.trim() && duration && releaseDate && categoryId && description.trim()), [title, duration, releaseDate, categoryId, description])

  async function createMovie(e: React.FormEvent){
    e.preventDefault()
    if (!canCreate) return
    try {
      const res = await authFetch(`${API}/admin/movies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), duration: Number(duration), description: description.trim(), releaseDate, imageURL: imageURL.trim(), categoryId: Number(categoryId) })
      })
      if (!res.ok) throw await toProblemError(res)
    } catch (e: any) { setError(e?.message || 'Failed to create movie'); setErrorTitle(e?.title); return }
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
    try {
      const res = await authFetch(`${API}/admin/movies/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: eTitle.trim(), duration: Number(eDuration), description: eDescription.trim(), releaseDate: eReleaseDate, imageURL: eImageURL.trim(), categoryId: Number(eCategoryId) })
      })
      if (!res.ok) throw await toProblemError(res)
    } catch (e: any) { setError(e?.message || 'Failed to update movie'); setErrorTitle(e?.title); return }
    setEditingId(null)
    loadMovies(page)
  }

  async function remove(m: Movie){
    try {
      const res = await authFetch(`${API}/admin/movies/${m.id}`, { method: 'DELETE' })
      if (!res.ok) throw await toProblemError(res)
    } catch (e: any) { setError(e?.message || 'Failed to delete movie'); setErrorTitle(e?.title); return }
    // If removing last item on last page, refetch previous page
    const newCount = (moviesPage?.content.length || 1) - 1
    const targetPage = newCount <= 0 && page > 0 ? page - 1 : page
    setPage(targetPage)
    loadMovies(targetPage)
  }

  async function toProblemError(res: Response) {
    let title = 'Request failed'
    let message = `${res.status} ${res.statusText}`
    try {
      const problem = await res.json()
      if (problem?.title) title = problem.title
      if (problem?.detail) message = problem.detail
      else if (problem?.message) message = problem.message
    } catch {}
    const err = new Error(message) as Error & { title?: string; status?: number }
    err.title = title; err.status = res.status
    return err
  }

  function goto(p: number){ setPage(p); loadMovies(p) }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold font-display text-brand-black">Movies</h1>

      {/* Create */}
      <form onSubmit={createMovie} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border border-brand-brown/20 rounded bg-white">
        <div>
          <label className="block text-sm text-brand-brown">Title</label>
          <input className="w-full border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Movie title" />
        </div>
        <div>
          <label className="block text-sm text-brand-brown">Duration (min)</label>
          <input type="number" className="w-full border rounded px-3 py-2" value={duration} onChange={e=>setDuration(e.target.value ? Number(e.target.value) : '')} />
        </div>
        <div>
          <label className="block text-sm text-brand-brown">Release date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={releaseDate} onChange={e=>setReleaseDate(e.target.value)} />
        </div>
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm text-brand-brown">Category</label>
          <select className="w-full border rounded px-3 py-2" value={categoryId} onChange={e=>setCategoryId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Select...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-brand-brown">Image URL</label>
          <input className="w-full border rounded px-3 py-2" value={imageURL} onChange={e=>setImageURL(e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm text-brand-brown">Description</label>
          <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
        </div>
        <div className="md:col-span-3">
          <button className="btn-brand disabled:opacity-50" disabled={!canCreate}>Add Movie</button>
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-brand-brown/20 bg-white">
          <thead>
            <tr className="bg-brand-cream/80">
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
                    <>
                      <input className="border rounded px-2 py-1 w-full" value={eTitle} onChange={e=>setETitle(e.target.value)} />
                      <textarea
                        className="mt-2 border rounded px-2 py-1 w-full"
                        rows={3}
                        value={eDescription}
                        onChange={e=>setEDescription(e.target.value)}
                        placeholder="Description"
                      />
                    </>
                  ) : (
                    <>
                      {m.title}
                      <div className="text-xs text-gray-500 truncate max-w-xs">{m.description}</div>
                    </>
                  )}
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
                      <button onClick={saveEdit} className="btn-brand px-3 py-1">Save</button>
                      <button onClick={cancelEdit} className="btn-outline px-3 py-1">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(m)} className="btn-outline px-3 py-1">Edit</button>
                      <button onClick={() => remove(m)} className="px-3 py-1 border rounded text-red-600">Delete</button>
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
