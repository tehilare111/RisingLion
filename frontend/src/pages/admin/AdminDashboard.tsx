import { Link } from 'react-router-dom'

export default function AdminDashboard(){
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Management</h1>
        <p className="text-gray-600">Choose a section to manage data and users.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/movies" className="block rounded border p-4 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
          <h2 className="font-semibold text-lg">Movies</h2>
          <p className="text-sm text-gray-600">Create, edit, or delete movies and set details like duration, description, image and category.</p>
          <div className="mt-3 text-blue-600">Go to Movies →</div>
        </Link>

        <Link to="/admin/categories" className="block rounded border p-4 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
          <h2 className="font-semibold text-lg">Categories</h2>
          <p className="text-sm text-gray-600">Manage movie categories for filtering and organization.</p>
          <div className="mt-3 text-blue-600">Go to Categories →</div>
        </Link>

        <Link to="/admin/theaters" className="block rounded border p-4 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
          <h2 className="font-semibold text-lg">Theaters & Screenings</h2>
          <p className="text-sm text-gray-600">Manage theaters, define screenings (movie, theater, date/time, ticket price) and view bookings per screening.</p>
          <div className="mt-3 text-blue-600">Go to Theaters & Screenings →</div>
        </Link>

        <Link to="/admin/users" className="block rounded border p-4 hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500">
          <h2 className="font-semibold text-lg">Users</h2>
          <p className="text-sm text-gray-600">View users, promote/demote to admin, or remove users.</p>
          <div className="mt-3 text-blue-600">Go to Users →</div>
        </Link>
      </div>
    </div>
  )
}
