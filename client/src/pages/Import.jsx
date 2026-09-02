import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api/client'
import { ResumeUpload } from '../components/ResumeUpload'
import { useToast } from '../components/toast-context'

export default function ImportPage() {
  const navigate = useNavigate()
  const showToast = useToast()
  const [url, setUrl] = useState('')
  const [importing, setImporting] = useState(false)

  const handleUrlImport = async (e) => {
    e.preventDefault()
    if (!url.trim()) return
    
    setImporting(true)
    try {
      await api.importFromUrl(url)
      showToast('Job URL import is not yet fully implemented', 'info')
      navigate('/applications/new')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/applications" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to applications
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Import Application</h1>
        <p className="text-gray-500 mt-1">Create a new application from your resume or a job posting URL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">From Resume</h2>
          <p className="text-gray-500 text-sm mb-4">
            Upload your resume (PDF or DOCX) to auto-fill application details.
          </p>
          <ResumeUpload
            onParseComplete={(data) => {
              if (data.parsed) {
                navigate('/applications/new', { state: { resumeData: data } })
              }
            }}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">From Job URL</h2>
          <p className="text-gray-500 text-sm mb-4">
            Paste a job posting URL (LinkedIn, Indeed, company site) to import details.
          </p>
          <form onSubmit={handleUrlImport} className="space-y-4">
            <div>
              <label htmlFor="job-url" className="block text-sm font-medium text-gray-700 mb-1">
                Job Posting URL
              </label>
              <input
                id="job-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linkedin.com/jobs/view/..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={importing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {importing ? 'Importing...' : 'Import from URL'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}