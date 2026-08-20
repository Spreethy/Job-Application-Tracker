const STYLES = {
  applied: 'bg-blue-50 text-blue-700',
  interview: 'bg-purple-50 text-purple-700',
  offer: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  withdrawn: 'bg-gray-100 text-gray-600',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STYLES[status] || STYLES.applied}`}
    >
      {status}
    </span>
  )
}