import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { api, ApiError, getCachedApi } from "@/lib/api"

interface AdminPermission {
  id: number
  name: string
  guard_name: string
}

export function AdminPermissionsPage() {
  const { t } = useTranslation()
  const cachedPermissions = getCachedApi<{ data: AdminPermission[] }>("/api/admin/permissions")
  const [permissions, setPermissions] = useState<AdminPermission[]>(() => cachedPermissions?.data ?? [])
  const [loading, setLoading] = useState(() => !cachedPermissions)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    try {
      const payload = await api<{ data: AdminPermission[] }>("/api/admin/permissions")
      setPermissions(payload.data)
    } catch {
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate() {
    setSubmitting(true)
    try {
      await api("/api/admin/permissions", { method: "POST", body: { name } })
      toast.add({ title: t("admin.permissions.toast.saved"), type: "success" })
      setName("")
      setDialogOpen(false)
      void load()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("admin.common.error"), type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(permission: AdminPermission) {
    try {
      await api(`/api/admin/permissions/${permission.id}`, { method: "DELETE" })
      toast.add({ title: t("admin.permissions.toast.deleted"), type: "success" })
      void load()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("admin.common.error"), type: "error" })
    }
  }

  return (
    <AppLayout
      pageTitle={t("admin.permissions.title")}
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: t("breadcrumb.admin"), url: "/admin" },
        { title: t("admin.permissions.title") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t("admin.permissions.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("admin.permissions.description")}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            {t("admin.permissions.create")}
          </Button>
        </div>

        <InsetCard className="p-1.5">
          <InsetCardHeader className="px-2 pt-1 pb-2">
            <InsetCardTitle>Daftar Izin Sistem</InsetCardTitle>
          </InsetCardHeader>

          <InsetCardContent className="p-0 overflow-hidden gap-0 bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.permissions.name")}</TableHead>
                    <TableHead>{t("admin.permissions.guard")}</TableHead>
                    <TableHead className="text-right">{t("admin.common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && permissions.length === 0 ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell className="py-3"><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="py-3 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : permissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {t("admin.common.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{permission.guard_name}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button variant="ghost" size="icon" className="size-8">
                                    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
                                    <span className="sr-only">{t("admin.common.actions")}</span>
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() => void handleDelete(permission)}
                                >
                                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                                  {t("admin.common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </InsetCardContent>
        </InsetCard>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.permissions.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="permission-name">{t("admin.permissions.name")}</Label>
            <Input
              id="permission-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("admin.permissions.namePlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("admin.common.cancel")}
            </Button>
            <Button onClick={() => void handleCreate()} disabled={submitting}>
              {t("admin.common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}