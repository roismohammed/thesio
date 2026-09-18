import { useCallback, useEffect, useState } from "react"

import {
  addGuidePoint,
  generateGuide,
  getCurrentGuide,
  listGuideHistory,
  removeGuidePoint,
  showGuide,
  updateGuidePoint,
} from "@/features/thesis/api/supervision-guide"
import type { GuidancePoint, SupervisionGuide, SupervisionGuideListItem } from "@/features/thesis/types"
import { getCachedApi } from "@/lib/api"

/**
 * Loads the current supervision guide for a thesis, plus on-demand
 * generation and point tailoring handlers. US3 history is included so the
 * page can switch between current and past guides without extra state.
 */
export function useSupervisionGuide(thesisId: number) {
  const [guide, setGuide] = useState<SupervisionGuide | null>(() => {
    return getCachedApi<{ data: SupervisionGuide }>(`/api/thesis/${thesisId}/supervision-guides/current`)?.data ?? null
  })
  const [history, setHistory] = useState<SupervisionGuideListItem[]>(() => {
    return getCachedApi<{ data: SupervisionGuideListItem[] }>(`/api/thesis/${thesisId}/supervision-guides`)?.data ?? []
  })
  const [pastGuide, setPastGuide] = useState<SupervisionGuide | null>(null)
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: SupervisionGuide }>(`/api/thesis/${thesisId}/supervision-guides/current`)
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [current, historyPayload] = await Promise.all([
        getCurrentGuide(thesisId),
        listGuideHistory(thesisId),
      ])
      setGuide(current.data)
      setHistory(historyPayload.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }, [thesisId])

  useEffect(() => {
    void load()
  }, [load])

  async function generate(): Promise<boolean> {
    setGenerating(true)
    setError(null)
    try {
      const payload = await generateGuide(thesisId)
      setGuide(payload.data)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat agenda bimbingan. Silakan coba lagi.")
      return false
    } finally {
      setGenerating(false)
    }
  }

  async function selectPast(guideId: number): Promise<void> {
    const payload = await showGuide(thesisId, guideId)
    setPastGuide(payload.data)
  }

  function clearPast(): void {
    setPastGuide(null)
  }

  async function addPoint(body: {
    title: string
    description?: string
    chapter_id?: number | null
  }): Promise<boolean> {
    if (!guide) {
      return false
    }
    try {
      await addGuidePoint(thesisId, guide.id, body)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan poin.")
      return false
    }
  }

  async function togglePrepared(point: GuidancePoint): Promise<boolean> {
    if (!guide) {
      return false
    }
    try {
      await updateGuidePoint(thesisId, guide.id, point.id, {
        status: point.status === "prepared" ? "pending" : "prepared",
      })
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui poin.")
      return false
    }
  }

  async function removePoint(pointId: number): Promise<boolean> {
    if (!guide) {
      return false
    }
    try {
      await removeGuidePoint(thesisId, guide.id, pointId)
      await load()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus poin.")
      return false
    }
  }

  return {
    guide,
    history,
    pastGuide,
    loading,
    generating,
    error,
    generate,
    selectPast,
    clearPast,
    addPoint,
    togglePrepared,
    removePoint,
  }
}