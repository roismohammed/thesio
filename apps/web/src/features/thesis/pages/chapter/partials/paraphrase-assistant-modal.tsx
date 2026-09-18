import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiInnovation01Icon,
  BookOpen01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  File01Icon,
  InformationCircleIcon,
  Loading03Icon,
  Note01Icon,
  SparklesIcon,
  Time02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { showNote } from "@/features/thesis/api/thesis"
import { useParaphrase } from "@/features/thesis/hooks/use-paraphrase"
import type { Chapter, SupervisionNote } from "@/features/thesis/types"
import { ParaphraseDiffPreview } from "./paraphrase-diff-preview"

interface ParaphraseAssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thesisId: number
  chapter: Chapter
  initialSelection?: string
  onApplied: () => Promise<void>
}

export function ParaphraseAssistantModal({
  open,
  onOpenChange,
  thesisId,
  chapter,
  initialSelection = "",
  onApplied,
}: ParaphraseAssistantModalProps) {
  const paraphrase = useParaphrase(thesisId, chapter.id)
  const [activeTab, setActiveTab] = useState<"assistant" | "history">("assistant")

  const [selection, setSelection] = useState(initialSelection)
  const [supervisionNote, setSupervisionNote] = useState<SupervisionNote | null>(null)
  const [useSupervisionNote, setUseSupervisionNote] = useState(true)
  const [customInstruction, setCustomInstruction] = useState("")
  const [referenceContext, setReferenceContext] = useState("")
  const [styleMode, setStyleMode] = useState<"academic" | "concise" | "elaborative">("academic")

  useEffect(() => {
    if (open) {
      if (initialSelection) {
        setSelection(initialSelection)
      }
      void showNote(thesisId, chapter.id)
        .then((res) => {
          setSupervisionNote(res.data)
          if (res.data) setUseSupervisionNote(true)
        })
        .catch(() => setSupervisionNote(null))

      void paraphrase.fetchHistory()
    }
  }, [open, initialSelection, thesisId, chapter.id])

  const handleGenerate = async () => {
    if (!selection || selection.trim().length < 10) {
      toast.add({ title: "Teks draf bab minimal 10 karakter.", type: "error" })
      return
    }

    const ok = await paraphrase.requestPreview({
      selection: selection.trim(),
      supervision_note_id: useSupervisionNote && supervisionNote ? supervisionNote.id : null,
      custom_instruction: customInstruction.trim() || null,
      reference_context: referenceContext.trim() || null,
      style_mode: styleMode,
    })

    if (ok) {
      toast.add({ title: "Rekomendasi parafrase berhasil dibuat.", type: "success" })
    }
  }

  const handleApply = async () => {
    const ok = await paraphrase.apply()
    if (ok) {
      toast.add({ title: "Draf berhasil diterapkan ke bab dan versi baru tersimpan.", type: "success" })
      onOpenChange(false)
      await onApplied()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl h-[88vh] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b bg-muted/30 px-6 py-4 pr-14 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <HugeiconsIcon icon={AiInnovation01Icon} strokeWidth={2} className="size-5 text-primary" />
              Asisten Parafrase & Revisi Bab
            </DialogTitle>
            <div className="flex rounded-lg border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("assistant")}
                className={`rounded px-3 py-1 transition-colors flex items-center gap-1.5 ${
                  activeTab === "assistant" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
                Asisten Draf
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("history")
                  void paraphrase.fetchHistory()
                }}
                className={`rounded px-3 py-1 transition-colors flex items-center gap-1.5 ${
                  activeTab === "history" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <HugeiconsIcon icon={Time02Icon} strokeWidth={2} className="size-3.5" />
                Riwayat Sesi ({paraphrase.history.length})
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "history" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Riwayat rekomendasi perbaikan dan parafrase pada bab ini.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void paraphrase.fetchHistory()}
                  disabled={paraphrase.historyLoading}
                >
                  Segarkan
                </Button>
              </div>

              {paraphrase.history.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground border rounded-lg bg-muted/10">
                  Belum ada riwayat sesi parafrase pada bab ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {paraphrase.history.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-card p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                            item.outcome === "applied" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-muted text-muted-foreground"
                          }`}>
                            {item.outcome === "applied" ? "Diterapkan" : "Disimpan"}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            Mode: {item.style_mode}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <p className="font-semibold text-muted-foreground mb-1">Draf Asli:</p>
                          <p className="line-clamp-3 bg-muted/30 p-2 rounded italic">{item.original_selection}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-primary mb-1">Hasil Rekomendasi:</p>
                          <p className="line-clamp-3 bg-primary/5 p-2 rounded">{item.paraphrased_text ?? "Gagal diproses"}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            if (item.paraphrased_text) {
                              void navigator.clipboard.writeText(item.paraphrased_text)
                              toast.add({ title: "Hasil berhasil disalin ke clipboard.", type: "success" })
                            }
                          }}
                        >
                          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-3 mr-1" />
                          Salin Hasil
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setSelection(item.original_selection)
                            if (item.paraphrased_text) {
                              paraphrase.setPreview(item.paraphrased_text, item.id, item.original_selection)
                            }
                            setActiveTab("assistant")
                          }}
                        >
                          Buka di Asisten
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Hasil Preview / Perbandingan jika sudah di-generate */}
              {paraphrase.preview && (
                <ParaphraseDiffPreview
                  originalText={selection}
                  paraphrasedText={paraphrase.preview}
                  styleMode={styleMode}
                  onStyleChange={(mode) => {
                    setStyleMode(mode)
                  }}
                  onApply={handleApply}
                  onDiscard={paraphrase.discard}
                  loading={paraphrase.loading}
                />
              )}

              {/* Form Konfigurasi Input Asisten */}
              <div className="space-y-4">
                {/* Draf Teks Seleksi */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-3.5 text-primary" />
                      1. Teks Draf Bab Asli (Wajib):
                    </label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {selection.length} karakter
                    </span>
                  </div>
                  <Textarea
                    value={selection}
                    onChange={(e) => setSelection(e.target.value)}
                    placeholder="Pilih atau masukkan teks draf bab skripsi yang ingin diperbaiki/diparafrase..."
                    rows={4}
                    className="text-xs leading-relaxed"
                  />
                </div>

                {/* Catatan Bimbingan Terpaut */}
                <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <HugeiconsIcon icon={Note01Icon} strokeWidth={2} className="size-3.5 text-amber-600" />
                      2. Catatan Bimbingan / Notulen Dosen:
                    </label>
                    {supervisionNote && (
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useSupervisionNote}
                          onChange={(e) => setUseSupervisionNote(e.target.checked)}
                          className="rounded border-muted-foreground"
                        />
                        Gunakan Catatan Bab
                      </label>
                    )}
                  </div>

                  {supervisionNote ? (
                    useSupervisionNote ? (
                      <div className="text-xs bg-background p-2.5 rounded border border-amber-200 dark:border-amber-900 text-muted-foreground leading-relaxed max-h-24 overflow-y-auto">
                        {supervisionNote.content}
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">Catatan bimbingan bab dinonaktifkan untuk sesi ini.</p>
                    )
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic">Belum ada catatan bimbingan tersimpan pada bab ini. Anda dapat menuliskan instruksi manual di bawah.</p>
                  )}

                  <div className="pt-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Instruksi / Arahan Revisi Tambahan (Opsional):</label>
                    <Textarea
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder="Contoh: Perjelas rumusan masalah dan gunakan transisi kalimat yang lebih mengalir..."
                      rows={2}
                      className="text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Konteks Referensi Rujukan (US2) */}
                <div className="space-y-1.5 rounded-lg border bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold flex items-center gap-1.5">
                      <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} className="size-3.5 text-sky-600" />
                      3. Konteks Referensi Rujukan / Jurnal Pendukung (Opsional):
                    </label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {referenceContext.length}/3000
                    </span>
                  </div>
                  <Textarea
                    value={referenceContext}
                    onChange={(e) => setReferenceContext(e.target.value)}
                    placeholder="Tempelkan kutipan teori, data jurnal, atau referensi buku untuk dipadukan ke dalam draf..."
                    rows={3}
                    className="text-xs leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-3 text-sky-500" />
                    AI akan menyintesis konsep referensi secara akademis tanpa salin-tempel langsung (anti-plagiarisme).
                  </p>
                </div>

                {/* Pilihan Gaya Bahasa (US3) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">4. Gaya Penulisan Rekomendasi:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "academic", label: "Akademik Formal", desc: "Standar skripsi baku & objektif" },
                      { id: "concise", label: "Ringkas & Padat", desc: "Lugas, efektif, to-the-point" },
                      { id: "elaborative", label: "Elaboratif", desc: "Mendalam & memperjelas konteks" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setStyleMode(mode.id as typeof styleMode)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          styleMode === mode.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="font-semibold text-xs flex items-center justify-between">
                          {mode.label}
                          {styleMode === mode.id && (
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5 text-primary" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-3 justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          {activeTab === "assistant" && (
            <Button
              size="sm"
              onClick={() => void handleGenerate()}
              disabled={paraphrase.loading || selection.trim().length < 10}
            >
              {paraphrase.loading ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="mr-1.5 size-4 animate-spin" />
                  Memproses Parafrase…
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="mr-1.5 size-4" />
                  Generate Rekomendasi Draf
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
