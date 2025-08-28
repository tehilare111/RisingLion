import { Link } from 'react-router-dom'

export default function AdminDashboard(){
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-black font-display">Admin Management</h1>
        <p className="text-brand-brown">Choose a section to manage data and users.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/movies" className="block rounded border border-brand-brown/20 bg-white p-4 hover:shadow-brand focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <h2 className="font-semibold text-lg">Movies</h2>
          <p className="text-sm text-brand-brown">Create, edit, or delete movies and set details like duration, description, image and category.</p>
          <div className="mt-3 text-brand-gold">Go to Movies →</div>
        </Link>

        <Link to="/admin/categories" className="block rounded border border-brand-brown/20 bg-white p-4 hover:shadow-brand focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <h2 className="font-semibold text-lg">Categories</h2>
          <p className="text-sm text-brand-brown">Manage movie categories for filtering and organization.</p>
          <div className="mt-3 text-brand-gold">Go to Categories →</div>
        </Link>

        <Link to="/admin/theaters" className="block rounded border border-brand-brown/20 bg-white p-4 hover:shadow-brand focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <h2 className="font-semibold text-lg">Theaters & Screenings</h2>
          <p className="text-sm text-brand-brown">Manage theaters, define screenings (movie, theater, date/time, ticket price) and view bookings per screening.</p>
          <div className="mt-3 text-brand-gold">Go to Theaters & Screenings →</div>
        </Link>

        <Link to="/admin/users" className="block rounded border border-brand-brown/20 bg-white p-4 hover:shadow-brand focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <h2 className="font-semibold text-lg">Users</h2>
          <p className="text-sm text-brand-brown">View users, promote/demote to admin, or remove users.</p>
          <div className="mt-3 text-brand-gold">Go to Users →</div>
        </Link>
      </div>
    </div>
  )
}
