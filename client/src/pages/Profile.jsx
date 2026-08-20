import { useEffect, useState } from 'react'
import { api } from '../api/client'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const skills = (formData.get('skills') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = {
      name: formData.get('name'),
      title: formData.get('title'),
      summary: formData.get('summary'),
      skills,
      experience: formData.get('experience'),
      education: formData.get('education'),
    }

    setSaving(true)
    setMessage('')
    setError('')
    try {
      const res = await api.updateProfile(payload)
      setProfile(res.data)
      setMessage('Profile saved. AI features will use these details.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          This is what the AI uses to score job fit and generate interview prep.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}
      {message && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={profile?.name || ''}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Target title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Full-Stack Developer"
              defaultValue={profile?.title || ''}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows="3"
            defaultValue={profile?.summary || ''}
            className={inputClass + ' resize-y'}
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
            Skills <span className="text-gray-400 font-normal">(comma separated)</span>
          </label>
          <input
            id="skills"
            name="skills"
            type="text"
            placeholder="React, Node.js, MongoDB, TypeScript..."
            defaultValue={profile?.skills?.join(', ') || ''}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Experience
          </label>
          <textarea
            id="experience"
            name="experience"
            rows="3"
            defaultValue={profile?.experience || ''}
            className={inputClass + ' resize-y'}
          />
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
            Education
          </label>
          <input
            id="education"
            name="education"
            type="text"
            defaultValue={profile?.education || ''}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}