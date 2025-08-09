import { useEffect, useState } from 'react'
import { authFetch } from '../../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type User = { id: number; username: string; email: string; isAdmin: boolean }

export default function AdminUsers(){
  const [users, setUsers] = useState<User[]>([])
  async function load(){ const res = await authFetch(`${API}/admin/users`); setUsers(await res.json()) }
  useEffect(() => { load() }, [])

  async function toggleRole(u: User){ await authFetch(`${API}/admin/users/${u.id}/role/${u.isAdmin ? 'USER' : 'ADMIN'}`, { method: 'PATCH' }); load() }
  async function remove(u: User){ await authFetch(`${API}/admin/users/${u.id}`, { method: 'DELETE' }); load() }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Users</h1>
      <table className="min-w-full border">
        <thead><tr className="bg-gray-100"><th className="p-2 text-left">Email</th><th className="p-2">Role</th><th className="p-2">Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.isAdmin ? 'ADMIN' : 'USER'}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => toggleRole(u)} className="px-2 py-1 border rounded">{u.isAdmin ? 'Demote' : 'Promote'}</button>
                <button onClick={() => remove(u)} className="px-2 py-1 border rounded text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
