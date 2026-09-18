import { useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AppLayout } from "@/components/layout/app-layout"
import { toast } from "@/components/ui/toast"
import type { Chapter, Task, TaskStatus } from "@/features/thesis/types"
import { useKanbanTasks } from "@/features/thesis/hooks/use-kanban-tasks"
import { useKanbanShortcuts } from "@/features/thesis/hooks/use-kanban-shortcuts"
import { useTaskSuggestions } from "@/features/thesis/hooks/use-task-suggestions"
import { useThesisDetail } from "@/features/thesis/hooks/use-thesis"
import { BoardToolbar } from "./partials/board-toolbar"
import { TaskBoard } from "./partials/task-board"
import { BoardEmptyState } from "./partials/board-empty-state"
import { SuggestionPanel } from "./partials/suggestion-panel"
import { ShortcutHelpPopover } from "./partials/shortcut-help-popover"
import { TaskFormDialog } from "./partials/task-form-dialog"
import type { TaskFormValues } from "./partials/task-form"

/**
 * Kanban tasks page — the thesis task board. Composes the toolbar, the
 * 3-column DnD board, the empty state, and the create/edit dialog.
 */
export function KanbanTasksPage() {
  const { t } = useTranslation("thesis")
  const { thesisId } = useParams<{ thesisId: string }>()
  const id = Number(thesisId)

  const { thesis, chapters, loading: thesisLoading } = useThesisDetail(id)
  const { tasks, error, load, addTask, updateTask, removeTask, move } = useKanbanTasks(id)
  const {
    suggestions,
    loading: suggestionsLoading,
    generating,
    error: suggestionsError,
    generate,
    accept: acceptSuggestion,
    reject: rejectSuggestion,
  } = useTaskSuggestions(id)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Task | null>(null)
  const [filter, setFilter] = useState<"all" | "late" | "soon">("all")
  const [sortBy, setSortBy] = useState<"priority" | "due_at">("priority")

  const [helpOpen, setHelpOpen] = useState(false)
  const filterRef = useRef<HTMLButtonElement | null>(null)

  useKanbanShortcuts({
    onNew: openCreate,
    onFocusFilter: () => filterRef.current?.focus(),
    onAskSuggestion: () => void handleAskSuggestion(),
    onHelp: () => setHelpOpen(true),
  })

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  async function handleAskSuggestion() {
    const ok = await generate()
    toast.add({
      title: ok ? t("kanban.toast.suggestionGenerated") : t("kanban.toast.suggestionError"),
      type: ok ? "success" : "error",
    })
    if (ok) {
      await load()
    }
  }

  async function handleAcceptSuggestion(suggestionId: number) {
    const task = await acceptSuggestion(suggestionId)
    toast.add({
      title: task ? t("kanban.toast.suggestionAccepted") : t("kanban.toast.error"),
      type: task ? "success" : "error",
    })
    if (task) {
      await load()
    }
  }

  async function handleRejectSuggestion(suggestionId: number) {
    const ok = await rejectSuggestion(suggestionId)
    toast.add({
      title: ok ? t("kanban.toast.suggestionRejected") : t("kanban.toast.error"),
      type: ok ? "success" : "error",
    })
  }

  function openEdit(task: Task) {
    setEditTarget(task)
    setDialogOpen(true)
  }

  async function handleSubmit(values: TaskFormValues) {
    const body = {
      title: values.title,
      description: values.description || null,
      due_at: values.due_at || null,
      chapter_id: values.chapter_id ? Number(values.chapter_id) : null,
      supervision_note_id: values.supervision_note_id ? Number(values.supervision_note_id) : null,
    }

    const ok = editTarget
      ? await updateTask(editTarget.id, { ...body, status: editTarget.status })
      : await addTask(body)

    if (ok) {
      toast.add({
        title: editTarget ? t("kanban.toast.updated") : t("kanban.toast.created"),
        type: "success",
      })
      setDialogOpen(false)
    } else {
      toast.add({ title: t("kanban.toast.error"), type: "error" })
    }
  }

  async function handleDelete(taskId: number) {
    const ok = await removeTask(taskId)
    toast.add({
      title: ok ? t("kanban.toast.deleted") : t("kanban.toast.error"),
      type: ok ? "success" : "error",
    })
  }

  async function handleMove(taskId: number, status: TaskStatus) {
    const ok = await move(taskId, status, 0)
    toast.add({
      title: ok ? t("kanban.toast.moved") : t("kanban.toast.error"),
      type: ok ? "success" : "error",
    })
  }

  async function handleDragEnd(taskId: number, status: TaskStatus, position: number) {
    const ok = await move(taskId, status, position)
    if (!ok) {
      toast.add({ title: t("kanban.toast.error"), type: "error" })
    }
  }

  const visibleTasks = useMemo(() => {
    let list = [...tasks]
    if (filter === "late") {
      list = list.filter((task) => task.urgency === "late")
    } else if (filter === "soon") {
      list = list.filter((task) => task.urgency === "soon")
    }
    if (sortBy === "due_at") {
      list.sort((a, b) => (a.due_at ?? "").localeCompare(b.due_at ?? ""))
    } else {
      list.sort((a, b) => a.priority - b.priority)
    }
    return list
  }, [tasks, filter, sortBy])

  return (
    <AppLayout
      pageTitle={t("kanban.title")}
      breadcrumb={[
        { title: t("thesis.title"), url: "/thesis" },
        { title: thesis?.title ?? "…", url: `/thesis/${thesisId}` },
        { title: t("kanban.breadcrumb") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <BoardToolbar
          filter={filter}
          sortBy={sortBy}
          onFilterChange={setFilter}
          onSortChange={setSortBy}
          onNewTask={openCreate}
          onAskSuggestion={() => void handleAskSuggestion()}
          suggestionsLoading={generating}
          shortcutHelp={
            <ShortcutHelpPopover open={helpOpen} onOpenChange={setHelpOpen} />
          }
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {suggestionsError ? <p className="text-destructive text-sm">{suggestionsError}</p> : null}

        {suggestions.length > 0 || generating || suggestionsLoading ? (
          <SuggestionPanel
            suggestions={suggestions}
            loading={suggestionsLoading}
            generating={generating}
            onAccept={(suggestionId) => void handleAcceptSuggestion(suggestionId)}
            onReject={(suggestionId) => void handleRejectSuggestion(suggestionId)}
          />
        ) : null}

        {!thesisLoading && visibleTasks.length === 0 ? <BoardEmptyState /> : null}

        {visibleTasks.length > 0 ? (
          <TaskBoard
            tasks={visibleTasks}
            onEdit={openEdit}
            onDelete={(taskId) => void handleDelete(taskId)}
            onMove={(taskId, status) => void handleMove(taskId, status)}
            onDragEnd={(taskId, status, position) => void handleDragEnd(taskId, status, position)}
          />
        ) : null}

        <TaskFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={editTarget}
          chapters={chapters as Chapter[]}
          onSubmit={(values) => void handleSubmit(values)}
        />
      </div>
    </AppLayout>
  )
}