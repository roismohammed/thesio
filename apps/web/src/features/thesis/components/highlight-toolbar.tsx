import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiInnovation01Icon,
  CheckmarkCircle02Icon,
  Comment01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

export type StabiloColor = "yellow" | "green" | "blue" | "pink" | "orange"

interface HighlightToolbarProps {
  position: { top: number; left: number } | null
  selectedText: string
  onHighlight: (color: StabiloColor, comment?: string, authorName?: string, authorRole?: "student" | "lecturer") => Promise<void>
  onParaphrase?: (text: string) => void
  onClose: () => void
}

const COLORS: { key: StabiloColor; label: string; bgClass: string; dotClass: string }[] = [
  { key: "yellow", label: "Kuning (Sorotan Utama)", bgClass: "bg-yellow-200 dark:bg-yellow-900/60", dotClass: "bg-amber-400" },
  { key: "green", label: "Hijau (Sesuai / Valid)", bgClass: "bg-green-200 dark:bg-green-900/60", dotClass: "bg-emerald-500" },
  { key: "blue", label: "Biru (Saran Tambahan)", bgClass: "bg-blue-200 dark:bg-blue-900/60", dotClass: "bg-sky-500" },
  { key: "pink", label: "Merah Muda (Perlu Koreksi)", bgClass: "bg-pink-200 dark:bg-pink-900/60", dotClass: "bg-rose-400" },
  { key: "orange", label: "Oranye (Penting / Hati-hati)", bgClass: "bg-orange-200 dark:bg-orange-900/60", dotClass: "bg-orange-500" },
]

export function HighlightToolbar({
  position,
  selectedText,
  onHighlight,
  onParaphrase,
  onClose,
}: HighlightToolbarProps) {
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<StabiloColor>("yellow")
  const [commentText, setCommentText] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [authorRole, setAuthorRole] = useState<"student" | "lecturer">("lecturer")
  const [submitting, setSubmitting] = useState(false)

  if (!position && !commentDialogOpen) return null

  const handleQuickHighlight = async (color: StabiloColor) => {
    await onHighlight(color)
    onClose()
  }

  const handleOpenCommentDialog = (color: StabiloColor) => {
    setSelectedColor(color)
    setCommentDialogOpen(true)
  }

  const handleSaveComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      await onHighlight(selectedColor, commentText.trim(), authorName.trim() || undefined, authorRole)
      setCommentDialogOpen(false)
      setCommentText("")
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {position && !commentDialogOpen && (
        <div
          className="fixed z-50 flex items-center gap-1.5 rounded-full border bg-popover/95 px-3 py-1.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95"
          style={{
            top: `${Math.max(10, position.top - 48)}px`,
            left: `${Math.max(10, position.left)}px`,
            transform: "translateX(-50%)",
          }}
          onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
        >
          <div className="flex items-center gap-1 border-r pr-1.5">
            {COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => void handleQuickHighlight(c.key)}
                className={`group relative flex size-6 items-center justify-center rounded-full transition-transform hover:scale-115 ${c.dotClass}`}
                title={`Stabilo ${c.label}`}
              >
                <span className="sr-only">{c.label}</span>
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs font-medium"
            onClick={() => handleOpenCommentDialog("yellow")}
          >
            <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} className="size-3.5 text-primary" />
            Beri Komentar
          </Button>

          {onParaphrase && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-medium text-amber-600 dark:text-amber-400"
              onClick={() => {
                onParaphrase(selectedText)
                onClose()
              }}
            >
              <HugeiconsIcon icon={AiInnovation01Icon} strokeWidth={2} className="size-3.5" />
              AI
            </Button>
          )}
        </div>
      )}

      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} className="size-4 text-primary" />
              Tambah Catatan & Komentar Pembimbing / Mahasiswa
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground italic border-l-2 border-primary">
              "{selectedText.length > 120 ? selectedText.substring(0, 120) + "…" : selectedText}"
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium">Warna Stabilo:</label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedColor(c.key)}
                    className={`flex size-7 items-center justify-center rounded-full transition-all ${c.dotClass} ${
                      selectedColor === c.key ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                    title={c.label}
                  >
                    {selectedColor === c.key && (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Peran Pemberi Komentar:</label>
                <select
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value as "student" | "lecturer")}
                  className="rounded-md border bg-background px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="lecturer">Dosen Pembimbing</option>
                  <option value="student">Mahasiswa</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Nama (Opsional):</label>
                <Input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Nama Dosen / Mahasiswa"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Isi Komentar / Revisi:</label>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tuliskan catatan revisi, saran, atau pertanyaan mengenai bagian ini..."
                rows={3}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCommentDialogOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSaveComment()}
              disabled={submitting || !commentText.trim()}
            >
              Simpan Komentar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
