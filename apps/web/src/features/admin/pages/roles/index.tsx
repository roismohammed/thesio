import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

interface AdminRole {
  id: number
  name: string
  guard_name: string
  permissions: string[]
}

export function AdminRolesPage() {
  const { t } = useTranslation()
  const cachedRoles = getCachedApi<{ data: AdminRole[] }>("/api/admin/roles")
  const [roles, setRoles] = useState<AdminRole[]>(() => cachedRoles?.data ?? [])
  const [loading, setLoading] = useState(() => !cachedRoles)
  const [permissions, setPermissions] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminRole | null>(null)

  const load = useCallback(async () => {
    try {
      const payload = await api<{ data: AdminRole[] }>("/api/admin/roles")
      setRoles(payload.data)
    } catch {
      setRoles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void api<{ data: { name: string }[] }>("/api/admin/permissions")
      .then((p) => setPermissions(p.data.map((r) => r.name)))
      .catch(() => undefined)
  }, [])

  async function handleDelete(role: AdminRole) {
    try {
      await api(`/api/admin/roles/${role.id}`, { method: "DELETE" })
      toast.add({ title: t("admin.roles.toast.deleted"), type: "success" })
      void load()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("admin.common.error"), type: "error" })
    }
  }

  return (
    <AppLayout
      pageTitle={t("admin.roles.title")}
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: t("breadcrumb.admin"), url: "/admin" },
        { title: t("admin.roles.title") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t("admin.roles.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("admin.roles.description")}</p>
          </div>
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            {t("admin.roles.create")}
          </Button>
        </div>

        <InsetCard className="p-1.5">
          <InsetCardHeader className="px-2 pt-1 pb-2">
            <InsetCardTitle>Daftar Peran & Hak Akses</InsetCardTitle>
          </InsetCardHeader>

          <InsetCardContent className="p-0 overflow-hidden gap-0 bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.roles.name")}</TableHead>
                    <TableHead>{t("admin.roles.permissions")}</TableHead>
                    <TableHead className="text-right">{t("admin.common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && roles.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell className="py-3"><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-60" /></TableCell>
                        <TableCell className="py-3 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        {t("admin.common.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <div className="flex max-w-md flex-wrap gap-1">
                            {role.permissions.length === 0 ? (
                              <span className="text-muted-foreground text-xs">
                                {t("admin.roles.noPermissions")}
                              </span>
                            ) : (
                              role.permissions.map((permission) => (
                                <Badge key={permission} variant="secondary">
                                  {permission}
                                </Badge>
                              ))
                            )}
                          </div>
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
                                  onClick={() => {
                                    setEditing(role)
                                    setDialogOpen(true)
                                  }}
                                >
                                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4" />
                                  {t("admin.common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() => void handleDelete(role)}
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

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editing}
        permissions={permissions}
        onSaved={() => {
          setDialogOpen(false)
          void load()
        }}
      />
    </AppLayout>
  )
}

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: AdminRole | null
  permissions: string[]
  onSaved: () => void
}

function RoleDialog({ open, onOpenChange, role, permissions, onSaved }: RoleDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(role?.name ?? "")
  const [selected, setSelected] = useState<string[]>(role?.permissions ?? [])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(role?.name ?? "")
    setSelected(role?.permissions ?? [])
  }, [role, open])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api(`/api/admin/roles/${role?.id ?? ""}`, {
        method: role ? "PATCH" : "POST",
        body: { name, permissions: selected },
      })
      toast.add({ title: t("admin.roles.toast.saved"), type: "success" })
      onSaved()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("admin.common.error"), type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {role ? t("admin.roles.editTitle") : t("admin.roles.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="role-name">{t("admin.roles.name")}</Label>
            <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>{t("admin.roles.permissions")}</Label>
            <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
              {permissions.map((permission) => (
                <label key={permission} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(permission)}
                    onChange={(e) => {
                      setSelected((prev) =>
                        e.target.checked
                          ? [...prev, permission]
                          : prev.filter((p) => p !== permission),
                      )
                    }}
                  />
                  {permission}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.common.cancel")}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting}>
            {t("admin.common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
