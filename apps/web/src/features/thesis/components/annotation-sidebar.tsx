import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  CircleIcon,
  Comment01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ChapterAnnotation } from "@/features/thesis/types"

interface AnnotationSidebarProps {
  annotations: ChapterAnnotation[]
  onResolveToggle: (annotation: ChapterAnnotation) => Promise<void>
  onDelete: (annotationId: number) => Promise<void>
  onSelectAnnotation?: (annotation: ChapterAnnotation) => void
}

const COLOR_BORDER: Record<string, string> = {
  yellow: "border-l-amber-400 bg-amber-50/40 dark:bg-amber-950/20",
  green: "border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20",
  blue: "border-l-sky-500 bg-sky-50/40 dark:bg-sky-950/20",
  pink: "border-l-rose-400 bg-rose-50/40 dark:bg-rose-950/20",
  orange: "border-l-orange-500 bg-orange-50/40 dark:bg-orange-950/20",
}

const COLOR_NAME: Record<string, string> = {
  yellow: "Stabilo Kuning",
  green: "Stabilo Hijau",
  blue: "Stabilo Biru",
  pink: "Stabilo Merah Muda",
  orange: "Stabilo Oranye",
}

export function AnnotationSidebar({
  annotations,
  onResolveToggle,
  onDelete,
  onSelectAnnotation,
}: AnnotationSidebarProps) {
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all")

  const filtered = annotations.filter((a) => {
    if (filter === "active") return !a.is_resolved
    if (filter === "resolved") return a.is_resolved
    return true
  })

  return (
    <Card className="flex flex-col border shadow-sm">
      <CardHeader className="p-4 pb-3 border-b bg-muted/20">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} className="size-4 text-primary" />
            Catatan Revisi & Stabilo ({annotations.length})
          </CardTitle>
          <div className="flex rounded-lg border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded px-2 py-0.5 transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`rounded px-2 py-0.5 transition-colors ${
                filter === "active" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Belum
            </button>
            <button
              type="button"
              onClick={() => setFilter("resolved")}
              className={`rounded px-2 py-0.5 transition-colors ${
                filter === "resolved" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Selesai
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 max-h-[500px] overflow-y-auto flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {annotations.length === 0
              ? "Belum ada catatan atau stabilo. Sorot teks pada dokumen bab untuk menambahkan warna & catatan komentar."
              : "Tidak ada catatan pada filter ini."}
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAnnotation?.(item)}
              className={`group flex flex-col gap-1.5 rounded-lg border border-l-4 p-3 text-xs transition-all ${
                COLOR_BORDER[item.color] ?? "border-l-primary"
              } ${item.is_resolved ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant={item.author_role === "lecturer" ? "default" : "secondary"} className="h-5 text-[10px] px-1.5">
                    {item.author_role === "lecturer" ? "Dosen" : "Mahasiswa"}
                  </Badge>
                  <span className="font-semibold text-foreground truncate max-w-[120px]">
                    {item.author_name || (item.author_role === "lecturer" ? "Pembimbing" : "Mahasiswa")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{COLOR_NAME[item.color]}</span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      void onResolveToggle(item)
                    }}
                    className={`rounded p-1 transition-colors hover:bg-background ${
                      item.is_resolved ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                    title={item.is_resolved ? "Tandai belum selesai" : "Tandai selesai direvisi"}
                  >
                    {item.is_resolved ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                    ) : (
                      <HugeiconsIcon icon={CircleIcon} strokeWidth={2} className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm("Hapus catatan ini?")) {
                        void onDelete(item.id)
                      }
                    }}
                    className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-background transition-colors"
                    title="Hapus"
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="italic text-muted-foreground rounded bg-background/60 p-1.5 border border-dashed border-input line-clamp-2">
                "{item.selected_text}"
              </div>

              {item.comment && (
                <p className="text-foreground font-medium whitespace-pre-wrap leading-relaxed mt-0.5">
                  {item.comment}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
