import { useEffect, useState } from 'react'
import { authFetch } from '../../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Category = { id: number; name: string }

export default function AdminCategories(){
  const [categories, setCategories] = useState<Category[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  async function load(){
    const res = await fetch(`${API}/categories`)
    setCategories(await res.json())
  }
  useEffect(() => { load() }, [])

  async function createCategory(e: React.FormEvent){
    e.preventDefault()
    if (!newName.trim()) return
    await authFetch(`${API}/admin/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim() }) })
    setNewName('')
    load()
  }

  function startEdit(c: Category){ setEditingId(c.id); setEditName(c.name) }
  function cancelEdit(){ setEditingId(null); setEditName('') }

  async function saveEdit(e: React.FormEvent){
    e.preventDefault()
    if (editingId == null) return
    await authFetch(`${API}/admin/categories/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName.trim() }) })
    cancelEdit(); load()
  }

  async function remove(c: Category){
    await authFetch(`${API}/admin/categories/${c.id}`, { method: 'DELETE' })
    load()
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
