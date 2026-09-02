import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useToast } from '../components/toast-context'
import { ResumeUpload } from '../components/ResumeUpload'

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'

export default function Profile() {
  const showToast = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    api
      .getProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const skillsValue = Array.isArray(profile?.skills)
    ? profile.skills.join(', ')
    : (profile?.skills || '').toString()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const skillsRaw = Array.isArray(profile?.skills)
      ? profile.skills.join(', ')
      : (profile?.skills || '')
    const skills = skillsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const payload = {
      name: profile?.name,
      title: profile?.title,
      summary: profile?.summary,
      skills,
      experience: profile?.experience,
      education: profile?.education,
    }

    setSaving(true)
    try {
      const res = await api.updateProfile(payload)
      setProfile(res.data)
      setEditing(false)
      showToast('Profile saved. AI features will use these details.', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
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

  if (loadError) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Failed to load profile: {loadError}
      </div>
    )
  }

  const emptyValue = (v) => (v || '').toString().trim() === ''

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            This is what the AI uses to score job fit and generate interview prep.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setProfile({ ...profile })
              setEditing(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Edit profile
          </button>
        )}
      </div>

      {!editing ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {emptyValue(profile?.name) ? '—' : profile.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Target title</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {emptyValue(profile?.title) ? '—' : profile.title}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Summary</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {emptyValue(profile?.summary) ? '—' : profile.summary}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Education</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {emptyValue(profile?.education) ? '—' : profile.education}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Experience</dt>
              <dd className="text-sm text-gray-900 mt-0.5">
                {emptyValue(profile?.experience) ? '—' : profile.experience}
              </dd>
            </div>
          </dl>
          <div>
            <dt className="text-sm font-medium text-gray-500">Skills</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {Array.isArray(profile?.skills) && profile.skills.length ? (
                profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-900">—</span>
              )}
            </dd>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <ResumeUpload
            onParseComplete={(data) => {
              if (data.parsed) {
                setProfile((prev) => ({
                  ...prev,
                  name: data.parsed.name || prev?.name,
                  skills: [...new Set([...(prev?.skills || []), ...data.parsed.skills])],
                  experience: data.parsed.experience || prev?.experience,
                  education: data.parsed.education || prev?.education,
                }))
              }
            }}
          />
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
                value={profile?.name || ''}
                onChange={handleChange}
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
                value={profile?.title || ''}
                onChange={handleChange}
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
              value={profile?.summary || ''}
              onChange={handleChange}
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
              value={skillsValue}
              onChange={handleChange}
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
              value={profile?.experience || ''}
              onChange={handleChange}
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
              value={profile?.education || ''}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
  )
}
