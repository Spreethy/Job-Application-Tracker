import { useEffect, useState } from 'react'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

const CARD_STYLES = {
  applied: 'border-blue-200 bg-blue-50',
  interview: 'border-purple-200 bg-purple-50',
  offer: 'border-green-200 bg-green-50',
  rejected: 'border-red-200 bg-red-50',
  withdrawn: 'border-gray-200 bg-gray-50',
}

const CARD_DOT = {
  applied: 'bg-blue-500',
  interview: 'bg-purple-500',
  offer: 'bg-green-500',
  rejected: 'bg-red-500',
  withdrawn: 'bg-gray-400',
}

const STATUS_LABELS = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [applications, setApplications] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getStats(), api.getApplications('?sort=fitScore&order=desc')])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes)
        setApplications(appsRes.data)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="text-center py-16 text-red-600 font-medium">
        Failed to load dashboard: {error}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-16 text-gray-500">Loading dashboard...</div>
  }

  const { statusCounts, total, upcoming, aiProvider } = stats
  const maxCount = Math.max(...Object.values(statusCounts), 1)

  const fitRanked = applications
    .filter((a) => a.fitScore !== null)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1">
          AI provider: <span className="font-semibold text-indigo-600">{aiProvider}</span>
        </span>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`border rounded-xl p-4 ${CARD_STYLES[status]}`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${CARD_DOT[status]}`} />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {STATUS_LABELS[status]}
              </span>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pipeline breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 capitalize shrink-0">
                  {STATUS_LABELS[status]}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${CARD_DOT[status]}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-sm font-semibold text-gray-700 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            {total} total applications tracked
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming actions
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-500">Nothing scheduled. Nice.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((app) => (
                <li key={app.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {app.role}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{app.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-indigo-600">
                      {formatDate(app.nextActionDate)}
                    </p>
                    <StatusBadge status={app.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Top matches</h2>
          <span className="text-xs text-gray-500">Ranked by AI fit score</span>
        </div>
        {fitRanked.length === 0 ? (
          <p className="text-sm text-gray-500">
            No fit scores yet. Add a job description and run AI analysis on an
            application to see matches.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {fitRanked.map((app) => (
              <div
                key={app.id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {app.fitScore}
                    <span className="text-sm font-medium text-gray-400">%</span>
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {app.role}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{app.company}</p>
                </div>
                {app.missingSkills.length > 0 && (
                  <p className="text-xs text-amber-700 line-clamp-2">
                    Missing: {app.missingSkills.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}