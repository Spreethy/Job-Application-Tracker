import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge'

const STATUS_OPTIONS = ['all', 'applied', 'interview', 'offer', 'rejected', 'withdrawn']

const SORT_OPTIONS = [
  { value: 'appliedDate', label: 'Applied date' },
  { value: 'company', label: 'Company' },
  { value: 'role', label: 'Role' },
  { value: 'status', label: 'Status' },
  { value: 'fitScore', label: 'Fit score' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function buildQuery({ status, search, sort, order }) {
  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  if (search) params.set('q', search)
  if (sort) {
    params.set('sort', sort)
    params.set('order', order === 'desc' ? 'desc' : 'asc')
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export default function Applications() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    search: '',
    sort: 'appliedDate',
    order: 'desc',
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getApplications(buildQuery(filters))
      .then((res) => {
        if (!cancelled) {
          setApplications(res.data)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [filters])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (key === 'status') {
      const params = new URLSearchParams(searchParams)
      if (!value || value === 'all') params.delete('status')
      else params.set('status', value)
      setSearchParams(params)
    }
  }

  const toggleOrder = () => {
    setFilters((prev) => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <Link
          to="/applications/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add application
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search company or role..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All statuses' : s}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={toggleOrder}
          className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500">
          <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
          <p className="mt-2 text-sm">Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-600 font-medium">No applications found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting the filters, or add your first application.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Fit</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Next action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        to={`/applications/${app.id}`}
                        className="hover:text-indigo-600"
                      >
                        {app.company}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{app.role}</td>
                    <td className="px-4 py-3 text-gray-500">{app.location || '—'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3">
                      {app.fitScore !== null ? (
                        <span
                          className={`font-semibold ${
                            app.fitScore >= 70
                              ? 'text-green-600'
                              : app.fitScore >= 40
                                ? 'text-amber-600'
                                : 'text-gray-400'
                          }`}
                        >
                          {app.fitScore}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(app.appliedDate)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(app.nextActionDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.company}</p>
                    <p className="text-sm text-gray-600 truncate">{app.role}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-gray-400 uppercase tracking-wide">Fit</dt>
                    <dd className="mt-0.5 font-semibold">
                      {app.fitScore !== null ? (
                        <span
                          className={
                            app.fitScore >= 70
                              ? 'text-green-600'
                              : app.fitScore >= 40
                                ? 'text-amber-600'
                                : 'text-gray-400'
                          }
                        >
                          {app.fitScore}%
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 uppercase tracking-wide">Applied</dt>
                    <dd className="mt-0.5 text-gray-600">{formatDate(app.appliedDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400 uppercase tracking-wide">Next action</dt>
                    <dd className="mt-0.5 text-gray-600">{formatDate(app.nextActionDate)}</dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}