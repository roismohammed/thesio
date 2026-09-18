import { useCallback, useEffect, useState } from "react"

import type { Chapter, Thesis } from "@/features/thesis/types"
import { listChapters, listTheses, showChapter, showThesis } from "@/features/thesis/api/thesis"
import { getCachedApi } from "@/lib/api"

/**
 * Fetches the student's theses (and, on demand, a single thesis + its
 * chapters). React Compiler handles memoization.
 */
export function useThesis() {
  const [theses, setTheses] = useState<Thesis[]>(() => {
    return getCachedApi<{ data: Thesis[] }>("/api/thesis")?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Thesis[] }>("/api/thesis")
  })
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const payload = await listTheses()
      setTheses(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { theses, loading, error, refresh }
}

/** Fetches one thesis with its chapters. */
export function useThesisDetail(thesisId: number) {
  const [thesis, setThesis] = useState<Thesis | null>(() => {
    return getCachedApi<{ data: Thesis }>(`/api/thesis/${thesisId}`)?.data ?? null
  })
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    return getCachedApi<{ data: Chapter[] }>(`/api/thesis/${thesisId}/chapters`)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Thesis }>(`/api/thesis/${thesisId}`)
  })
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!thesisId) return
    setError(null)
    try {
      const [thesisPayload, chapterPayload] = await Promise.all([
        showThesis(thesisId),
        listChapters(thesisId),
      ])
      setThesis(thesisPayload.data)
      setChapters(chapterPayload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }, [thesisId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { thesis, chapters, loading, error, refresh }
}

/** Fetches a single chapter with full details (current version, markdown, references, note). */
export function useChapterDetail(thesisId: number, chapterId: number) {
  const [chapter, setChapter] = useState<Chapter | null>(() => {
    return getCachedApi<{ data: Chapter }>(`/api/thesis/${thesisId}/chapters/${chapterId}`)?.data ?? null
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Chapter }>(`/api/thesis/${thesisId}/chapters/${chapterId}`)
  })
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!thesisId || !chapterId) return
    setError(null)
    try {
      const payload = await showChapter(thesisId, chapterId)
      setChapter(payload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }, [thesisId, chapterId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { chapter, loading, error, refresh }
}
