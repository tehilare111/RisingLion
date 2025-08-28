import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Theater = { id: number }

type Movie = { id: number; title: string }

// Minimal movie loader using paged /movies
async function fetchAllMovies(): Promise<Movie[]> {
  const items: Movie[] = []
  for (let p = 0; p < 5; p++) {
    const res = await fetch(`${API}/movies?page=${p}`)
    if (!res.ok) break
    const data = await res.json()
    if (!data?.content?.length) break
    items.push(...data.content.map((m: any) => ({ id: m.id, title: m.title })))
    if (p + 1 >= (data.totalPages ?? 1)) break
  }
  return items
}

type Screening = { id: number; datetime: string; ticketPrice: string; movieId: number; theaterId: number }

export default function AdminTheaters(){
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined)

  // Create theater
  const [creatingTheater, setCreatingTheater] = useState(false)

  // Create screening
  const [cMovieId, setCMovieId] = useState<number | ''>('')
  const [cTheaterId, setCTheaterId] = useState<number | ''>('')
  const [cDatetime, setCDatetime] = useState('')
  const [cPrice, setCPrice] = useState('')

  // Edit screening
  const [editingId, setEditingId] = useState<number | null>(null)
  const [eMovieId, setEMovieId] = useState<number | ''>('')
  const [eTheaterId, setETheaterId] = useState<number | ''>('')
  const [eDatetime, setEDatetime] = useState('')
  const [ePrice, setEPrice] = useState('')

  async function loadTheaters(){
    const res = await fetch(`${API}/theaters`)
    if (!res.ok) { try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to load theaters'); setErrorTitle(p?.title) } catch { setError('Failed to load theaters') }; return }
    setTheaters(await res.json())
  }
  async function loadMovies(){
    try { setMovies(await fetchAllMovies()) }
    catch { /* fallback to empty list */ }
  }
  async function loadScreenings(){
    const res = await fetch(`${API}/screenings?date=${date}`)
    if (!res.ok) { try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to load screenings'); setErrorTitle(p?.title) } catch { setError('Failed to load screenings') }; return }
    setScreenings(await res.json())
  }

  useEffect(() => { loadTheaters(); loadMovies() }, [])
  useEffect(() => { loadScreenings() }, [date])

  const canCreateScreening = useMemo(() => !!(cMovieId && cTheaterId && cDatetime && cPrice), [cMovieId, cTheaterId, cDatetime, cPrice])

  async function createTheater(){
    setCreatingTheater(true)
    try {
      const res = await authFetch(`${API}/admin/theaters`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      if (!res.ok) {
        try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to create theater'); setErrorTitle(p?.title) } catch { setError('Failed to create theater') }
        return
      }
      await loadTheaters()
    } finally { setCreatingTheater(false) }
  }

  async function deleteTheater(id: number){
    const res = await authFetch(`${API}/admin/theaters/${id}`, { method: 'DELETE' })
    if (!res.ok) { try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to delete theater'); setErrorTitle(p?.title) } catch { setError('Failed to delete theater') }; return }
    loadTheaters(); loadScreenings()
  }

  async function createScreening(e: React.FormEvent){
    e.preventDefault()
    if (!canCreateScreening) return
    const res = await authFetch(`${API}/admin/screenings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movieId: Number(cMovieId), theaterId: Number(cTheaterId), datetime: new Date(cDatetime).toISOString(), ticketPrice: cPrice }) })
    if (!res.ok) { try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to create screening'); setErrorTitle(p?.title) } catch { setError('Failed to create screening') }; return }
    setCMovieId(''); setCTheaterId(''); setCDatetime(''); setCPrice('')
    loadScreenings()
  }

  function startEdit(s: Screening){
    const d = new Date(s.datetime)
    const localInput = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16)
    setEditingId(s.id); setEMovieId(s.movieId); setETheaterId(s.theaterId); setEDatetime(localInput); setEPrice(String(s.ticketPrice))
  }
  function cancelEdit(){ setEditingId(null) }

  async function saveEdit(e: React.FormEvent){
    e.preventDefault()
    if (editingId == null) return
    const res = await authFetch(`${API}/admin/screenings/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ movieId: Number(eMovieId), theaterId: Number(eTheaterId), datetime: new Date(eDatetime).toISOString(), ticketPrice: ePrice }) })
    if (!res.ok) { try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to update screening'); setErrorTitle(p?.title) } catch { setError('Failed to update screening') }; return }
    setEditingId(null); loadScreenings()
  }

  async function deleteScreening(id: number){
    const res = await authFetch(`${API}/admin/screenings/${id}`, { method: 'DELETE' })
    if (!res.ok) { try { const p = await res.json(); setError(p?.detail || p?.message || 'Failed to delete screening'); setErrorTitle(p?.title) } catch { setError('Failed to delete screening') }; return }
    loadScreenings()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold font-display text-brand-black">Theaters & Screenings</h1>

      {/* Theaters */}
      <div className="border border-brand-brown/20 rounded p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Theaters</h2>
          <button onClick={createTheater} className="btn-brand" disabled={creatingTheater}>{creatingTheater ? 'Creating...' : 'Add Theater'}</button>
        </div>
        <ul className="list-disc pl-5 space-y-1">
          {theaters.map(t => (
            <li key={t.id} className="flex items-center justify-between">
              <span>Theater #{t.id}</span>
              <button onClick={() => deleteTheater(t.id)} className="px-2 py-1 border rounded text-red-600">Delete</button>
            </li>
          ))}
          {theaters.length === 0 && <li className="text-gray-500">No theaters yet.</li>}
        </ul>
      </div>

      {/* Screenings */}
      <div className="space-y-3">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm text-gray-600">Date</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="border rounded px-3 py-2" />
          </div>
        </div>

        <form onSubmit={createScreening} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border border-brand-brown/20 rounded bg-white">
          <div>
            <label className="block text-sm text-brand-brown">Movie</label>
            <select className="w-full border rounded px-3 py-2" value={cMovieId} onChange={e=>setCMovieId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select...</option>
              {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-brown">Theater</label>
            <select className="w-full border rounded px-3 py-2" value={cTheaterId} onChange={e=>setCTheaterId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">Select...</option>
              {theaters.map(t => <option key={t.id} value={t.id}>Theater #{t.id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-brown">Date & Time</label>
            <input type="datetime-local" className="w-full border rounded px-3 py-2" value={cDatetime} onChange={e=>setCDatetime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-brand-brown">Ticket Price</label>
            <input type="number" step="0.01" className="w-full border rounded px-3 py-2" value={cPrice} onChange={e=>setCPrice(e.target.value)} />
          </div>
          <div className="md:col-span-4">
            <button className="btn-brand disabled:opacity-50" disabled={!canCreateScreening}>Add Screening</button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-brand-brown/20 bg-white">
            <thead>
              <tr className="bg-brand-cream/80">
                <th className="p-2 text-left">When</th>
                <th className="p-2 text-left">Movie</th>
                <th className="p-2 text-left">Theater</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {screenings.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">
                    {editingId === s.id ? (
                      <input type="datetime-local" value={eDatetime} onChange={e=>setEDatetime(e.target.value)} className="border rounded px-2 py-1" />
                    ) : new Date(s.datetime).toLocaleString()}
                  </td>
                  <td className="p-2">
                    {editingId === s.id ? (
                      <select className="border rounded px-2 py-1" value={eMovieId} onChange={e=>setEMovieId(e.target.value ? Number(e.target.value) : '')}>
                        <option value="">Select...</option>
                        {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                      </select>
                    ) : (movies.find(m => m.id === s.movieId)?.title || s.movieId)}
                  </td>
                  <td className="p-2">
                    {editingId === s.id ? (
                      <select className="border rounded px-2 py-1" value={eTheaterId} onChange={e=>setETheaterId(e.target.value ? Number(e.target.value) : '')}>
                        <option value="">Select...</option>
                        {theaters.map(t => <option key={t.id} value={t.id}>Theater #{t.id}</option>)}
                      </select>
                    ) : `Theater #${s.theaterId}`}
                  </td>
                  <td className="p-2">
                    {editingId === s.id ? (
                      <input
                        type="number"
                        step="0.1"
                        className="border rounded px-2 py-1 w-28 text-right"
                        value={ePrice}
                        onChange={e=>setEPrice(e.target.value)}
                      />
                    ) : `$${s.ticketPrice}`}
                  </td>
                  <td className="p-2 space-x-2 whitespace-nowrap text-center">
                    {editingId === s.id ? (
                      <>
                        <button onClick={saveEdit} className="btn-brand px-3 py-1">Save</button>
                        <button onClick={cancelEdit} className="btn-outline px-3 py-1">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(s)} className="btn-outline px-3 py-1">Edit</button>
                        <button onClick={() => deleteScreening(s.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {screenings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-2 text-center text-gray-500">No screenings for this date.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
