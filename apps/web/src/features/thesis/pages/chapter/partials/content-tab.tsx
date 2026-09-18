import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiInnovation01Icon,
  Comment01Icon,
  Edit02Icon,
  Loading03Icon,
  SparklesIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileField } from "@/components/forms/file-field"
import { Form } from "@/components/forms/form"
import { toast } from "@/components/ui/toast"
import { ChapterContentViewer } from "@/features/thesis/components/chapter-content-viewer"
import { ChapterEditor } from "@/features/thesis/components/chapter-editor"
import {
  HighlightToolbar,
  type StabiloColor,
} from "@/features/thesis/components/highlight-toolbar"
import { AnnotationSidebar } from "@/features/thesis/components/annotation-sidebar"
import { GrammarCheckerDialog } from "@/features/thesis/components/grammar-checker-dialog"
import { ParaphraseAssistantModal } from "@/features/thesis/pages/chapter/partials/paraphrase-assistant-modal"
import { AiWriterModal } from "@/features/thesis/pages/chapter/partials/ai-writer-modal"
import { saveChapterContent, uploadChapterVersion } from "@/features/thesis/api/thesis"
import { useChapterAnnotations } from "@/features/thesis/hooks/use-chapter-annotations"
import type { Chapter } from "@/features/thesis/types"
import { ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { usePermission } from "@/hooks/use-permission"

interface ContentTabProps {
  thesisId: number
  chapter: Chapter
  refresh: () => Promise<void>
}

export function ContentTab({ thesisId, chapter, refresh }: ContentTabProps) {
  const { t } = useTranslation("thesis")
  const { user } = useAuth()
  const { hasRole, hasPermission } = usePermission()
  const canAcademic = hasRole("super admin") || hasPermission("access academic tools")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [grammarOpen, setGrammarOpen] = useState(false)
  const [paraphraseModalOpen, setParaphraseModalOpen] = useState(false)
  const [aiWriterOpen, setAiWriterOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showAnnotationsSidebar, setShowAnnotationsSidebar] = useState(true)

  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number } | null>(null)
  const [selectedText, setSelectedText] = useState("")

  const containerRef = useRef<HTMLDivElement>(null)
  const version = chapter.current_version
  const { annotations, add: addAnnotation, update: updateAnnotation, remove: deleteAnnotation } = useChapterAnnotations(
    thesisId,
    chapter.id,
  )

  // Polling konversi jika status masih pending
  useEffect(() => {
    if (version?.conversion_status !== "pending") return

    const interval = setInterval(() => {
      void refresh()
    }, 2000)

    return () => clearInterval(interval)
  }, [version?.conversion_status, refresh])

  // Tangkap pemilihan teks (selection) untuk stabilo / komentar / parafrase
  const handleMouseUp = () => {
    if (isEditing) return

    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectionPosition(null)
      setSelectedText("")
      return
    }

    const text = selection.toString().trim()
    if (!text || text.length < 2) {
      setSelectionPosition(null)
      setSelectedText("")
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setSelectedText(text)
    setSelectionPosition({
      top: rect.top,
      left: rect.left + rect.width / 2,
    })
  }

  const handleHighlight = async (
    color: StabiloColor,
    comment?: string,
    authorName?: string,
    authorRole?: "student" | "lecturer",
  ) => {
    try {
      await addAnnotation({
        selected_text: selectedText,
        color,
        comment: comment ?? null,
        author_name: authorName ?? user?.name ?? "Pengguna",
        author_role: authorRole ?? (user?.roles?.includes("lecturer") ? "lecturer" : "student"),
        version_id: version?.id ?? null,
      })
      toast.add({
        title: comment ? "Komentar berhasil ditambahkan." : "Stabilo berhasil ditambahkan.",
        type: "success",
      })
      window.getSelection()?.removeAllRanges()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menambahkan catatan.",
        type: "error",
      })
    }
  }

  const handleSaveEditor = async (markdown: string) => {
    try {
      await saveChapterContent(thesisId, chapter.id, markdown)
      toast.add({ title: "Konten bab berhasil disimpan.", type: "success" })
      setIsEditing(false)
      await refresh()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menyimpan konten.",
        type: "error",
      })
    }
  }

  function handleOpenParaphrase(text?: string) {
    if (!canAcademic) {
      toast.add({
        title: "Fitur Parafrase AI memerlukan paket Ultimate. Silakan upgrade paket Anda.",
        type: "warning",
      })
      return
    }
    if (text) {
      setSelectedText(text)
    }
    setParaphraseModalOpen(true)
    setSelectionPosition(null)
  }

  return (
    <div className="flex flex-col gap-4" ref={containerRef}>
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {version && !isEditing && (
            <Button
              variant={showAnnotationsSidebar ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowAnnotationsSidebar(!showAnnotationsSidebar)}
            >
              <HugeiconsIcon icon={Comment01Icon} strokeWidth={2} className="size-4" />
              Catatan & Stabilo ({annotations.length})
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!canAcademic) {
                    toast.add({
                      title: "Fitur Cek Tata Bahasa AI memerlukan paket Ultimate. Silakan upgrade paket Anda.",
                      type: "warning",
                    })
                    return
                  }
                  setGrammarOpen(true)
                }}
                disabled={!version?.markdown_content}
              >
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-4" />
                Cek Tata Bahasa AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!canAcademic) {
                    toast.add({
                      title: "Fitur Tulis AI memerlukan paket Ultimate. Silakan upgrade paket Anda.",
                      type: "warning",
                    })
                    return
                  }
                  setAiWriterOpen(true)
                }}
              >
                <HugeiconsIcon icon={AiInnovation01Icon} strokeWidth={2} className="size-4 text-primary" />
                Tulis dengan AI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenParaphrase(selectedText || version?.markdown_content?.substring(0, 300) || "")}
                disabled={!version?.markdown_content}
              >
                <HugeiconsIcon icon={AiInnovation01Icon} strokeWidth={2} className="size-4" />
                Asisten Parafrase
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4" />
                {version?.markdown_content ? "Edit Teks" : "Tulis Markdown"}
              </Button>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} className="size-4" />
                {t("content.upload")}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <ChapterEditor
          initialContent={version?.markdown_content ?? ""}
          onSave={handleSaveEditor}
          onCancel={() => setIsEditing(false)}
          onOpenAiWriter={() => setAiWriterOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${showAnnotationsSidebar && version?.markdown_content ? "lg:col-span-2" : "col-span-full"}`}>
            <Card>
              <CardContent className="min-h-48 p-6" onMouseUp={handleMouseUp}>
                {!version ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-muted-foreground text-sm">{t("content.empty")}</p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="mr-1.5 size-3.5" />
                        Tulis Langsung
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                      >
                        <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} className="mr-1.5 size-3.5" />
                        {t("content.upload")}
                      </Button>
                    </div>
                  </div>
                ) : version.conversion_status === "pending" ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-7 animate-spin text-primary" />
                    <p className="text-muted-foreground text-sm font-medium">{t("content.converting")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-3.5 mr-1" />
                        Tulis Langsung Manual
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                      >
                        <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} className="size-3.5 mr-1" />
                        Unggah Ulang
                      </Button>
                    </div>
                  </div>
                ) : version.conversion_status === "failed" ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <p className="text-destructive text-sm font-medium">
                      {t("content.conversionFailed", { message: version.conversion_message ?? "" })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Tulis Manual
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                      >
                        Unggah Ulang
                      </Button>
                    </div>
                  </div>
                ) : version.markdown_content ? (
                  <div className="select-text">
                    <ChapterContentViewer
                      content={version.markdown_content}
                      annotations={annotations}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground text-sm">{t("content.noMarkdown")}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setIsEditing(true)}
                    >
                      Mulai Menulis Markdown
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Anotasi & Komentar */}
          {showAnnotationsSidebar && version?.markdown_content && (
            <div className="lg:col-span-1">
              <AnnotationSidebar
                annotations={annotations}
                onResolveToggle={async (item) => {
                  await updateAnnotation(item.id, { is_resolved: !item.is_resolved })
                }}
                onDelete={async (id) => {
                  await deleteAnnotation(id)
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Floating Toolbar saat teks dipilih */}
      <HighlightToolbar
        position={selectionPosition}
        selectedText={selectedText}
        onHighlight={handleHighlight}
        onParaphrase={(text) => handleOpenParaphrase(text)}
        onClose={() => {
          setSelectionPosition(null)
          setSelectedText("")
        }}
      />

      {/* Modal Asisten Parafrase & Revisi */}
      <ParaphraseAssistantModal
        open={paraphraseModalOpen}
        onOpenChange={setParaphraseModalOpen}
        thesisId={thesisId}
        chapter={chapter}
        initialSelection={selectedText}
        onApplied={async () => {
          await refresh()
        }}
      />

      {/* Dialog Unggah Berkas */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSubmit={async () => {
          setUploadOpen(false)
          await refresh()
        }}
        thesisId={thesisId}
        chapterId={chapter.id}
      />

      {/* Dialog Pemeriksa Tata Bahasa AI */}
      <GrammarCheckerDialog
        open={grammarOpen}
        onOpenChange={setGrammarOpen}
        thesisId={thesisId}
        chapterId={chapter.id}
        currentMarkdown={version?.markdown_content ?? ""}
        onApplied={async () => {
          await refresh()
        }}
      />

      {/* Modal AI Co-Writer Bab Skripsi */}
      <AiWriterModal
        open={aiWriterOpen}
        onOpenChange={setAiWriterOpen}
        thesisId={thesisId}
        chapter={chapter}
        currentContent={version?.markdown_content ?? ""}
        onInsert={async (text) => {
          const current = version?.markdown_content ?? ""
          const updated = current ? `${current}\n\n${text}` : text
          await handleSaveEditor(updated)
        }}
        onReplace={async (text) => {
          await handleSaveEditor(text)
        }}
      />
    </div>
  )
}

function UploadDialog({
  open,
  onOpenChange,
  onSubmit,
  thesisId,
  chapterId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: () => Promise<void>
  thesisId: number
  chapterId: number
}) {
  const { t } = useTranslation("thesis")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values: { file?: File }) => {
    if (!values.file) {
      toast.add({ title: "Pilih berkas dokumen terlebih dahulu.", type: "error" })
      return
    }
    setSubmitting(true)
    try {
      await uploadChapterVersion(thesisId, chapterId, values.file)
      toast.add({ title: t("thesis.toast.saved"), type: "success" })
      await onSubmit()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal mengunggah dokumen.",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !submitting && onOpenChange(val)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("content.uploadTitle")}</DialogTitle>
        </DialogHeader>
        <Form key={open ? "open" : "closed"} onSubmit={handleSubmit}>
          <FileField
            name="file"
            accept=".pdf,.doc,.docx"
            hint={t("content.uploadHint")}
            required
            disabled={submitting}
          />
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              {t("thesis.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="mr-2 size-4 animate-spin" />
                  Mengunggah…
                </>
              ) : (
                t("content.upload")
              )}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

