import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  Invoice02Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
  UserBlock01Icon,
  UserCheck01Icon,
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
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Input } from "@/components/ui/input"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/toast"
import { api, ApiError, getCachedApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

import type { AdminUser, PaginationMeta } from "./types"
import { UserDialog } from "./partials/user-dialog"
import { SuspendDialog } from "./partials/suspend-dialog"
import { UserSubscriptionDialog } from "./partials/user-subscription-dialog"

export function AdminUsersPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()
  const cachedUsers = getCachedApi<{ data: AdminUser[]; meta: PaginationMeta }>("/api/admin/monitoring/users?page=1")
  const [users, setUsers] = useState<AdminUser[]>(() => cachedUsers?.data ?? [])
  const [meta, setMeta] = useState<PaginationMeta>(() => cachedUsers?.meta ?? { current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(() => !cachedUsers)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roles, setRoles] = useState<string[]>([])

  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null)
  const [suspendMode, setSuspendMode] = useState<"suspend" | "unsuspend">("suspend")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [subscriptionUser, setSubscriptionUser] = useState<AdminUser | null>(null)

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set("search", search)
    if (statusFilter) params.set("status", statusFilter)
    const url = `/api/admin/monitoring/users?${params}`

    const cached = getCachedApi<{ data: AdminUser[]; meta: PaginationMeta }>(url)
    if (cached) {
      setUsers(cached.data)
      setMeta(cached.meta)
      setLoading(false)
    }

    try {
      const payload = await api<{ data: AdminUser[]; meta: PaginationMeta }>(url)
      setUsers(payload.data)
      setMeta(payload.meta)
    } catch {
      if (!cached) setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void api<{ data: { name: string }[] }>("/api/admin/roles")
      .then((p) => setRoles(p.data.map((r) => r.name)))
      .catch(() => undefined)
  }, [])

  async function handleDeleteConfirm() {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await api(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" })
      toast.add({ title: t("admin.users.toast.deleted"), type: "success" })
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      void load()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : t("admin.common.error"),
        type: "error",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppLayout
      pageTitle={t("admin.users.title")}
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: t("breadcrumb.admin"), url: "/admin" },
        { title: t("admin.users.title") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{t("admin.users.title")}</h1>
            <p className="text-muted-foreground text-sm">
              Pantau seluruh mahasiswa, paket langganan aktif, dan riwayat transaksi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="w-64"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
            >
              <option value="">Semua Status Paket</option>
              <option value="active">Langganan Aktif</option>
              <option value="no_active">Tidak Ada Paket Aktif</option>
            </select>
            <Button
              onClick={() => {
                setEditingUser(null)
                setUserDialogOpen(true)
              }}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
              {t("admin.users.create")}
            </Button>
          </div>
        </div>

        <InsetCard className="p-1.5">
          <InsetCardHeader className="px-2 pt-1 pb-2">
            <InsetCardTitle>Daftar Mahasiswa & Langganan</InsetCardTitle>
          </InsetCardHeader>

          <InsetCardContent className="p-0 overflow-hidden gap-0 bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.users.name")}</TableHead>
                    <TableHead>{t("admin.users.email")}</TableHead>
                    <TableHead>Paket Aktif</TableHead>
                    <TableHead>{t("admin.users.status")}</TableHead>
                    <TableHead className="text-right">{t("admin.common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && users.length === 0 ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell className="py-3"><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-44" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="py-3 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {t("admin.common.empty")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.active_subscription ? (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="default" className="bg-emerald-600">
                                {user.active_subscription.plan?.name ?? "Paket Aktif"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                ({user.active_subscription.type === "trial" ? "Trial" : "Berbayar"})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Tidak Ada</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.is_disabled ? (
                            user.disabled_reason ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger render={<span className="inline-flex cursor-help" />}>
                                    <Badge variant="destructive">
                                      {t("admin.users.disabled")}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">{user.disabled_reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <Badge variant="destructive">{t("admin.users.disabled")}</Badge>
                            )
                          ) : (
                            <Badge variant="outline">{t("admin.users.active")}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
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
                                  setSubscriptionUser(user)
                                  setSubscriptionDialogOpen(true)
                                }}
                              >
                                <HugeiconsIcon icon={Invoice02Icon} strokeWidth={2} className="size-4" />
                                Detail Langganan & Bayar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingUser(user)
                                  setUserDialogOpen(true)
                                }}
                              >
                                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4" />
                                {t("admin.common.edit")}
                              </DropdownMenuItem>

                              {user.is_disabled ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setTargetUser(user)
                                    setSuspendMode("unsuspend")
                                    setSuspendDialogOpen(true)
                                  }}
                                >
                                  <HugeiconsIcon icon={UserCheck01Icon} strokeWidth={2} className="size-4" />
                                  Aktifkan Kembali
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  disabled={currentUser?.id === user.id}
                                  onClick={() => {
                                    setTargetUser(user)
                                    setSuspendMode("suspend")
                                    setSuspendDialogOpen(true)
                                  }}
                                >
                                  <HugeiconsIcon icon={UserBlock01Icon} strokeWidth={2} className="size-4" />
                                  Nonaktifkan
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                disabled={currentUser?.id === user.id}
                                onClick={() => {
                                  setUserToDelete(user)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                                {t("admin.common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {meta.last_page > 1 ? (
              <div className="flex items-center justify-between border-t p-3">
                <span className="text-muted-foreground text-sm">
                  {t("admin.common.pageOf", { page: meta.current_page, last: meta.last_page })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    {t("admin.common.prev")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.last_page}
                    onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                  >
                    {t("admin.common.next")}
                  </Button>
                </div>
              </div>
            ) : null}
          </InsetCardContent>
        </InsetCard>
      </div>

      <UserDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        user={editingUser}
        roles={roles}
        onSaved={() => {
          setUserDialogOpen(false)
          void load()
        }}
      />

      <SuspendDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        user={targetUser}
        mode={suspendMode}
        onSaved={() => {
          setSuspendDialogOpen(false)
          setTargetUser(null)
          void load()
        }}
      />

      <UserSubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        user={subscriptionUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun{" "}
              <strong>{userToDelete?.name}</strong> ({userToDelete?.email})? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleDeleteConfirm()}
              disabled={deleting}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
