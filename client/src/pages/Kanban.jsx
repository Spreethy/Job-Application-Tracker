import KanbanBoard from '../components/KanbanBoard'

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Drag and drop applications to update their status
        </p>
      </div>
      <KanbanBoard />
    </div>
  )
}