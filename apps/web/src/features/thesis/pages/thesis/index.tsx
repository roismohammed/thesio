import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  EyeIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { DataTable } from "@/components/datatable/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { TextField } from "@/components/forms/text-field"
import { Form } from "@/components/forms/form"
import { toast } from "@/components/ui/toast"
import { useThesis } from "@/features/thesis/hooks/use-thesis"
import { createThesis, deleteThesis, updateThesis } from "@/features/thesis/api/thesis"
import type { Thesis } from "@/features/thesis/types"
import { ApiError } from "@/lib/api"
import { useFormSubmit } from "@/components/forms/use-form-submit"

export function ThesisPage() {
  const { t } = useTranslation("thesis")
  const { theses, loading, refresh } = useThesis()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Thesis | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Thesis | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) {
      return
    }
    setDeleting(true)
    try {
      await deleteThesis(deleteTarget.id)
      toast.add({ title: t("thesis.toast.deleted"), type: "success" })
      void refresh()
      setDeleteTarget(null)
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("thesis.toast.saved"), type: "error" })
    } finally {
      setDeleting(false)
    }
  }

  const columns: ColumnDef<Thesis>[] = [
    {
      accessorKey: "title",
      header: t("thesis.titleLabel"),
      cell: ({ row }) => (
        <Link to={`/thesis/${row.original.id}`} className="font-medium hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "status",
      header: t("thesis.status"),
      cell: ({ row }) => {
        const status = row.original.status
        const label =
          status === "in_progress"
            ? t("thesis.statusInProgress")
            : status === "submitted"
              ? t("thesis.statusSubmitted")
              : t("thesis.statusCompleted")
        return <Badge variant={status === "completed" ? "default" : "secondary"}>{label}</Badge>
      },
    },
    {
      accessorKey: "chapters_count",
      header: t("thesis.chaptersCount"),
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.chapters_count ?? 0}</span>,
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
            render={<Link to={`/thesis/${row.original.id}`} />}
          >
            <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-3.5" />
            {t("thesis.open")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
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
      pageTitle={t("thesis.title")}
      breadcrumb={[{ title: t("thesis.title") }]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t("thesis.title")}</h1>
            <p className="text-muted-foreground text-sm">Daftar skripsi dan progres pengerjaan Anda.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            {t("thesis.create")}
          </Button>
        </div>

        <DataTable
          title="Daftar Skripsi"
          columns={columns}
          data={theses}
          loading={loading}
          emptyText={t("thesis.empty")}
        />
      </div>

      <ThesisFormDialog
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("thesis.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? (
                <>
                  {t("thesis.deleteConfirm")}{" "}
                  <span className="font-semibold text-foreground">“{deleteTarget.title}”</span>
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
              {deleting ? t("thesis.deleting") : t("thesis.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}

function ThesisFormDialog({
  open,
  initial,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  initial: Thesis | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const { t } = useTranslation("thesis")
  const isEdit = !!initial

  const handleSubmit = useFormSubmit<{ title: string }>(
    async ({ title }) => {
      if (initial) {
        await updateThesis(initial.id, { title })
      } else {
        await createThesis({ title })
      }
      onSaved()
    },
    { successMessage: t("thesis.toast.saved") },
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("thesis.editTitle") : t("thesis.createTitle")}</DialogTitle>
        </DialogHeader>
        <Form
          key={initial?.id ?? "new"}
          onSubmit={handleSubmit}
          defaultValues={{ title: initial?.title ?? "" }}
          className="gap-4"
        >
          <TextField name="title" label={t("thesis.titleLabel")} required />
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
