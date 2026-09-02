import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useToast } from '../components/toast-context'

const STATUSES = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']

const STATUS_LABELS = {
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export default function KanbanBoard() {
  const showToast = useToast()
  const [columns, setColumns] = useState({})
  const [loading, setLoading] = useState(true)
  const [draggedApp, setDraggedApp] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const res = await api.getApplications()
      const apps = res.data || []
      const grouped = {}
      STATUSES.forEach(s => grouped[s] = [])
      apps.forEach(app => {
        if (grouped[app.status]) {
          grouped[app.status].push(app)
        }
      })
      setColumns(grouped)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e, app) => {
    setDraggedApp(app)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    
    if (!draggedApp || draggedApp.status === newStatus) {
      setDraggedApp(null)
      return
    }

    const previousStatus = draggedApp.status
    const previousColumns = { ...columns }
    
    // Optimistic update
    setColumns(prev => {
      const next = { ...prev }
      next[previousStatus] = next[previousStatus].filter(a => a.id !== draggedApp.id)
      next[newStatus] = [...next[newStatus], { ...draggedApp, status: newStatus }]
      return next
    })
    setDraggedApp(null)

    try {
      await api.updateApplication(draggedApp.id, { 
        status: newStatus,
        note: `Moved from ${STATUS_LABELS[previousStatus]} to ${STATUS_LABELS[newStatus]}`
      })
      showToast(`Moved to ${STATUS_LABELS[newStatus]}`, 'success')
    } catch (err) {
      // Rollback on error
      setColumns(previousColumns)
      showToast(err.message, 'error')
    }
  }

  const getFitScoreColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)] min-h-[600px]">
      {STATUSES.map((status) => (
        <div
          key={status}
          className={`flex-shrink-0 w-80 flex flex-col ${
            dragOverColumn === status ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
              {STATUS_LABELS[status]}
            </h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
              {columns[status]?.length || 0}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {columns[status]?.map((app) => (
              <div
                key={app.id}
                draggable
                onDragStart={(e) => handleDragStart(e, app)}
                className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
                  draggedApp?.id === app.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{app.company}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{app.role}</p>
                    {app.location && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {app.location}
                      </p>
                    )}
                  </div>
                  {app.fitScore !== null && app.fitScore !== undefined && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${getFitScoreColor(app.fitScore)}`}>
                      {app.fitScore}%
                    </span>
                  )}
                </div>
                {app.nextActionDate && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(app.nextActionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
            {(!columns[status] || columns[status].length === 0) && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                <p className="text-sm">No applications</p>
                <p className="text-xs mt-1">Drag cards here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}