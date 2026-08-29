import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/toast-context'

function formatDate(value, withTime = false) {
  if (!value) return '—'
  const opts = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }
  return new Date(value).toLocaleDateString(undefined, opts)
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400 font-medium">{label}</dt>
      <dd className="text-sm text-gray-800 mt-0.5 break-words">{value}</dd>
    </div>
  )
}

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [prepping, setPrepping] = useState(false)

  const load = () => {
    api
      .getApplication(id)
      .then((res) => {
        setApplication(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(load, [id])

  const runAnalyze = async () => {
    setAnalyzing(true)
    try {
      await api.analyzeApplication(id)
      load()
      showToast('Fit analysis updated', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setAnalyzing(false)
    }
  }

  const runPrep = async () => {
    setPrepping(true)
    try {
      await api.generateInterviewPrep(id)
      load()
      showToast('Interview questions generated', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setPrepping(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete application for ${application.company}? This cannot be undone.`)) {
      return
    }
    try {
      await api.deleteApplication(id)
      navigate('/applications')
    } catch (err) {
      showToast(err.message, 'error')
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
        <p className="text-gray-600 font-medium">Application not found</p>
        <Link to="/applications" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to applications
        </Link>
      </div>
    )
  }

  const history = [...(application.history || [])].sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/applications" className="text-sm text-indigo-600 hover:text-indigo-700">
            ← Applications
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{application.role}</h1>
          <p className="text-gray-600">
            {application.company}
            {application.location && ` · ${application.location}`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={application.status} />
          <Link
            to={`/applications/${id}/edit`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow label="Applied" value={formatDate(application.appliedDate)} />
              <DetailRow label="Next action" value={formatDate(application.nextActionDate)} />
              <DetailRow label="Salary" value={application.salaryRange} />
              <DetailRow label="Posting" value={application.jobUrl && <a className="text-indigo-600 hover:underline" href={application.jobUrl} target="_blank" rel="noreferrer">{application.jobUrl}</a>} />
              <DetailRow label="Notes" value={application.notes} />
            </dl>
          </div>

          {application.jobDescription && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Job description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {application.jobDescription}
              </p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <ol className="relative border-l border-gray-200 ml-2 space-y-6">
              {history.map((entry, i) => (
                <li key={i} className="ml-6">
                  <span className="absolute -left-[7px] mt-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={entry.status} />
                    <span className="text-xs text-gray-400">
                      {formatDate(entry.changedAt, true)}
                    </span>
                  </div>
                  {entry.note && <p className="text-sm text-gray-600 mt-1">{entry.note}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">AI Fit Analysis</h2>

            {!application.jobDescription ? (
              <div>
                <p className="text-sm text-gray-500">
                  Add a job description to this application to run AI fit analysis.
                </p>
                <Link
                  to={`/applications/${id}/edit`}
                  className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Edit to add job description →
                </Link>
              </div>
            ) : (
              <div>
                {application.fitScore !== null ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-gray-900">
                        {application.fitScore}
                        <span className="text-lg font-medium text-gray-400">%</span>
                      </span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            application.fitScore >= 70
                              ? 'bg-green-500'
                              : application.fitScore >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-400'
                          }`}
                          style={{ width: `${application.fitScore}%` }}
                        />
                      </div>
                    </div>

                    {application.fitAnalysis && (
                      <p className="text-sm text-gray-600">{application.fitAnalysis}</p>
                    )}

                    {application.missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">
                          Skills to highlight / learn
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {application.missingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">
                    Run AI analysis to score this application against your profile.
                  </p>
                )}

                <button
                  onClick={runAnalyze}
                  disabled={analyzing}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  {analyzing ? 'Analyzing...' : application.fitScore !== null ? 'Re-run analysis' : 'Run AI analysis'}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Interview Prep</h2>
            {!application.jobDescription ? (
              <p className="text-sm text-gray-500">
                Add a job description first, then generate interview questions.
              </p>
            ) : (
              <div>
                {application.interviewPrep?.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {application.interviewPrep.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-indigo-500 font-medium shrink-0">{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={runPrep}
                  disabled={prepping}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                  {prepping ? 'Generating...' : 'Generate interview questions'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}