import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TextareaField } from "@/components/forms/textarea-field"
import { TextField } from "@/components/forms/text-field"
import { SelectField } from "@/components/forms/select-field"
import { Form } from "@/components/forms/form"
import { useFormSubmit } from "@/components/forms/use-form-submit"
import { toast } from "@/components/ui/toast"
import type { Chapter } from "@/features/thesis/types"

interface AddPointFormProps {
  chapters: Chapter[]
  onAdd: (body: { title: string; description?: string; chapter_id?: number | null }) => Promise<boolean>
}

interface AddPointValues {
  title: string
  description?: string
  chapter_id?: string
}

/**
 * Custom-point form: title, optional description, optional chapter. Submits
 * through the hook's addPoint and flags the guide as tailored.
 */
export function AddPointForm({ chapters, onAdd }: AddPointFormProps) {
  const { t } = useTranslation("thesis")

  const handleSubmit = useFormSubmit<AddPointValues>(
    async ({ title, description, chapter_id }) => {
      const ok = await onAdd({
        title,
        description: description || undefined,
        chapter_id: chapter_id ? Number(chapter_id) : null,
      })
      if (ok) {
        toast.add({ title: t("guidance.toast.pointAdded"), type: "success" })
      }
    },
  )

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <p className="font-medium">{t("guidance.addPoint")}</p>
        <Form onSubmit={handleSubmit} defaultValues={{ title: "", description: "", chapter_id: "" }} className="gap-4">
          <TextField name="title" label={t("guidance.titleLabel")} required />
          <TextareaField name="description" label={t("guidance.descriptionLabel")} rows={3} />
          <SelectField
            name="chapter_id"
            label={t("guidance.chapterLabel")}
            placeholder={t("guidance.noChapter")}
            options={[
              { label: t("guidance.noChapter"), value: "" },
              ...chapters.map((c) => ({ label: c.title, value: String(c.id) })),
            ]}
          />
          <div className="flex justify-end">
            <Button type="submit">{t("guidance.addPoint")}</Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
}