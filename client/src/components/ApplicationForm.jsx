const STATUS_OPTIONS = ['applied', 'interview', 'offer', 'rejected', 'withdrawn']

const FIELDS = [
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'appliedDate', label: 'Applied date', type: 'date', required: true },
  { name: 'nextActionDate', label: 'Next action date', type: 'date' },
  { name: 'salaryRange', label: 'Salary range', type: 'text', placeholder: 'e.g. $110k - $140k' },
  { name: 'jobUrl', label: 'Job posting URL', type: 'url' },
]

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500'

function toDateInput(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default function ApplicationForm({
  initial = {},
  showStatus = false,
  onSubmit,
  submitLabel,
  onCancel,
  submitting = false,
  error = '',
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const payload = {}

    FIELDS.forEach((f) => {
      payload[f.name] = formData.get(f.name)
    })

    if (showStatus) {
      payload.status = formData.get('status')
      payload.note = formData.get('note')
    }

    payload.jobDescription = formData.get('jobDescription')

    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null) payload[k] = undefined
    })

    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.name} className={field.type === 'url' ? 'sm:col-span-2' : ''}>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              defaultValue={
                field.type === 'date' ? toDateInput(initial[field.name]) : initial[field.name] || ''
              }
              className={inputClass}
            />
          </div>
        ))}

        {showStatus && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initial.status || 'applied'}
              className={inputClass + ' capitalize'}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {showStatus && (
          <div className="sm:col-span-2">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Note for this status change
            </label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder="e.g. 2nd round with hiring manager"
              className={inputClass}
            />
          </div>
        )}

        <div className="sm:col-span-2">
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Job description <span className="text-gray-400 font-normal">(enables AI fit analysis)</span>
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows="5"
            placeholder="Paste the job posting text here..."
            defaultValue={initial.jobDescription || ''}
            className={inputClass + ' resize-y'}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}