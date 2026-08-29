import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import ApplicationForm from '../components/ApplicationForm'

export default function EditApplication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getApplication(id)
      .then((res) => setApplication(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await api.updateApplication(id, payload)
      navigate(`/applications/${res.data.id}`)
    } catch (err) {
      setError(err.details ? err.details.join(', ') : err.message)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-500">
        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-2 text-sm">Loading...</p>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Link to="/applications" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to applications
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to={`/applications/${id}`} className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to {application.company}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit application</h1>
        <p className="text-sm text-gray-500">
          {application.company} · {application.role}
        </p>
      </div>
      <ApplicationForm
        initial={application}
        showStatus
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        onCancel={() => navigate(`/applications/${id}`)}
        submitting={submitting}
        error={error}
      />
    </div>
  )
}