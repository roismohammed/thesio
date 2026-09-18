import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/datatable/data-table"
import { toast } from "@/components/ui/toast"
import type { ColumnDef } from "@tanstack/react-table"
import {
  listVersions,
  revertVersion,
  versionDownloadUrl,
} from "@/features/thesis/api/thesis"
import type { Chapter, ChapterVersion } from "@/features/thesis/types"
import { ApiError, getCachedApi } from "@/lib/api"

interface VersionsTabProps {
  thesisId: number
  chapter: Chapter
}

export function VersionsTab({ thesisId, chapter }: VersionsTabProps) {
  const { t } = useTranslation("thesis")
  const cacheKey = `/api/thesis/${thesisId}/chapters/${chapter.id}/versions`
  const [versions, setVersions] = useState<ChapterVersion[]>(() => {
    return getCachedApi<{ data: ChapterVersion[] }>(cacheKey)?.data ?? []
  })
  const [loading, setLoading] = useState(() => {
    return !getCachedApi<{ data: ChapterVersion[] }>(cacheKey)
  })

  const load = useCallback(async () => {
    try {
      const payload = await listVersions(thesisId, chapter.id)
      setVersions(payload.data)
    } catch {
      setVersions([])
    } finally {
      setLoading(false)
    }
  }, [thesisId, chapter.id])

  useEffect(() => {
    void load()
  }, [load])

  async function handleRevert(version: ChapterVersion) {
    if (!window.confirm(t("versions.revertConfirm"))) {
      return
    }
    try {
      await revertVersion(thesisId, chapter.id, version.id)
      toast.add({ title: t("thesis.toast.saved"), type: "success" })
      void load()
    } catch (err) {
      toast.add({ title: err instanceof ApiError ? err.message : t("versions.revertConfirm"), type: "error" })
    }
  }

  const columns: ColumnDef<ChapterVersion>[] = [
    {
      accessorKey: "version_number",
      header: t("versions.versionNumber"),
      cell: ({ row }) => <span className="font-medium">{row.original.version_number}</span>,
    },
    {
      accessorKey: "source",
      header: t("versions.source"),
      cell: ({ row }) => (
        <Badge variant={row.original.source === "upload" ? "secondary" : "outline"}>
          {row.original.source === "upload" ? t("versions.sourceUpload") : t("versions.sourceParaphrase")}
        </Badge>
      ),
    },
    {
      accessorKey: "conversion_status",
      header: t("versions.status"),
      cell: ({ row }) => {
        const status = row.original.conversion_status
        return (
          <Badge
            variant={status === "succeeded" ? "default" : status === "failed" ? "destructive" : "outline"}
          >
            {status === "succeeded"
              ? t("versions.statusSucceeded")
              : status === "failed"
                ? t("versions.statusFailed")
                : t("versions.statusPending")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: t("versions.created"),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("thesis.actions"),
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.original_file_name ? (
            <a
              href={versionDownloadUrl(thesisId, chapter.id, row.original.id)}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="sm">{t("versions.download")}</Button>
            </a>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            disabled={row.original.id === chapter.current_version_id}
            onClick={() => void handleRevert(row.original)}
          >
            {t("versions.revert")}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={versions}
      loading={loading}
      emptyText={t("versions.empty")}
    />
  )
}
