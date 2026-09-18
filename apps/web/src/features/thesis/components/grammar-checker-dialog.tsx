import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiInnovation01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import {
  checkGrammar,
  saveChapterContent,
  type GrammarSuggestion,
} from "@/features/thesis/api/thesis"
import { ApiError } from "@/lib/api"

interface GrammarCheckerDialogProps {
  thesisId: number
  chapterId: number
  currentMarkdown: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onApplied: () => Promise<void>
}

export function GrammarCheckerDialog({
  thesisId,
  chapterId,
  currentMarkdown,
  open,
  onOpenChange,
  onApplied,
}: GrammarCheckerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [summary, setSummary] = useState<string>("")
  const [suggestions, setSuggestions] = useState<GrammarSuggestion[]>([])
  const [appliedIndices, setAppliedIndices] = useState<number[]>([])

  async function handleAnalyze() {
    if (!currentMarkdown.trim()) {
      toast.add({ title: "Belum ada teks pada bab ini untuk dianalisis.", type: "error" })
      return
    }

    setLoading(true)
    try {
      const res = await checkGrammar(thesisId, chapterId, currentMarkdown)
      setOverallScore(res.data.overall_score)
      setSummary(res.data.summary)
      setSuggestions(res.data.suggestions)
      setAppliedIndices([])
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menganalisis tata bahasa.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleApply(suggestion: GrammarSuggestion, index: number) {
    if (!currentMarkdown.includes(suggestion.original)) {
      toast.add({ title: "Potongan teks asli tidak ditemukan di dokumen.", type: "error" })
      return
    }

    const updatedMarkdown = currentMarkdown.replace(suggestion.original, suggestion.suggestion)
    try {
      await saveChapterContent(thesisId, chapterId, updatedMarkdown)
      setAppliedIndices((prev) => [...prev, index])
      toast.add({ title: "Saran berhasil diterapkan ke konten bab.", type: "success" })
      await onApplied()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menerapkan perbaikan.",
        type: "error",
      })
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "spelling":
        return <Badge variant="destructive">Ejaan / Typo</Badge>
      case "grammar":
        return <Badge variant="secondary">Tata Bahasa</Badge>
      case "academic_tone":
        return <Badge variant="default">Gaya Akademik</Badge>
      default:
        return <Badge variant="outline">Kalimat Efektif</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-5 text-primary" />
            <DialogTitle>Pemeriksa Tata Bahasa & Academic Tone</DialogTitle>
          </div>
          <DialogDescription>
            Evaluasi kepatuhan PUEBI/KBBI, ejaan baku, keefektifan kalimat, dan gaya bahasa skripsi.
          </DialogDescription>
        </DialogHeader>

        {overallScore === null && !loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <HugeiconsIcon icon={AiInnovation01Icon} strokeWidth={2} className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground max-w-md">
              AI akan membaca konten bab aktif untuk memeriksa kesalahan ejaan, struktur kalimat, dan kepatuhan standar penulisan ilmiah.
            </p>
            <Button onClick={() => void handleAnalyze()} className="mt-2">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="mr-1.5 size-4" />
              Mulai Analisis AI
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Sedang memeriksa tata bahasa dan struktur kalimat…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Score & Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ringkasan Evaluasi</span>
                  <p className="text-sm text-foreground">{summary}</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-xl bg-background border px-4 py-2 shrink-0">
                  <span className="text-2xl font-black text-primary">{overallScore}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Skor Akademik</span>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions list */}
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Temuan & Rekomendasi ({suggestions.length})
              </h4>
              <Button variant="ghost" size="sm" onClick={() => void handleAnalyze()}>
                Analisis Ulang
              </Button>
            </div>

            {suggestions.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                Luar biasa! Tidak ditemukan kesalahan tata bahasa atau ejaan yang signifikan.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {suggestions.map((item, idx) => {
                  const isApplied = appliedIndices.includes(idx)
                  return (
                    <Card key={idx} className="border-border">
                      <CardContent className="flex flex-col gap-2.5 p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          {getTypeBadge(item.type)}
                          {isApplied ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                              Diterapkan
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void handleApply(item, idx)}
                            >
                              Terapkan Saran
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="rounded bg-destructive/10 p-2 text-destructive border border-destructive/20">
                            <span className="font-semibold block mb-0.5">Teks Asli:</span>
                            "{item.original}"
                          </div>
                          <div className="rounded bg-primary/10 p-2 text-primary border border-primary/20">
                            <span className="font-semibold block mb-0.5">Saran Perbaikan:</span>
                            "{item.suggestion}"
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5">
                          <strong className="text-foreground">Alasan:</strong> {item.reason}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
