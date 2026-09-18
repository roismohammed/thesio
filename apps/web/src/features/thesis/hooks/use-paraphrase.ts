import { useState } from "react"

import {
  applyParaphrase,
  listParaphrases,
  requestParaphrase,
  type ParaphraseHistoryItem,
  type ParaphraseRequestPayload,
} from "@/features/thesis/api/thesis"

interface ParaphraseState {
  preview: string | null
  paraphraseId: number | null
  originalSelection: string | null
  styleMode: string
  loading: boolean
  historyLoading: boolean
  history: ParaphraseHistoryItem[]
  error: string | null
}

/**
 * Drives the LLM paraphrase flow for a chapter: request preview, load history,
 * then apply (accept) or discard. Failures surface as a friendly error and never
 * mutate the chapter text.
 */
export function useParaphrase(thesisId: number, chapterId: number) {
  const [state, setState] = useState<ParaphraseState>({
    preview: null,
    paraphraseId: null,
    originalSelection: null,
    styleMode: "academic",
    loading: false,
    historyLoading: false,
    history: [],
    error: null,
  })

  async function requestPreview(payload: string | ParaphraseRequestPayload): Promise<boolean> {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await requestParaphrase(thesisId, chapterId, payload)
      const original = typeof payload === "string" ? payload : payload.selection
      const mode = typeof payload === "string" ? "academic" : payload.style_mode ?? "academic"

      setState((s) => ({
        ...s,
        preview: res.data.paraphrased_text,
        paraphraseId: res.data.paraphrase_id,
        originalSelection: original,
        styleMode: res.data.style_mode || mode,
        loading: false,
        error: null,
      }))
      return true
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Parafrase gagal diproses. Silakan coba lagi.",
      }))
      return false
    }
  }

  async function fetchHistory(): Promise<void> {
    setState((s) => ({ ...s, historyLoading: true }))
    try {
      const res = await listParaphrases(thesisId, chapterId)
      setState((s) => ({
        ...s,
        history: res.data,
        historyLoading: false,
      }))
    } catch {
      setState((s) => ({ ...s, historyLoading: false }))
    }
  }

  async function apply(): Promise<boolean> {
    if (state.paraphraseId === null) {
      return false
    }
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      await applyParaphrase(thesisId, chapterId, state.paraphraseId)
      setState((s) => ({
        ...s,
        preview: null,
        paraphraseId: null,
        originalSelection: null,
        loading: false,
        error: null,
      }))
      return true
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Gagal menerapkan parafrase.",
      }))
      return false
    }
  }

  function discard() {
    setState((s) => ({
      ...s,
      preview: null,
      paraphraseId: null,
      originalSelection: null,
      loading: false,
      error: null,
    }))
  }

  function setPreview(text: string, id: number, orig: string) {
    setState((s) => ({
      ...s,
      preview: text,
      paraphraseId: id,
      originalSelection: orig,
    }))
  }

  return { ...state, requestPreview, fetchHistory, apply, discard, setPreview }
}