import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  FloppyDiskIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightBlockQuoteIcon,
  Loading03Icon,
  SparklesIcon,
  TextBoldIcon,
  TextItalicIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChapterContentViewer } from "@/features/thesis/components/chapter-content-viewer"

interface ChapterEditorProps {
  initialContent: string
  onSave: (markdown: string) => Promise<void>
  onCancel: () => void
  onOpenAiWriter?: () => void
}

export function ChapterEditor({ initialContent, onSave, onCancel, onOpenAiWriter }: ChapterEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview" | "split">("split")

  const insertText = (before: string, after: string = "", defaultText: string = "") => {
    const textarea = document.getElementById("chapter-markdown-editor") as HTMLTextAreaElement | null
    if (!textarea) {
      setContent((prev) => prev + before + defaultText + after)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end) || defaultText
    const newContent = content.substring(0, start) + before + selected + after + content.substring(end)

    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(content)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-0 border-primary/30 shadow-md">
      <CardHeader className="border-b bg-muted/40 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Editor Konten Bab (Markdown)</CardTitle>
            <div className="flex rounded-lg border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  activeTab === "edit" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tulis
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  activeTab === "preview" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pratinjau
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("split")}
                className={`hidden md:block rounded px-2.5 py-1 transition-colors ${
                  activeTab === "split" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Berdampingan
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiWriter && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-primary border-primary/40 hover:bg-primary/5"
                onClick={onOpenAiWriter}
              >
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="mr-1 size-3.5" />
                Tulis dgn AI
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="mr-1 size-3.5" />
              Batal
            </Button>
            <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
              {saving ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="mr-1.5 size-3.5 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={FloppyDiskIcon} strokeWidth={2} className="mr-1.5 size-3.5" />
                  Simpan Versi Baru
                </>
              )}
            </Button>
          </div>
        </div>

        {activeTab !== "preview" && (
          <div className="mt-2 flex flex-wrap items-center gap-1 border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => insertText("# ", "", "Judul Bab")}
              title="Heading 1"
            >
              <HugeiconsIcon icon={Heading01Icon} strokeWidth={2} className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => insertText("## ", "", "Sub-bab")}
              title="Heading 2"
            >
              <HugeiconsIcon icon={Heading02Icon} strokeWidth={2} className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => insertText("### ", "", "Topik")}
              title="Heading 3"
            >
              <HugeiconsIcon icon={Heading03Icon} strokeWidth={2} className="size-3.5" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-bold"
              onClick={() => insertText("**", "**", "teks tebal")}
              title="Tebal (Bold)"
            >
              <HugeiconsIcon icon={TextBoldIcon} strokeWidth={2} className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs italic"
              onClick={() => insertText("*", "*", "teks miring")}
              title="Miring (Italic)"
            >
              <HugeiconsIcon icon={TextItalicIcon} strokeWidth={2} className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => insertText("> ", "", "Kutipan / Catatan")}
              title="Kutipan (Blockquote)"
            >
              <HugeiconsIcon icon={LeftToRightBlockQuoteIcon} strokeWidth={2} className="size-3.5" />
            </Button>
            <div className="mx-1 h-4 w-px bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => insertText("- ", "", "Poin daftar")}
              title="Daftar Poin (Bullet List)"
            >
              •
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-mono"
              onClick={() => insertText("1. ", "", "Langkah nomor")}
              title="Daftar Nomor (Numbered List)"
            >
              1.
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-mono"
              onClick={() => insertText("`", "`", "kode/rumus")}
              title="Kode / Istilah"
            >
              &lt;/&gt;
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          {activeTab !== "preview" && (
            <div className={`p-4 ${activeTab === "edit" ? "col-span-full" : ""}`}>
              <Textarea
                id="chapter-markdown-editor"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis atau edit konten dokumen bab skripsi dalam format Markdown..."
                className="min-h-[450px] font-mono text-sm leading-relaxed resize-y border-0 focus-visible:ring-0 p-0"
              />
            </div>
          )}

          {activeTab !== "edit" && (
            <div
              className={`p-6 max-h-[550px] overflow-y-auto bg-muted/10 ${
                activeTab === "preview" ? "col-span-full" : ""
              }`}
            >
              <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3.5" />
                Hasil Pratinjau:
              </div>
              <ChapterContentViewer content={content || "*Konten masih kosong.*"} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
