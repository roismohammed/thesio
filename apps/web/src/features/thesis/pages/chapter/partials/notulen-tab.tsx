import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { TextareaField } from "@/components/forms/textarea-field"
import { Form } from "@/components/forms/form"
import { deleteNote, showNote, upsertNote } from "@/features/thesis/api/thesis"
import type { Chapter, SupervisionNote } from "@/features/thesis/types"
import { ApiError, getCachedApi } from "@/lib/api"
import { useFormSubmit } from "@/components/forms/use-form-submit"

interface NotulenTabProps {
  thesisId: number
  chapter: Chapter
}

export function NotulenTab({ thesisId, chapter }: NotulenTabProps) {
  const { t } = useTranslation("thesis")
  const cacheKey = `/api/thesis/${thesisId}/chapters/${chapter.id}/notulen`
  const [note, setNote] = useState<SupervisionNote | null>(() => {
    return getCachedApi<{ data: SupervisionNote }>(cacheKey)?.data ?? null
  })
  const [loaded, setLoaded] = useState(() => {
    return getCachedApi<{ data: SupervisionNote }>(cacheKey) !== undefined
  })

  const load = useCallback(async () => {
    try {
      const payload = await showNote(thesisId, chapter.id)
      setNote(payload.data) // null when no note exists yet
    } catch {
      setNote(null) // genuine error (network/auth) → fall back to empty
    } finally {
      setLoaded(true)
    }
  }, [thesisId, chapter.id])

  useEffect(() => {
    void load()
  }, [load])

  const handleSave = useFormSubmit<{ content: string }>(
    async ({ content }) => {
      await upsertNote(thesisId, chapter.id, content)
      toast.add({ title: t("notulen.toast.saved"), type: "success" })
      void load()
    },
  )

  async function handleDelete() {
    if (!window.confirm(t("notulen.deleteConfirm"))) {
      return
    }
    try {
      await deleteNote(thesisId, chapter.id)
      toast.add({ title: t("notulen.toast.deleted"), type: "success" })
      setNote(null)
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("notulen.toast.deleted"), type: "error" })
    }
  }

  if (!loaded) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-40 w-full rounded-md" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {note ? (
        <div className="flex flex-col gap-4">
          <Form onSubmit={handleSave} defaultValues={{ content: note.content }} className="gap-4">
            <TextareaField name="content" placeholder={t("notulen.placeholder")} rows={8} />
            <div className="flex justify-between">
              <Button variant="ghost" type="button" className="text-destructive" onClick={handleDelete}>
                {t("notulen.delete")}
              </Button>
              <Button type="submit">{t("notulen.save")}</Button>
            </div>
          </Form>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">{t("notulen.empty")}</p>
            <Form onSubmit={handleSave} defaultValues={{ content: "" }} className="gap-4">
              <TextareaField name="content" placeholder={t("notulen.placeholder")} rows={8} />
              <div className="flex justify-end">
                <Button type="submit">{t("notulen.save")}</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}