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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { api, ApiError, getCachedApi } from "@/lib/api"

export interface PlanPermission {
  id: number
  name: string
}

export interface AdminPlan {
  id: number
  name: string
  description: string | null
  price: number
  is_active: boolean
  permissions: PlanPermission[]
}

export function AdminPlansPage() {
  const { t } = useTranslation()
  const cachedPlans = getCachedApi<{ data: AdminPlan[] }>("/api/admin/plans")
  const [plans, setPlans] = useState<AdminPlan[]>(() => cachedPlans?.data ?? [])
  const [loading, setLoading] = useState(() => !cachedPlans)
  const [availablePermissions, setAvailablePermissions] = useState<PlanPermission[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdminPlan | null>(null)

  const load = useCallback(async () => {
    try {
      const payload = await api<{ data: AdminPlan[] }>("/api/admin/plans")
      setPlans(payload.data)
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal memuat paket",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    void api<{ data: PlanPermission[] }>("/api/admin/permissions")
      .then((p) => setAvailablePermissions(p.data))
      .catch(() => undefined)
  }, [])

  async function handleDelete(plan: AdminPlan) {
    if (!confirm(`Hapus paket "${plan.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    try {
      await api(`/api/admin/plans/${plan.id}`, { method: "DELETE" })
      toast.add({ title: "Paket berhasil dihapus", type: "success" })
      void load()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menghapus paket",
        type: "error",
      })
    }
  }

  return (
    <AppLayout
      pageTitle="Kelola Paket Langganan"
      breadcrumb={[
        { title: t("breadcrumb.dashboard"), url: "/" },
        { title: t("breadcrumb.admin"), url: "/admin" },
        { title: "Kelola Paket" },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Kelola Paket Langganan
            </h1>
            <p className="text-muted-foreground text-sm">
              Atur daftar paket, harga, status aktif, dan hak akses menu per paket.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null)
              setDialogOpen(true)
            }}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            Tambah Paket
          </Button>
        </div>

        <InsetCard className="p-1.5">
          <InsetCardHeader className="px-2 pt-1 pb-2">
            <InsetCardTitle>Daftar Paket Langganan</InsetCardTitle>
          </InsetCardHeader>

          <InsetCardContent className="p-0 overflow-hidden gap-0 bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Paket</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hak Akses Menu</TableHead>
                    <TableHead className="text-right">{t("admin.common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && plans.length === 0 ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell className="py-3"><Skeleton className="h-4 w-36" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="py-3"><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell className="py-3 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : plans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Belum ada paket langganan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div className="font-medium">{plan.name}</div>
                          {plan.description && (
                            <div className="text-xs text-muted-foreground max-w-sm line-clamp-1">
                              {plan.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          Rp {plan.price.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          {plan.is_active ? (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Nonaktif</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex max-w-md flex-wrap gap-1">
                            {plan.permissions.length === 0 ? (
                              <span className="text-muted-foreground text-xs">
                                Tidak ada menu khusus
                              </span>
                            ) : (
                              plan.permissions.map((perm) => (
                                <Badge key={perm.id} variant="secondary">
                                  {perm.name}
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
                                    setEditing(plan)
                                    setDialogOpen(true)
                                  }}
                                >
                                  <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} className="size-4" />
                                  Ubah Paket
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() => void handleDelete(plan)}
                                >
                                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                                  Hapus Paket
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

      <PlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={editing}
        availablePermissions={availablePermissions}
        onSaved={() => {
          setDialogOpen(false)
          void load()
        }}
      />
    </AppLayout>
  )
}

interface PlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: AdminPlan | null
  availablePermissions: PlanPermission[]
  onSaved: () => void
}

function PlanDialog({
  open,
  onOpenChange,
  plan,
  availablePermissions,
  onSaved,
}: PlanDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(plan?.name ?? "")
  const [description, setDescription] = useState(plan?.description ?? "")
  const [price, setPrice] = useState(plan?.price ? String(plan.price) : "0")
  const [isActive, setIsActive] = useState(plan?.is_active ?? true)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    plan?.permissions.map((p) => p.id) ?? []
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(plan?.name ?? "")
    setDescription(plan?.description ?? "")
    setPrice(plan?.price !== undefined ? String(plan.price) : "0")
    setIsActive(plan?.is_active ?? true)
    setSelectedPermissions(plan?.permissions.map((p) => p.id) ?? [])
  }, [plan, open])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await api(`/api/admin/plans${plan ? `/${plan.id}` : ""}`, {
        method: plan ? "PATCH" : "POST",
        body: {
          name,
          description: description || null,
          price: parseInt(price, 10) || 0,
          is_active: isActive,
          permission_ids: selectedPermissions,
        },
      })
      toast.add({
        title: plan ? "Paket berhasil diperbarui" : "Paket berhasil dibuat",
        type: "success",
      })
      onSaved()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal menyimpan paket",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {plan ? `Ubah Paket: ${plan.name}` : "Tambah Paket Langganan Baru"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plan-name">Nama Paket</Label>
            <Input
              id="plan-name"
              placeholder="Contoh: Pro, Ultimate"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan-desc">Deskripsi</Label>
            <Textarea
              id="plan-desc"
              placeholder="Ringkasan fasilitas paket..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plan-price">Harga (Rp)</Label>
            <Input
              id="plan-price"
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="plan-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="plan-active" className="cursor-pointer">
              Paket Aktif (dapat dibeli dan dipakai trial)
            </Label>
          </div>

          <div className="grid gap-2">
            <Label>Hak Akses Menu Mahasiswa</Label>
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto rounded-md border p-2 text-sm bg-background">
              {availablePermissions.length === 0 ? (
                <span className="text-xs text-muted-foreground">Belum ada daftar permission.</span>
              ) : (
                availablePermissions.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={(e) => {
                        setSelectedPermissions((prev) =>
                          e.target.checked ? [...prev, perm.id] : prev.filter((id) => id !== perm.id)
                        )
                      }}
                      className="size-4 rounded border-input"
                    />
                    <span>{perm.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("admin.common.cancel")}
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting || !name}>
            {submitting ? "Menyimpan..." : t("admin.common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
