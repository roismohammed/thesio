import { api } from "@/lib/api"
import type { Task, TaskSuggestion } from "@/features/thesis/types"

interface TaskData {
  data: Task
}

interface TaskListData {
  data: Task[]
}

interface SuggestionListData {
  data: TaskSuggestion[]
}

export function listTasks(thesisId: number): Promise<TaskListData> {
  return api<TaskListData>(`/api/thesis/${thesisId}/tasks`)
}

export function createTask(
  thesisId: number,
  body: {
    title: string
    description?: string | null
    priority?: number
    chapter_id?: number | null
    supervision_note_id?: number | null
  },
): Promise<TaskData> {
  return api<TaskData>(`/api/thesis/${thesisId}/tasks`, { method: "POST", body })
}

export function updateTask(
  thesisId: number,
  taskId: number,
  body: {
    title?: string
    description?: string | null
    priority?: number
    due_at?: string | null
    chapter_id?: number | null
    supervision_note_id?: number | null
    status?: "todo" | "doing" | "done"
  },
): Promise<TaskData> {
  return api<TaskData>(`/api/thesis/${thesisId}/tasks/${taskId}`, { method: "PATCH", body })
}

export function moveTask(
  thesisId: number,
  taskId: number,
  body: { status: "todo" | "doing" | "done"; position: number },
): Promise<TaskData> {
  return api<TaskData>(`/api/thesis/${thesisId}/tasks/${taskId}/move`, { method: "PATCH", body })
}

export function deleteTask(thesisId: number, taskId: number): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/tasks/${taskId}`, { method: "DELETE" })
}

export function generateSuggestions(thesisId: number, force = false): Promise<SuggestionListData> {
  return api<SuggestionListData>(`/api/thesis/${thesisId}/task-suggestions`, {
    method: "POST",
    body: { force },
  })
}

export function listSuggestions(thesisId: number): Promise<SuggestionListData> {
  return api<SuggestionListData>(`/api/thesis/${thesisId}/task-suggestions`)
}

export function acceptSuggestion(thesisId: number, suggestionId: number): Promise<TaskData> {
  return api<TaskData>(`/api/thesis/${thesisId}/task-suggestions/${suggestionId}/accept`, { method: "POST" })
}

export function rejectSuggestion(thesisId: number, suggestionId: number): Promise<void> {
  return api<void>(`/api/thesis/${thesisId}/task-suggestions/${suggestionId}/reject`, { method: "POST" })
}