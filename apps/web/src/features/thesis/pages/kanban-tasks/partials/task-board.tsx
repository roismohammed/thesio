import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import type { Task, TaskStatus } from "@/features/thesis/types"
import { KanbanColumn } from "./kanban-column"
import { TaskCard } from "./task-card"

interface TaskBoardProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onMove: (taskId: number, status: TaskStatus) => void
  onDragEnd: (taskId: number, status: TaskStatus, position: number) => void
}

const STATUSES: TaskStatus[] = ["todo", "doing", "done"]

/**
 * The 3-column DnD board. Columns are droppable containers; cards are
 * sortable within each column; cross-column drops move the task. DragOverlay
 * renders the lifted card while dragging (accessible keyboard sensor on).
 */
export function TaskBoard({ tasks, onEdit, onDelete, onMove, onDragEnd }: TaskBoardProps) {
  const [overlayTask, setOverlayTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id)
    const task = tasks.find((t) => `task-${t.id}` === id)
    setOverlayTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setOverlayTask(null)
    const { active, over } = event
    if (!over) {
      return
    }

    const taskId = Number(String(active.id).replace("task-", ""))
    const overId = String(over.id)

    if (overId.startsWith("column-")) {
      const status = overId.replace("column-", "") as TaskStatus
      onDragEnd(taskId, status, 0)
      return
    }

    const overTaskId = Number(overId.replace("task-", ""))
    const overTask = tasks.find((t) => t.id === overTaskId)
    if (!overTask) {
      return
    }

    onDragEnd(taskId, overTask.status, overTask.position)
  }

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))}
      </div>
      <DragOverlay>
        {overlayTask ? (
          <TaskCard task={overlayTask} onEdit={onEdit} onDelete={onDelete} onMove={onMove} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}