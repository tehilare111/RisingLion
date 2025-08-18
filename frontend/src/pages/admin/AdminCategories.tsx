import { useEffect, useState } from 'react'
import { authFetch, fetchJsonOrThrow } from '../../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Category = { id: number; name: string }

export default function AdminCategories(){
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined)

  async function load(){
    try { setCategories(await fetchJsonOrThrow(`${API}/categories`)) }
    catch (e: any) { setError(e?.message || 'Failed to load categories'); setErrorTitle(e?.title) }
  }
  useEffect(() => { load() }, [])

  async function createCategory(e: React.FormEvent){
    e.preventDefault()
    if (!newName.trim()) return
    try {
      const res = await authFetch(`${API}/admin/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim() }) })
      if (!res.ok) throw await toProblemError(res)
    } catch (e: any) { setError(e?.message || 'Failed to create category'); setErrorTitle(e?.title); return }
    setNewName('')
    load()
  }

  function startEdit(c: Category){ setEditingId(c.id); setEditName(c.name) }
  function cancelEdit(){ setEditingId(null); setEditName('') }

  async function saveEdit(e: React.FormEvent){
    e.preventDefault()
    if (editingId == null) return
    try {
      const res = await authFetch(`${API}/admin/categories/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName.trim() }) })
      if (!res.ok) throw await toProblemError(res)
    } catch (e: any) { setError(e?.message || 'Failed to update category'); setErrorTitle(e?.title); return }
    cancelEdit(); load()
  }

  async function remove(c: Category){
    try {
      const res = await authFetch(`${API}/admin/categories/${c.id}`, { method: 'DELETE' })
      if (!res.ok) throw await toProblemError(res)
    } catch (e: any) { setError(e?.message || 'Failed to delete category'); setErrorTitle(e?.title); return }
    load()
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Categories</h1>

      <form onSubmit={createCategory} className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-600">New category name</label>
          <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. Action" />
        </div>
        <button className="px-3 py-2 border rounded bg-blue-600 text-white">Add</button>
      </form>

      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.id}</td>
              <td className="p-2">
                {editingId === c.id ? (
                  <form onSubmit={saveEdit} className="flex gap-2 items-center">
                    <input value={editName} onChange={e => setEditName(e.target.value)} className="border rounded px-2 py-1" />
                    <button className="px-2 py-1 border rounded bg-blue-600 text-white">Save</button>
                    <button type="button" onClick={cancelEdit} className="px-2 py-1 border rounded">Cancel</button>
                  </form>
                ) : (
                  c.name
                )}
              </td>
              <td className="p-2 space-x-2 text-center">
                {editingId === c.id ? null : (
                  <>
                    <button onClick={() => startEdit(c)} className="px-2 py-1 border rounded">Edit</button>
                    <button onClick={() => remove(c)} className="px-2 py-1 border rounded text-red-600">Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
