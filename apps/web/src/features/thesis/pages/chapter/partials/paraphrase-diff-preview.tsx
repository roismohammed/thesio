import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiInnovation01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  Loading03Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

interface ParaphraseDiffPreviewProps {
  originalText: string
  paraphrasedText: string
  styleMode: "academic" | "concise" | "elaborative"
  onStyleChange?: (mode: "academic" | "concise" | "elaborative") => void
  onApply: () => Promise<void>
  onDiscard: () => void
  loading?: boolean
}

export function ParaphraseDiffPreview({
  originalText,
  paraphrasedText,
  styleMode,
  onApply,
  onDiscard,
  loading = false,
}: ParaphraseDiffPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paraphrasedText)
      setCopied(true)
      toast.add({ title: "Teks parafrase berhasil disalin.", type: "success" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.add({ title: "Gagal menyalin teks.", type: "error" })
    }
  }

  const originalWordCount = originalText.trim().split(/\s+/).filter(Boolean).length
  const newWordCount = paraphrasedText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="rounded-xl border border-primary/40 bg-card shadow-sm overflow-hidden animate-in fade-in zoom-in-98 duration-200">
      <div className="flex flex-wrap items-center justify-between border-b bg-primary/5 px-4 py-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={AiInnovation01Icon} strokeWidth={2} className="size-4" />
          </span>
          <div>
            <h4 className="text-xs font-semibold">Hasil Rekomendasi Parafrase</h4>
            <p className="text-[11px] text-muted-foreground">
              Mode gaya: <span className="font-medium text-foreground capitalize">{styleMode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => void handleCopy()}
          >
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              strokeWidth={2}
              className={`size-3.5 ${copied ? "text-green-600" : ""}`}
            />
            {copied ? "Tersalin" : "Salin Hasil"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
            onClick={onDiscard}
            disabled={loading}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
            Tolak / Buang
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-8 text-xs gap-1.5 font-medium"
            onClick={() => void onApply()}
            disabled={loading}
          >
            {loading ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-3.5 animate-spin" />
                Menerapkan…
              </>
            ) : (
              <>
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                Terapkan ke Bab
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
        {/* Kolom Draf Asli */}
        <div className="p-4 space-y-2 bg-muted/10">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground border-b pb-1.5">
            <span>DRAF ASLI</span>
            <span className="font-mono">{originalWordCount} kata</span>
          </div>
          <div className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
            {originalText}
          </div>
        </div>

        {/* Kolom Hasil Rekomendasi */}
        <div className="p-4 space-y-2 bg-primary/5">
          <div className="flex items-center justify-between text-[11px] font-medium text-primary border-b pb-1.5">
            <span>HASIL REKOMENDASI AI</span>
            <span className="font-mono">{newWordCount} kata</span>
          </div>
          <div className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
            {paraphrasedText}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
        <span>Menyetujui akan membuat snapshot versi baru bab ini dan menggantikan teks terpilih.</span>
      </div>
    </div>
  )
}
