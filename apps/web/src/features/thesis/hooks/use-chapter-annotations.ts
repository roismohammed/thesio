import { useCallback, useEffect, useState } from "react"

import type { ChapterAnnotation } from "@/features/thesis/types"
import {
  createAnnotation,
  deleteAnnotation,
  listAnnotations,
  updateAnnotation,
} from "@/features/thesis/api/thesis"
import { getCachedApi } from "@/lib/api"

export function useChapterAnnotations(thesisId: number, chapterId: number) {
  const cacheKey = `/api/thesis/${thesisId}/chapters/${chapterId}/annotations`
  const [annotations, setAnnotations] = useState<ChapterAnnotation[]>(() => {
    return getCachedApi<{ data: ChapterAnnotation[] }>(cacheKey)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: ChapterAnnotation[] }>(cacheKey)
  })
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!thesisId || !chapterId) return
    setError(null)
    try {
      const payload = await listAnnotations(thesisId, chapterId)
      setAnnotations(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat catatan anotasi.")
    } finally {
      setLoading(false)
    }
  }, [thesisId, chapterId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const add = async (data: {
    selected_text: string
    color: "yellow" | "green" | "blue" | "pink" | "orange"
    comment?: string | null
    author_name?: string | null
    author_role?: "student" | "lecturer" | "general"
    version_id?: number | null
  }) => {
    const res = await createAnnotation(thesisId, chapterId, data)
    setAnnotations((prev) => [res.data, ...prev])
    return res.data
  }

  const update = async (
    annotationId: number,
    data: {
      color?: "yellow" | "green" | "blue" | "pink" | "orange"
      comment?: string | null
      is_resolved?: boolean
    },
  ) => {
    const res = await updateAnnotation(thesisId, chapterId, annotationId, data)
    setAnnotations((prev) => prev.map((a) => (a.id === annotationId ? res.data : a)))
    return res.data
  }

  const remove = async (annotationId: number) => {
    await deleteAnnotation(thesisId, chapterId, annotationId)
    setAnnotations((prev) => prev.filter((a) => a.id !== annotationId))
  }

  return {
    annotations,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
  }
}
