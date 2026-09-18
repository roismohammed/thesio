import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  BookOpen01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  File01Icon,
  InformationCircleIcon,
  Loading03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { aiWriteChapter, listReferences } from "@/features/thesis/api/thesis"
import type { Chapter, Reference } from "@/features/thesis/types"
import { ApiError } from "@/lib/api"
import { ChapterContentViewer } from "@/features/thesis/components/chapter-content-viewer"

interface AiWriterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  thesisId: number
  chapter: Chapter
  currentContent?: string
  onInsert: (markdown: string) => Promise<void> | void
  onReplace: (markdown: string) => Promise<void> | void
}

export function AiWriterModal({
  open,
  onOpenChange,
  thesisId,
  chapter,
  currentContent = "",
  onInsert,
  onReplace,
}: AiWriterModalProps) {
  const [loading, setLoading] = useState(false)
  const [references, setReferences] = useState<Reference[]>([])
  const [loadingRefs, setLoadingRefs] = useState(false)

  // Form State
  const [sectionTitle, setSectionTitle] = useState("")
  const [instruction, setInstruction] = useState("")
  const [selectedRefIds, setSelectedRefIds] = useState<number[]>([])
  const [writingTone, setWritingTone] = useState<"academic" | "critical" | "methodological">("academic")
  const [targetLength, setTargetLength] = useState<"short" | "medium" | "long">("medium")

  // Result State
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [usedReferences, setUsedReferences] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")

  useEffect(() => {
    if (open) {
      setLoadingRefs(true)
      listReferences(thesisId, chapter.id)
        .then((res) => {
          setReferences(res.data)
          // Default: select all references
          setSelectedRefIds(res.data.map((r) => r.id))
        })
        .catch(() => setReferences([]))
        .finally(() => setLoadingRefs(false))
    }
  }, [open, thesisId, chapter.id])

  const toggleRef = (id: number) => {
    setSelectedRefIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleSelectAllRefs = () => {
    if (selectedRefIds.length === references.length) {
      setSelectedRefIds([])
    } else {
      setSelectedRefIds(references.map((r) => r.id))
    }
  }

  const handleGenerate = async () => {
    if (!instruction.trim() || instruction.trim().length < 5) {
      toast.add({ title: "Instruksi/topik minimal 5 karakter.", type: "error" })
      return
    }

    setLoading(true)
    try {
      const res = await aiWriteChapter(thesisId, chapter.id, {
        instruction: instruction.trim(),
        section_title: sectionTitle.trim() || null,
        reference_ids: selectedRefIds,
        current_content: currentContent || null,
        writing_tone: writingTone,
        target_length: targetLength,
      })

      setGeneratedContent(res.data.content)
      setUsedReferences(res.data.references_used)
      setActiveTab("preview")
      toast.add({ title: "Draft naskah berhasil disusun AI.", type: "success" })
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menyusun naskah via AI.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!generatedContent) return
    void navigator.clipboard.writeText(generatedContent)
    toast.add({ title: "Naskah berhasil disalin ke clipboard.", type: "success" })
  }

  const handleInsertAction = async () => {
    if (!generatedContent) return
    await onInsert(generatedContent)
    onOpenChange(false)
  }

  const handleReplaceAction = async () => {
    if (!generatedContent) return
    if (currentContent && !window.confirm("Ganti seluruh konten naskah bab ini dengan hasil AI?")) {
      return
    }
    await onReplace(generatedContent)
    onOpenChange(false)
  }

  const wordCount = generatedContent ? generatedContent.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl lg:max-w-5xl h-[88vh] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header with safe right padding for close button */}
        <DialogHeader className="border-b bg-muted/30 px-6 py-3.5 pr-14 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold leading-tight text-foreground truncate">
                  AI Co-Writer Bab Skripsi
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  Penyusunan draf sub-bab berbasis referensi ilmiah
                </p>
              </div>
            </div>

            {generatedContent && (
              <div className="flex rounded-lg border bg-background p-0.5 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    activeTab === "write"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Konfigurasi
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors flex items-center gap-1.5 ${
                    activeTab === "preview"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
                  Pratinjau Hasil
                </button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Tab 1: Form Konfigurasi */}
        {activeTab === "write" ? (
          <div className="relative flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-6 animate-spin" />
                </div>
                <div className="text-center px-4">
                  <p className="font-semibold text-sm text-foreground">Sedang Menyusun Naskah Ilmiah…</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    AI sedang mensintesis instruksi dan referensi bab menjadi draf akademik yang terstruktur.
                  </p>
                </div>
              </div>
            )}

            {/* Info Header Bab */}
            <div className="rounded-lg border bg-muted/20 px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground shrink-0 font-medium">Target Bab:</span>
                <span className="font-semibold text-foreground truncate">{chapter.title}</span>
              </div>
              {currentContent ? (
                <span className="text-[11px] text-muted-foreground shrink-0">
                  Konteks draf aktif: {currentContent.length.toLocaleString()} karakter
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground shrink-0 italic">
                  Bab masih kosong (akan membuat draf baru)
                </span>
              )}
            </div>

            {/* Input Judul Sub-bab */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-4 text-primary" />
                1. Judul Sub-bab / Bagian (Opsional):
              </label>
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Contoh: 1.2 Rumusan Masalah / 2.1 Landasan Teori Akseptansi Teknologi"
                className="text-xs h-9.5"
              />
            </div>

            {/* Input Instruksi Detail */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-4 text-primary" />
                  2. Instruksi & Arahan Penulisan (Wajib):
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {instruction.length}/2000
                </span>
              </div>
              <Textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Jelaskan apa yang ingin ditulis, fenomena empiris, teori yang ingin dikaitkan, sudut pandang argumen, atau susunan poin yang diharapkan..."
                rows={4}
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Referensi Bab Sebagai Acuan */}
            <div className="space-y-2.5 rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} className="size-4 text-sky-600" />
                  3. Rujukan Ilmiah Terdaftar di Bab Ini:
                </label>
                {references.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllRefs}
                    className="text-[11px] font-medium text-primary hover:underline transition-colors"
                  >
                    {selectedRefIds.length === references.length ? "Batal Pilih Semua" : "Pilih Semua"}
                  </button>
                )}
              </div>

              {loadingRefs ? (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
                  Memuat daftar referensi bab…
                </div>
              ) : references.length === 0 ? (
                <div className="rounded-md border border-dashed bg-background/50 p-3 text-center text-xs text-muted-foreground">
                  Belum ada referensi tersimpan di bab ini. AI akan menggunakan rujukan ilmiah umum. Anda dapat menambahkan referensi di tab &quot;Referensi&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {references.map((ref) => {
                    const isChecked = selectedRefIds.includes(ref.id)
                    const citationLabel = ref.authors ? `${ref.authors} (${ref.year ?? "n.d."})` : ref.title
                    return (
                      <label
                        key={ref.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-background border-primary/50 shadow-2xs ring-1 ring-primary/20"
                            : "bg-background/60 border-border/70 hover:bg-background"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRef(ref.id)}
                          className="mt-0.5 rounded border-muted-foreground text-primary focus:ring-primary shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{citationLabel}</p>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{ref.title}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-3.5 text-sky-500 shrink-0" />
                <span>Referensi yang dicentang akan disintesis ke dalam paragraf dengan format sitasi ilmiah baku.</span>
              </p>
            </div>

            {/* Gaya Bahasa & Estimasi Panjang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">4. Gaya Penulisan:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "academic", label: "Akademik", desc: "Baku & objektif" },
                    { id: "critical", label: "Kritis", desc: "Analitis & komparatif" },
                    { id: "methodological", label: "Metodologis", desc: "Sistematis & rinci" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setWritingTone(mode.id as typeof writingTone)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                        writingTone === mode.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold text-primary shadow-2xs"
                          : "border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-semibold">{mode.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">5. Estimasi Panjang Naskah:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "short", label: "Ringkas", desc: "1-2 paragraf" },
                    { id: "medium", label: "Standar", desc: "2-4 paragraf" },
                    { id: "long", label: "Mendalam", desc: "4-6 paragraf" },
                  ].map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => setTargetLength(len.id as typeof targetLength)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                        targetLength === len.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary font-semibold text-primary shadow-2xs"
                          : "border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs font-semibold">{len.label}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{len.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Pratinjau Naskah Hasil AI */
          <div className="flex-1 min-h-0 flex flex-col p-6 gap-3.5">
            {/* Status & References Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-lg border bg-primary/5 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-primary" />
                <span className="font-semibold text-foreground">Draf Naskah Selesai Disusun</span>
                <span className="text-muted-foreground">({wordCount} kata)</span>
              </div>
              {usedReferences.length > 0 && (
                <span className="text-muted-foreground text-xs">
                  Referensi disitasi: <span className="font-semibold text-foreground">{usedReferences.length} sumber</span>
                </span>
              )}
            </div>

            {/* Document Viewer Container - fills space, single clean scrollbar */}
            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card p-6 shadow-2xs">
              <ChapterContentViewer content={generatedContent ?? ""} />
            </div>
          </div>
        )}

        {/* Dedicated Fixed Footer Bar - ALWAYS visible, never cut off */}
        <div className="border-t bg-muted/20 px-6 py-3.5 shrink-0 flex flex-wrap items-center justify-between gap-3">
          {activeTab === "write" ? (
            <>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
                Tutup
              </Button>

              <Button
                size="sm"
                onClick={() => void handleGenerate()}
                disabled={loading || instruction.trim().length < 5}
              >
                {loading ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="mr-1.5 size-4 animate-spin" />
                    Menyusun Naskah Ilmiah…
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="mr-1.5 size-4" />
                    Mulai Susun Draf
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Tutup
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("write")}>
                  Ubah Konfigurasi
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="mr-1.5 size-3.5" />
                  Salin Teks
                </Button>
                <Button variant="outline" size="sm" onClick={() => void handleInsertAction()}>
                  Sisipkan ke Naskah
                </Button>
                <Button size="sm" onClick={() => void handleReplaceAction()}>
                  Ganti Naskah Bab
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
