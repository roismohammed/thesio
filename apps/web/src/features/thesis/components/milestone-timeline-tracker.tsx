import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Flag01Icon,
} from "@hugeicons/core-free-icons"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/toast"
import { listMilestones, updateMilestone } from "@/features/thesis/api/thesis"
import type { Milestone } from "@/features/thesis/types"
import { ApiError, getCachedApi } from "@/lib/api"

interface MilestoneTimelineTrackerProps {
  thesisId: number
  defenseDeadlineAt?: string | null
}

export function MilestoneTimelineTracker({
  thesisId,
  defenseDeadlineAt,
}: MilestoneTimelineTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    return getCachedApi<{ data: Milestone[] }>(`/api/thesis/${thesisId}/milestones`)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: Milestone[] }>(`/api/thesis/${thesisId}/milestones`)
  })

  const load = async () => {
    try {
      const res = await listMilestones(thesisId)
      setMilestones(res.data)
    } catch {
      setMilestones([])
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    void load()
  }, [thesisId])

  // Hitung sisa hari menuju deadline sidang
  const remainingDays = defenseDeadlineAt
    ? Math.ceil(
        (new Date(defenseDeadlineAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null

  const handleToggleStatus = async (item: Milestone) => {
    const nextStatus =
      item.status === "completed"
        ? "pending"
        : item.status === "pending"
          ? "in_progress"
          : "completed"

    try {
      await updateMilestone(thesisId, item.id, { status: nextStatus })
      toast.add({ title: "Status tahapan diperbarui.", type: "success" })
      void load()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : "Gagal memperbarui tahapan.",
        type: "error",
      })
    }
  }

  if (loading && milestones.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-44" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border/70 p-3 flex flex-col justify-between gap-2.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Target Sidang Countdown Card */}
      {defenseDeadlineAt ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Target Sidang Skripsi</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5" />
                  {new Date(defenseDeadlineAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {remainingDays !== null ? (
                remainingDays > 0 ? (
                  <Badge variant="default" className="text-xs py-1 px-3">
                    {remainingDays} Hari Tersisa Menuju Sidang
                  </Badge>
                ) : remainingDays === 0 ? (
                  <Badge variant="destructive" className="text-xs py-1 px-3 animate-pulse">
                    Hari Sidang Skripsi!
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs py-1 px-3">
                    Target terlewati ({Math.abs(remainingDays)} hari lalu)
                  </Badge>
                )
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Roadmap Tahapan Skripsi */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <HugeiconsIcon icon={Flag01Icon} strokeWidth={2} className="size-4" />
            Roadmap & Tahapan Skripsi
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {milestones.map((m, idx) => {
              const isDone = m.status === "completed"
              const isProgress = m.status === "in_progress"

              return (
                <div
                  key={m.id}
                  onClick={() => void handleToggleStatus(m)}
                  className={`cursor-pointer rounded-lg border p-3 flex flex-col justify-between gap-2 transition-colors ${
                    isDone
                      ? "border-green-500/30 bg-green-500/5 text-foreground"
                      : isProgress
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Tahap 0{idx + 1}</span>
                    {isDone ? (
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Badge variant={isProgress ? "default" : "outline"} className="text-[10px] h-5">
                        {isProgress ? "Proses" : "Belum"}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground leading-snug">
                    {m.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Klik untuk ubah status
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
