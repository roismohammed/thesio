import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft02Icon,
  Book02Icon,
  FolderKanbanIcon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { usePermission } from "@/hooks/use-permission"
import { useChapterDetail, useThesisDetail } from "@/features/thesis/hooks/use-thesis"
import { ChapterStatusBadge } from "@/features/thesis/components/chapter-status-badge"
import { ContentTab } from "@/features/thesis/pages/chapter/partials/content-tab"
import { VersionsTab } from "@/features/thesis/pages/chapter/partials/versions-tab"
import { ReferencesTab } from "@/features/thesis/pages/chapter/partials/references-tab"
import { NotulenTab } from "@/features/thesis/pages/chapter/partials/notulen-tab"

export function ChapterPage() {
  const { t } = useTranslation("thesis")
  const { thesisId, chapterId } = useParams<{ thesisId: string; chapterId: string }>()
  const parsedThesisId = Number(thesisId)
  const parsedChapterId = Number(chapterId)

  const { thesis, loading: thesisLoading } = useThesisDetail(parsedThesisId)
  const { chapter, loading: chapterLoading, refresh } = useChapterDetail(parsedThesisId, parsedChapterId)
  const { hasRole, hasPermission } = usePermission()
  const canSupervision = hasRole("super admin") || hasPermission("access supervision")
  const canKanban = hasRole("super admin") || hasPermission("access kanban")

  const [tab, setTab] = useState("content")

  const isInitialLoading = chapterLoading && !chapter

  return (
    <AppLayout
      pageTitle={chapter?.title ?? t("chapter.title")}
      breadcrumb={[
        { title: t("thesis.title"), url: "/thesis" },
        { title: thesis?.title ?? "…", url: `/thesis/${thesisId}` },
        { title: chapter?.title ?? t("chapter.title") },
      ]}
    >
      <div className="flex flex-col gap-5">
        {/* Header Title & Nav Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 -ml-2 text-muted-foreground hover:text-foreground"
                nativeButton={false}
                render={<Link to={`/thesis/${parsedThesisId}`} />}
                title="Kembali ke Daftar Bab"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-4" />
              </Button>
              {isInitialLoading ? (
                <>
                  <Skeleton className="h-7 w-52 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">{chapter?.title ?? ""}</h1>
                  {chapter ? <ChapterStatusBadge status={chapter.status} /> : null}
                </>
              )}
            </div>
            <div className="pl-7">
              {thesisLoading && !thesis ? (
                <Skeleton className="h-3.5 w-60 rounded" />
              ) : (
                <p className="text-muted-foreground text-xs">
                  {thesis?.title ? `Skripsi: ${thesis.title}` : "Kelola naskah bab, versi revisi, referensi, dan notulen bimbingan."}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canSupervision ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link to={`/thesis/${parsedThesisId}/guidance`} />}
              >
                <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-3.5 mr-1" />
                {t("guidance.title")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-60"
                onClick={() =>
                  toast.add({
                    title: "Fitur Bimbingan memerlukan paket Pro atau Ultimate. Silakan upgrade paket Anda.",
                    type: "warning",
                  })
                }
              >
                <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-3.5 mr-1 text-muted-foreground" />
                {t("guidance.title")} (Pro+)
              </Button>
            )}

            {canKanban ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link to={`/thesis/${parsedThesisId}/tasks`} />}
              >
                <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} className="size-3.5 mr-1" />
                {t("kanban.nav")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="opacity-60"
                onClick={() =>
                  toast.add({
                    title: "Fitur Kanban & Tugas memerlukan paket Pro atau Ultimate. Silakan upgrade paket Anda.",
                    type: "warning",
                  })
                }
              >
                <HugeiconsIcon icon={FolderKanbanIcon} strokeWidth={2} className="size-3.5 mr-1 text-muted-foreground" />
                {t("kanban.nav")} (Pro+)
              </Button>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={(val) => val && setTab(String(val))}>
          <TabsList>
            <TabsTrigger value="content">{t("chapter.tabs.content")}</TabsTrigger>
            <TabsTrigger value="versions">{t("chapter.tabs.versions")}</TabsTrigger>
            <TabsTrigger value="references">{t("chapter.tabs.references")}</TabsTrigger>
            <TabsTrigger value="notulen">{t("chapter.tabs.notulen")}</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-4">
            {isInitialLoading ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-36 rounded-md" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="h-8 w-28 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </div>
                <Card>
                  <CardContent className="min-h-64 p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                    <div className="pt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : chapter ? (
              <ContentTab thesisId={parsedThesisId} chapter={chapter} refresh={refresh} />
            ) : null}
          </TabsContent>
          <TabsContent value="versions" className="mt-4">
            {isInitialLoading ? (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-28 w-full rounded-md" />
                </CardContent>
              </Card>
            ) : chapter ? (
              <VersionsTab thesisId={parsedThesisId} chapter={chapter} />
            ) : null}
          </TabsContent>
          <TabsContent value="references" className="mt-4">
            {isInitialLoading ? (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-28 w-full rounded-md" />
                </CardContent>
              </Card>
            ) : chapter ? (
              <ReferencesTab thesisId={parsedThesisId} chapter={chapter} />
            ) : null}
          </TabsContent>
          <TabsContent value="notulen" className="mt-4">
            {isInitialLoading ? (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-32 w-full rounded-md" />
                </CardContent>
              </Card>
            ) : chapter ? (
              <NotulenTab thesisId={parsedThesisId} chapter={chapter} />
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
