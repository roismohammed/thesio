import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiBrain01Icon,
  Book02Icon,
  Delete02Icon,
  Download02Icon,
  Edit02Icon,
  EyeIcon,
  FolderKanbanIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/datatable/data-table"
import { TextField } from "@/components/forms/text-field"
import { Form } from "@/components/forms/form"
import { useFormSubmit } from "@/components/forms/use-form-submit"
import { toast } from "@/components/ui/toast"
import { ChapterStatusBadge } from "@/features/thesis/components/chapter-status-badge"
import { MilestoneTimelineTracker } from "@/features/thesis/components/milestone-timeline-tracker"
import { DefenseSimulatorDialog } from "@/features/thesis/components/defense-simulator-dialog"
import { useThesisDetail } from "@/features/thesis/hooks/use-thesis"
import { usePermission } from "@/hooks/use-permission"
import {
  createChapter,
  deleteChapter,
  thesisExportDocxUrl,
  thesisExportPdfUrl,
  updateChapter,
} from "@/features/thesis/api/thesis"
import type { Chapter } from "@/features/thesis/types"
import { ApiError } from "@/lib/api"

export function ThesisDetailPage() {
  const { thesisId } = useParams()
  const id = Number(thesisId)
  const { t } = useTranslation("thesis")
  const { thesis, chapters, loading, refresh } = useThesisDetail(id)
  const { hasRole, hasPermission } = usePermission()
  const canAcademic = hasRole("super admin") || hasPermission("access academic tools")
  const canSupervision = hasRole("super admin") || hasPermission("access supervision")
  const canKanban = hasRole("super admin") || hasPermission("access kanban")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [defenseSimulatorOpen, setDefenseSimulatorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Chapter | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    setDeleting(true)
    try {
      await deleteChapter(id, deleteTarget.id)
      toast.add({ title: t("chapter.toast.deleted"), type: "success" })
      void refresh()
      setDeleteTarget(null)
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : t("chapter.toast.error"),
        type: "error",
      })
    } finally {
      setDeleting(false)
    }
  }

  const statusLabel = thesis
    ? thesis.status === "in_progress"
      ? t("thesis.statusInProgress")
      : thesis.status === "submitted"
        ? t("thesis.statusSubmitted")
        : t("thesis.statusCompleted")
    : ""

  const columns: ColumnDef<Chapter>[] = [
    {
      accessorKey: "title",
      header: t("chapter.titleLabel"),
      cell: ({ row }) => (
        <Link
          to={`/thesis/${id}/chapters/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "position",
      header: t("chapter.positionLabel"),
      cell: ({ row }) => (
        <span className="text-muted-foreground tabular-nums">
          {row.original.position ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("thesis.status"),
      cell: ({ row }) => <ChapterStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("thesis.actions")}</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to={`/thesis/${id}/chapters/${row.original.id}`} />}
          >
            <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-3.5" />
            {t("chapter.open")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-7">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
                  <span className="sr-only">{t("thesis.actions")}</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditTarget(row.original)}>
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4" />
                {t("thesis.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => setDeleteTarget(row.original)}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                {t("thesis.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <AppLayout
      pageTitle={thesis?.title ?? t("thesis.title")}
      breadcrumb={[
        { title: t("thesis.title"), url: "/thesis" },
        { title: thesis?.title ?? t("thesis.title") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {loading && !thesis ? (
                <>
                  <Skeleton className="h-7 w-64 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">
                    {thesis?.title ?? ""}
                  </h1>
                  {thesis ? (
                    <Badge variant={thesis.status === "completed" ? "default" : "secondary"}>
                      {statusLabel}
                    </Badge>
                  ) : null}
                </>
              )}
            </div>
            <p className="text-muted-foreground text-sm">Kelola bab, unggah dokumen, atau tulis konten bab skripsi.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canAcademic ? (
              <Button variant="outline" onClick={() => setDefenseSimulatorOpen(true)}>
                <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-4 text-primary" />
                Simulasi Sidang
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="opacity-60"
                onClick={() =>
                  toast.add({
                    title: "Fitur Simulasi Sidang memerlukan paket Ultimate. Silakan upgrade paket Anda.",
                    type: "warning",
                  })
                }
              >
                <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
                Simulasi Sidang (Ultimate)
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline">
                    <HugeiconsIcon icon={Download02Icon} strokeWidth={2} className="size-4" />
                    Export Skripsi
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(thesisExportDocxUrl(id), "_blank")}>
                  Unduh Dokumen (.docx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(thesisExportPdfUrl(id), "_blank")}>
                  Cetak / Unduh PDF (.html)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canSupervision ? (
              <Button variant="outline" nativeButton={false} render={<Link to={`/thesis/${id}/guidance`} />}>
                <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4" />
                {t("guidance.title")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="opacity-60"
                onClick={() =>
                  toast.add({
                    title: "Fitur Bimbingan memerlukan paket Pro atau Ultimate. Silakan upgrade paket Anda.",
                    type: "warning",
                  })
                }
              >
                <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4 text-muted-foreground" />
                {t("guidance.title")} (Pro+)
              </Button>
            )}

            {canKanban ? (
              <Button variant="outline" nativeButton={false} render={<Link to={`/thesis/${id}/tasks`} />}>
                <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} className="size-4" />
                {t("kanban.nav")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="opacity-60"
                onClick={() =>
                  toast.add({
                    title: "Fitur Kanban & Tugas memerlukan paket Pro atau Ultimate. Silakan upgrade paket Anda.",
                    type: "warning",
                  })
                }
              >
                <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} className="size-4 text-muted-foreground" />
                {t("kanban.nav")} (Pro+)
              </Button>
            )}

            <Button onClick={() => setDialogOpen(true)}>
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
              {t("chapter.create")}
            </Button>
          </div>
        </div>

        <MilestoneTimelineTracker thesisId={id} defenseDeadlineAt={thesis?.defense_deadline_at} />

        <DataTable
          title="Daftar Bab Skripsi"
          columns={columns}
          data={chapters}
          loading={loading}
          emptyText={t("chapter.empty")}
        />
      </div>

      <ChapterFormDialog
        thesisId={id}
        open={dialogOpen || !!editTarget}
        initial={editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null)
          }
          setDialogOpen(open)
        }}
        onSaved={() => {
          setDialogOpen(false)
          setEditTarget(null)
          void refresh()
        }}
      />

      <DefenseSimulatorDialog
        thesisId={id}
        open={defenseSimulatorOpen}
        onOpenChange={setDefenseSimulatorOpen}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("chapter.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  {t("chapter.deleteConfirm")}{" "}
                  <span className="font-semibold text-foreground">
                    “{deleteTarget.title}”
                  </span>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t("thesis.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? t("chapter.deleting") : t("thesis.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

interface ChapterFormValues {
  title: string
  position?: string
}

function ChapterFormDialog({
  thesisId,
  open,
  initial,
  onOpenChange,
  onSaved,
}: {
  thesisId: number
  open: boolean
  initial: Chapter | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const { t } = useTranslation("thesis")
  const isEdit = !!initial

  const handleSubmit = useFormSubmit<ChapterFormValues>(
    async ({ title, position }) => {
      const pos = position ? Number(position) : undefined
      if (initial) {
        await updateChapter(thesisId, initial.id, {
          title,
          position: pos ?? null,
        })
      } else {
        await createChapter(thesisId, { title, position: pos })
      }
      onSaved()
    },
    { successMessage: t("chapter.toast.saved") },
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("chapter.editTitle") : t("chapter.createTitle")}</DialogTitle>
        </DialogHeader>
        <Form
          key={initial?.id ?? "new"}
          onSubmit={handleSubmit}
          defaultValues={{
            title: initial?.title ?? "",
            position: initial?.position ? String(initial.position) : "",
          }}
          className="gap-4"
        >
          <TextField name="title" label={t("chapter.titleLabel")} required />
          <TextField
            name="position"
            label={t("chapter.positionLabel")}
            placeholder={t("chapter.positionLabel")}
            type="number"
            min={1}
          />
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t("thesis.cancel")}
            </Button>
            <Button type="submit">{t("thesis.save")}</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}