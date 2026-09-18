import { useCallback, useEffect, useState } from "react"

import {
  acceptSuggestion,
  generateSuggestions,
  listSuggestions,
  rejectSuggestion,
} from "@/features/thesis/api/kanban-tasks"
import type { Task, TaskSuggestion } from "@/features/thesis/types"
import { getCachedApi } from "@/lib/api"

/**
 * Suggestion board state: load pending suggestions, generate (with loading
 * state), accept / reject. Accept returns the created task so the board can
 * refresh.
 */
export function useTaskSuggestions(thesisId: number) {
  const cacheKey = `/api/thesis/${thesisId}/task-suggestions`
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>(() => {
    return getCachedApi<{ data: TaskSuggestion[] }>(cacheKey)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: TaskSuggestion[] }>(cacheKey)
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const payload = await listSuggestions(thesisId)
      setSuggestions(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }, [thesisId])

  useEffect(() => {
    void load()
  }, [load])

  async function generate(force = false): Promise<boolean> {
    setGenerating(true)
    setError(null)
    try {
      const payload = await generateSuggestions(thesisId, force)
      setSuggestions(payload.data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat saran. Silakan coba lagi.")
      return false
    } finally {
      setGenerating(false)
    }
  }

  async function accept(suggestionId: number): Promise<Task | null> {
    try {
      const payload = await acceptSuggestion(thesisId, suggestionId)
      await load()
      return payload.data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menerima saran.")
      return null
    }
  }

  async function reject(suggestionId: number): Promise<boolean> {
    try {
      await rejectSuggestion(thesisId, suggestionId)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menolak saran.")
      return false
    }
  }

  return {
    suggestions,
    loading,
    generating,
    error,
    generate,
    accept,
    reject,
  }
}