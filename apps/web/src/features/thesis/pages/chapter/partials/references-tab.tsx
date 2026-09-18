import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useWatch } from "react-hook-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { Book02Icon, Copy01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"
import { TextField } from "@/components/forms/text-field"
import { FileField } from "@/components/forms/file-field"
import { Form, useFormField } from "@/components/forms/form"
import { SelectField } from "@/components/forms/select-field"
import type { Chapter, Reference } from "@/features/thesis/types"
import {
  createFileReference,
  createLinkReference,
  deleteReference,
  listReferences,
  referenceDownloadUrl,
  updateReference,
} from "@/features/thesis/api/thesis"
import { ApiError, getCachedApi } from "@/lib/api"
import { useFormSubmit } from "@/components/forms/use-form-submit"

interface ReferencesTabProps {
  thesisId: number
  chapter: Chapter
}

export function ReferencesTab({ thesisId, chapter }: ReferencesTabProps) {
  const { t } = useTranslation("thesis")
  const cacheKey = `/api/thesis/${thesisId}/chapters/${chapter.id}/references`
  const [references, setReferences] = useState<Reference[]>(() => {
    return getCachedApi<{ data: Reference[] }>(cacheKey)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Reference[] }>(cacheKey)
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRef, setEditRef] = useState<Reference | null>(null)
  const [style, setStyle] = useState<"apa" | "ieee">("apa")

  const load = useCallback(async () => {
    try {
      const payload = await listReferences(thesisId, chapter.id)
      setReferences(payload.data)
    } catch {
      setReferences([])
    } finally {
      setLoading(false)
    }
  }, [thesisId, chapter.id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(reference: Reference) {
    if (!window.confirm(t("references.deleteConfirm"))) {
      return
    }
    try {
      await deleteReference(thesisId, chapter.id, reference.id)
      toast.add({ title: t("references.toast.deleted"), type: "success" })
      void load()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("references.toast.deleted"), type: "error" })
    }
  }

  function formatCitation(ref: Reference, format: "apa" | "ieee"): string {
    const author = ref.authors || "Anonim"
    const year = ref.year || "n.d."
    const title = ref.title
    const pub = ref.publication ? ` ${ref.publication}.` : ""
    const vol = ref.volume ? ` ${ref.volume}` : ""
    const pp = ref.pages ? `:${ref.pages}.` : "."
    const doi = ref.doi ? ` https://doi.org/${ref.doi}` : ref.url ? ` ${ref.url}` : ""

    if (format === "apa") {
      return `${author} (${year}). ${title}.${pub}${vol}${pp}${doi}`
    } else {
      return `${author}, "${title}," ${ref.publication || "Publisher"}, ${year}${vol}${pp}${doi}`
    }
  }

  function handleCopy(text: string, label: string) {
    void navigator.clipboard.writeText(text)
    toast.add({ title: `${label} disalin ke clipboard`, type: "success" })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Format Daftar Pustaka:</span>
          <Button
            size="sm"
            variant={style === "apa" ? "default" : "outline"}
            onClick={() => setStyle("apa")}
          >
            APA 7th
          </Button>
          <Button
            size="sm"
            variant={style === "ieee" ? "default" : "outline"}
            onClick={() => setStyle("ieee")}
          >
            IEEE
          </Button>
        </div>
        <Button onClick={() => { setEditRef(null); setDialogOpen(true) }}>
          Tambah Referensi
        </Button>
      </div>

      <Card>
        <CardHeader className="py-3 px-4 border-b border-border">
          <CardTitle className="text-sm font-semibold">Daftar Referensi Bab</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <li key={`ref-skel-${idx}`} className="flex flex-col gap-2.5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-56" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>
                    <div className="flex gap-1.5">
                      <Skeleton className="h-7 w-14 rounded" />
                      <Skeleton className="h-7 w-14 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full rounded-md" />
                </li>
              ))
            ) : references.length === 0 ? (
              <li className="text-muted-foreground px-4 py-8 text-center text-sm">{t("references.empty")}</li>
            ) : (
              references.map((reference, idx) => (
                <li key={reference.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm truncate">{reference.title}</span>
                      <Badge variant={reference.type === "link" ? "secondary" : "outline"}>
                        {reference.type === "link" ? t("references.typeLink") : t("references.typeFile")}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {reference.type === "file" && reference.file_name ? (
                        <a
                          href={referenceDownloadUrl(thesisId, chapter.id, reference.id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="sm">{t("references.download")}</Button>
                        </a>
                      ) : reference.url ? (
                        <a href={reference.url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm">{t("references.open")}</Button>
                        </a>
                      ) : null}
                      <Button variant="ghost" size="sm" onClick={() => { setEditRef(reference); setDialogOpen(true) }}>
                        {t("references.edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => void handleDelete(reference)}
                      >
                        {t("references.delete")}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-md bg-muted/50 p-2 text-xs flex items-center justify-between gap-2">
                    <span className="text-foreground select-all">
                      {style === "ieee" ? `[${idx + 1}] ` : ""}{formatCitation(reference, style)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0"
                      onClick={() => handleCopy(
                        style === "ieee" ? `[${idx + 1}] ${formatCitation(reference, style)}` : formatCitation(reference, style),
                        "Sitasi"
                      )}
                    >
                      <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="size-3.5" />
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <ReferenceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reference={editRef}
        onSubmit={() => {
          setDialogOpen(false)
          void load()
        }}
        thesisId={thesisId}
        chapterId={chapter.id}
      />
    </div>
  )
}

function ReferenceDialog({
  open,
  onOpenChange,
  reference,
  onSubmit,
  thesisId,
  chapterId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  reference: Reference | null
  onSubmit: () => void
  thesisId: number
  chapterId: number
}) {
  const { t } = useTranslation("thesis")
  const isEdit = !!reference
  const initialType = reference?.type ?? "link"

  const handleSubmit = useFormSubmit<{
    type: string
    title: string
    authors?: string
    year?: string
    publication?: string
    volume?: string
    pages?: string
    doi?: string
    url?: string
    file?: File
  }>(async (values) => {
    if (isEdit) {
      await updateReference(thesisId, chapterId, reference.id, values)
    } else if (values.type === "file") {
      await createFileReference(thesisId, chapterId, values.title, values.file as File, values)
    } else {
      await createLinkReference(thesisId, chapterId, values)
    }
    toast.add({ title: t("references.toast.saved"), type: "success" })
    onSubmit()
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[88vh] h-auto flex flex-col p-0 gap-0 overflow-hidden">
        {/* Sticky Header */}
        <DialogHeader className="border-b bg-muted/20 px-6 py-4 pr-14 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold leading-tight text-foreground truncate">
                {isEdit ? t("references.edit") : "Tambah Referensi Rujukan"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kelengkapi sitasi pustaka untuk format APA/IEEE dan integrasi sintesis AI pada bab ini.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Form Body */}
        <Form
          onSubmit={handleSubmit}
          defaultValues={{
            type: initialType,
            title: reference?.title ?? "",
            authors: reference?.authors ?? "",
            year: reference?.year ?? "",
            publication: reference?.publication ?? "",
            volume: reference?.volume ?? "",
            pages: reference?.pages ?? "",
            doi: reference?.doi ?? "",
            url: reference?.url ?? "",
          }}
          className="flex flex-col flex-1 min-h-0 overflow-hidden gap-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <TypeAwareFields isEdit={isEdit} />
          </div>

          {/* Sticky Footer */}
          <DialogFooter className="border-t bg-muted/20 px-6 py-3.5 shrink-0 flex flex-row items-center justify-end gap-2.5 m-0 rounded-none">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t("thesis.cancel")}
            </Button>
            <Button type="submit">
              {isEdit ? "Perbarui Referensi" : t("thesis.save")}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function TypeAwareFields({ isEdit }: { isEdit: boolean }) {
  const { t } = useTranslation("thesis")
  const form = useFormField()
  const type = useWatch({ control: form.control, name: "type" }) as "link" | "file" | undefined

  return (
    <div className="space-y-4">
      {!isEdit && (
        <SelectField
          name="type"
          label="Tipe Sumber Referensi"
          description="Pilih jenis sumber: tautan/URL daring atau berkas dokumen lokal."
          placeholder="Pilih tipe sumber"
          options={[
            { label: `${t("references.typeLink")} (URL / Jurnal Online)`, value: "link" },
            { label: `${t("references.typeFile")} (PDF / Dokumen)`, value: "file" },
          ]}
        />
      )}

      {/* Identitas Dokumen */}
      <div className="space-y-3 pt-1">
        <TextField
          name="title"
          label="Judul Publikasi / Artikel / Dokumen"
          placeholder="Contoh: Analisis Penerapan Arsitektur Microservices pada Sistem E-Commerce"
          description="Tulis judul lengkap karya rujukan."
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <TextField
              name="authors"
              label="Penulis"
              placeholder="Contoh: Pratama, A. & Wijaya, B."
              description="Format: Nama Belakang, Inisial"
            />
          </div>
          <div className="sm:col-span-1">
            <TextField
              name="year"
              label="Tahun Terbit"
              placeholder="Contoh: 2024"
              description="Tahun 4 digit"
            />
          </div>
        </div>
      </div>

      {/* Detail Publikasi */}
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3.5 space-y-3">
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Detail Penerbitan & Halaman
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField
            name="publication"
            label="Jurnal / Penerbit"
            placeholder="Contoh: Jurnal TI"
          />
          <TextField
            name="volume"
            label="Volume / Edisi"
            placeholder="Contoh: Vol. 12 No. 3"
          />
          <TextField
            name="pages"
            label="Halaman"
            placeholder="Contoh: 45-58"
          />
        </div>
      </div>

      {/* Akses & Pengenal */}
      <div className="space-y-3">
        <TextField
          name="doi"
          label="DOI (Digital Object Identifier)"
          placeholder="Contoh: 10.1145/3372278.3390678"
          description="Kode DOI resmi (opsional, untuk penelusuran sitasi)"
        />

        {type === "file" ? (
          <FileField
            name="file"
            label="Unggah Berkas Naskah"
            accept=".pdf,.doc,.docx"
            hint="Unggah berkas PDF/DOCX (maksimal 10MB)"
            required={!isEdit}
          />
        ) : (
          <TextField
            name="url"
            label="Tautan Sumber (URL)"
            placeholder="https://journal.example.org/article/view/123"
            description="Tautan langsung ke naskah publikasi daring"
          />
        )}
      </div>
    </div>
  )
}
