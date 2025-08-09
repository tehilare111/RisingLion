import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { authFetch, useAuth } from '../auth/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

type Category = { id: number; name: string }

type Movie = { id: number; title: string; imageURL: string; description: string; duration: number; category: Category }

type Review = { id: number; rating: number; text: string; userId: number; movieId: number }

export default function MovieDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<number>(5)
  const [text, setText] = useState<string>('')
  const myReview = useMemo(() => reviews.find(r => r.userId === user?.id), [reviews, user])

  useEffect(() => {
    fetch(`${API}/movies/${id}`).then(r => r.json()).then(setMovie)
  }, [id])

  useEffect(() => {
    fetch(`${API}/movies/${id}/reviews`).then(r => r.json()).then((rs: Review[]) => {
      setReviews(rs)
      const mine = rs.find(r => r.userId === user?.id)
      if (mine) { setRating(mine.rating); setText(mine.text || '') } else { setRating(5); setText('') }
    })
  }, [id, user?.id])

  async function submitReview() {
    if (!user) return alert('Please login to review')
    const method = myReview ? 'PUT' : 'POST'
    const res = await authFetch(`${API}/movies/${id}/reviews`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, text })
    })
    if (res.status === 403) { alert("You can only review movies you've seen."); return }
    if (!res.ok) { alert('Failed to submit review'); return }
    setReviews(await (await fetch(`${API}/movies/${id}/reviews`)).json())
  }

  async function deleteReview() {
    if (!user || !myReview) return
    const res = await authFetch(`${API}/movies/${id}/reviews`, { method: 'DELETE' })
    if (!res.ok) { alert('Failed to delete review'); return }
    setText(''); setRating(5)
    setReviews(await (await fetch(`${API}/movies/${id}/reviews`)).json())
  }

  if (!movie) return <div>Loading...</div>
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        <img src={movie.imageURL} alt={movie.title} className="w-full rounded" />
        <div className="md:col-span-2 space-y-2">
          <h1 className="text-2xl font-bold">{movie.title}</h1>
          <div className="text-gray-500">{movie.category?.name} • {movie.duration} min</div>
          <p>{movie.description}</p>
          <Link to={`/movies/${id}/screenings`} className="inline-block bg-blue-600 text-white px-4 py-2 rounded">View screenings</Link>
        </div>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Reviews</h2>
        <div className="space-y-3">
          {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
          {reviews.map(r => (
            <div key={r.id} className="border rounded p-3">
              <div className="font-medium">Rating: {r.rating}/5</div>
              <div className="text-sm text-gray-600">User #{r.userId}</div>
              <p className="mt-1 whitespace-pre-wrap">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">{myReview ? 'Update your review' : 'Write a review'}</h3>
        <div className="flex flex-col gap-2 max-w-xl">
          <label className="flex items-center gap-2">Rating
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded p-2">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your thoughts" className="border rounded p-2 min-h-[100px]" />
          <div className="flex gap-2">
            <button onClick={submitReview} className="bg-blue-600 text-white px-4 py-2 rounded">{myReview ? 'Update' : 'Submit'}</button>
            {myReview && <button onClick={deleteReview} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>}
          </div>
          <div className="text-xs text-gray-500">You can review only movies you have seen.</div>
        </div>
      </section>
    </div>
  )
}
