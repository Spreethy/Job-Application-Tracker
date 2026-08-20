import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import ApplicationForm from '../components/ApplicationForm'

export default function AddApplication() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.createApplication(payload)
      navigate(`/applications/${res.data.id}`)
    } catch (err) {
      setError(err.details ? err.details.join(', ') : err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/applications" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to applications
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Add application</h1>
      </div>
      <ApplicationForm
        onSubmit={handleSubmit}
        submitLabel="Save application"
        onCancel={() => navigate('/applications')}
        submitting={submitting}
        error={error}
      />
    </div>
  )
}