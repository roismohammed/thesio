import { useCallback, useEffect, useState } from "react"

import {
  createTask,
  deleteTask,
  listTasks,
  moveTask,
  updateTask,
} from "@/features/thesis/api/kanban-tasks"
import type { Task, TaskStatus } from "@/features/thesis/types"
import { getCachedApi } from "@/lib/api"

/**
 * Board state + mutation handlers for the kanban tasks page. Tasks are kept
 * grouped by status column; the loaded list is sorted by status, position.
 */
export function useKanbanTasks(thesisId: number) {
  const [tasks, setTasks] = useState<Task[]>(() => {
    return getCachedApi<{ data: Task[] }>(`/api/thesis/${thesisId}/tasks`)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Task[] }>(`/api/thesis/${thesisId}/tasks`)
  })
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const payload = await listTasks(thesisId)
      setTasks(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }, [thesisId])

  useEffect(() => {
    void load()
  }, [load])

  async function addTask(body: {
    title: string
    description?: string | null
    priority?: number
    chapter_id?: number | null
    supervision_note_id?: number | null
  }): Promise<boolean> {
    try {
      await createTask(thesisId, body)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat tugas.")
      return false
    }
  }

  async function editTask(
    taskId: number,
    body: {
      title?: string
      description?: string | null
      priority?: number
      due_at?: string | null
      chapter_id?: number | null
      supervision_note_id?: number | null
      status?: TaskStatus
    },
  ): Promise<boolean> {
    try {
      await updateTask(thesisId, taskId, body)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui tugas.")
      return false
    }
  }

  async function removeTask(taskId: number): Promise<boolean> {
    try {
      await deleteTask(thesisId, taskId)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus tugas.")
      return false
    }
  }

  async function move(taskId: number, status: TaskStatus, position: number): Promise<boolean> {
    try {
      await moveTask(thesisId, taskId, { status, position })
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memindahkan tugas.")
      return false
    }
  }

  return {
    tasks,
    loading,
    error,
    load,
    addTask,
    updateTask: editTask,
    removeTask,
    move,
  }
}