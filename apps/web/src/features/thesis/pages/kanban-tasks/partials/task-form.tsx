import { useTranslation } from "react-i18next"

import { Form } from "@/components/forms/form"
import { SelectField } from "@/components/forms/select-field"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import type { Chapter, Task } from "@/features/thesis/types"

export interface TaskFormValues {
  title: string
  description?: string
  due_at?: string
  chapter_id?: string
  supervision_note_id?: string
}

interface TaskFormProps {
  task: Task | null
  chapters: Chapter[]
  onSubmit: (values: TaskFormValues) => void
  children: React.ReactNode
}

/**
 * Create/edit task form — title, description, optional manual due date
 * (flips the task to manual deadline mode), chapter + note links. Wired into
 * the page's form dialog; the dialog supplies the action row as children.
 */
export function TaskForm({ task, chapters, onSubmit, children }: TaskFormProps) {
  const { t } = useTranslation("thesis")

  return (
    <Form
      onSubmit={onSubmit}
      defaultValues={{
        title: task?.title ?? "",
        description: task?.description ?? "",
        due_at: task?.due_at ? task.due_at.slice(0, 10) : "",
        chapter_id: task?.chapter_id ? String(task.chapter_id) : "",
        supervision_note_id: task?.supervision_note_id ? String(task.supervision_note_id) : "",
      }}
    >
      <TextField name="title" label={t("kanban.titleLabel")} required />
      <TextareaField name="description" label={t("kanban.descriptionLabel")} rows={3} />
      <TextField name="due_at" label={t("kanban.dueAtLabel")} type="date" />
      <SelectField
        name="chapter_id"
        label={t("kanban.chapterLabel")}
        placeholder={t("kanban.noChapterLabel")}
        options={[
          { label: t("kanban.noChapterLabel"), value: "" },
          ...chapters.map((c) => ({ label: c.title, value: String(c.id) })),
        ]}
      />
      <SelectField
        name="supervision_note_id"
        label={t("kanban.notulenLabel")}
        placeholder={t("kanban.noNotulenLabel")}
        options={[
          { label: t("kanban.noNotulenLabel"), value: "" },
          ...chapters
            .filter((c) => c.supervision_note)
            .map((c) => ({ label: c.title, value: String(c.supervision_note!.id) })),
        ]}
      />
      {children}
    </Form>
  )
}