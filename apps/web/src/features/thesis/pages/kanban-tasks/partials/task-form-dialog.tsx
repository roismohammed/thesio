import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskForm } from "./task-form"
import type { TaskFormValues } from "./task-form"
import type { Chapter, Task } from "@/features/thesis/types"

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  chapters: Chapter[]
  onSubmit: (values: TaskFormValues) => void
}

/**
 * Modal wrapper for the create/edit task form (5 fields — modal allowed per
 * constitution V). Triggered from the toolbar and the card popover.
 */
export function TaskFormDialog({ open, onOpenChange, task, chapters, onSubmit }: TaskFormDialogProps) {
  const { t } = useTranslation("thesis")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? t("kanban.edit") : t("kanban.newTask")}</DialogTitle>
        </DialogHeader>
        <TaskForm task={task} chapters={chapters} onSubmit={onSubmit}>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t("thesis.cancel")}
            </Button>
            <Button type="submit">{t("thesis.save")}</Button>
          </DialogFooter>
        </TaskForm>
      </DialogContent>
    </Dialog>
  )
}