import { useTranslation } from "react-i18next"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"

import type { Task, TaskStatus } from "@/features/thesis/types"
import { TaskCard } from "./task-card"
import type { TaskCardProps } from "./task-card"
import { cn } from "@/lib/utils"

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onMove: (taskId: number, status: TaskStatus) => void
}

/** A single board column: header + count + droppable task list. */
export function KanbanColumn({ status, tasks, onEdit, onDelete, onMove }: KanbanColumnProps) {
  const { t } = useTranslation("thesis")
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}` })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-2 rounded-xl border bg-muted/30 p-2",
        isOver && "ring-2 ring-primary/40",
      )}
    >
      <header className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{t(`kanban.column${capitalize(status)}`)}</h3>
        <span className="text-muted-foreground text-xs tabular-nums">{tasks.length}</span>
      </header>

      <SortableContext items={tasks.map((task) => `task-${task.id}`)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function SortableTaskCard({ task, ...actions }: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: `task-${task.id}`,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-40")}
    >
      <TaskCard task={task} {...actions} />
    </div>
  )
}