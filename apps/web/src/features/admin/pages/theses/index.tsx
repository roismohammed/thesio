import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import type { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book02Icon,
  EyeIcon,
  Search01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { DataTable } from "@/components/datatable/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api, getCachedApi } from "@/lib/api"
import type { Chapter, Thesis } from "@/features/thesis/types"

interface AdminThesisItem extends Thesis {
  user?: {
    id: number
    name: string
    email: string
  }
}

interface AdminThesisResponse {
  data: AdminThesisItem[]
  total: number
  current_page: number
  last_page: number
}

export function AdminThesesPage() {
  const { t } = useTranslation()
  const cachedData = getCachedApi<AdminThesisResponse>("/api/admin/theses")
  const [data, setData] = useState<AdminThesisItem[]>(() => cachedData?.data ?? [])
  const [loading, setLoading] = useState(() => !cachedData)
  const [search, setSearch] = useState("")
  const [selectedThesis, setSelectedThesis] = useState<AdminThesisItem | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadData = async (query = "") => {
    const url = query
      ? `/api/admin/theses?search=${encodeURIComponent(query)}`
      : `/api/admin/theses`

    const cached = getCachedApi<AdminThesisResponse>(url)
    if (cached) {
      setData(cached.data)
      setLoading(false)
    }

    try {
      const res = await api<AdminThesisResponse>(url)
      setData(res.data)
    } catch {
      if (!cached) setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleOpenDetail = async (item: AdminThesisItem) => {
    setSelectedThesis(item)
    setDetailLoading(true)
    try {
      const res = await api<{ data: AdminThesisItem }>(`/api/admin/theses/${item.id}`)
      setSelectedThesis(res.data)
    } catch {
      // keep current
    } finally {
      setDetailLoading(false)
    }
  }

  const columns: ColumnDef<AdminThesisItem>[] = [
    {
      accessorKey: "title",
      header: "Judul Skripsi",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">{row.original.title}</span>
          <span className="text-xs text-muted-foreground">
            Dibuat pada: {new Date(row.original.created_at).toLocaleDateString("id-ID")}
          </span>
        </div>
      ),
    },
    {
      id: "student",
      header: "Mahasiswa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{row.original.user?.name ?? "—"}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.user?.email ?? ""}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "chapters_count",
      header: "Jumlah Bab",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.chapters_count ?? (row.original.chapters?.length ?? 0)} Bab
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <Badge
            variant={
              s === "completed"
                ? "default"
                : s === "submitted"
                  ? "secondary"
                  : "outline"
            }
            className="capitalize text-xs"
          >
            {s === "in_progress" ? "Dalam Pengerjaan" : s === "submitted" ? "Diajukan" : "Selesai"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleOpenDetail(row.original)}
            className="gap-1.5"
          >
            <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-3.5" />
            Detail Skripsi
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppLayout
      pageTitle={t("nav.adminTheses", "Skripsi Mahasiswa")}
      breadcrumb={[
        { title: t("breadcrumb.admin"), url: "/admin" },
        { title: t("breadcrumb.adminTheses", "Skripsi Mahasiswa") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Daftar Skripsi Seluruh Mahasiswa
            </h1>
            <p className="text-xs text-muted-foreground">
              Akses read-only untuk memantau topik dan progres pengerjaan skripsi mahasiswa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Input
                placeholder="Cari skripsi atau mahasiswa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void loadData(search)
                }}
                className="pr-8"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => void loadData(search)}
              >
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          title="Data Skripsi Mahasiswa"
          columns={columns}
          data={data}
          loading={loading}
          emptyText="Belum ada data skripsi mahasiswa."
        />
      </div>

      {/* Modal Detail Skripsi Read-Only */}
      <Dialog open={!!selectedThesis} onOpenChange={(open) => !open && setSelectedThesis(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-5 text-primary" />
              Detail Data Skripsi
            </DialogTitle>
          </DialogHeader>

          {selectedThesis ? (
            <div className="flex flex-col gap-4 text-sm">
              <div className="rounded-lg border p-3 bg-muted/30 space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Judul Skripsi</span>
                <p className="font-bold text-foreground text-base">{selectedThesis.title}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span>Mahasiswa: <strong>{selectedThesis.user?.name}</strong> ({selectedThesis.user?.email})</span>
                  <span>Status: <Badge variant="outline" className="capitalize text-[10px]">{selectedThesis.status}</Badge></span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Struktur Bab & Dokumen ({selectedThesis.chapters?.length ?? 0} Bab)
                </h4>
                {detailLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-md" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedThesis.chapters?.map((ch: Chapter) => (
                      <div key={ch.id} className="border rounded-md p-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground text-xs">
                            Bab {ch.position ?? "—"}: {ch.title}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            Status: {ch.status} • Versi saat ini: v{ch.current_version?.version_number ?? 1}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          Read-Only
                        </Badge>
                      </div>
                    ))}
                    {(!selectedThesis.chapters || selectedThesis.chapters.length === 0) && (
                      <p className="text-xs text-muted-foreground italic">Belum ada bab yang dibuat.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
