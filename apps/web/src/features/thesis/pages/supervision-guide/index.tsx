import { useState } from "react"
import { useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useSupervisionGuide } from "@/features/thesis/hooks/use-supervision-guide"
import { useThesisDetail } from "@/features/thesis/hooks/use-thesis"
import { GuideHeader } from "@/features/thesis/pages/supervision-guide/partials/guide-header"
import { GuideEmptyState } from "@/features/thesis/pages/supervision-guide/partials/guide-empty-state"
import { GuidancePointItem } from "@/features/thesis/pages/supervision-guide/partials/guidance-point-item"
import { AddPointForm } from "@/features/thesis/pages/supervision-guide/partials/add-point-form"
import { HistoryList } from "@/features/thesis/pages/supervision-guide/partials/history-list"
import { HistoryDetail } from "@/features/thesis/pages/supervision-guide/partials/history-detail"

/**
 * Guidance page — shows the current supervision agenda, tailoring actions,
 * and a browsable history of past agendas.
 */
export function GuidancePage() {
  const { t } = useTranslation("thesis")
  const { thesisId } = useParams<{ thesisId: string }>()
  const id = Number(thesisId)
  const { thesis, chapters, loading: thesisLoading } = useThesisDetail(id)
  const {
    guide,
    history,
    pastGuide,
    loading,
    generating,
    error,
    generate,
    selectPast,
    clearPast,
    addPoint,
    togglePrepared,
    removePoint,
  } = useSupervisionGuide(id)
  const [removeTarget, setRemoveTarget] = useState<number | null>(null)

  async function handleGenerate() {
    const ok = await generate()
    if (ok) {
      toast.add({ title: t("guidance.toast.generated"), type: "success" })
    } else {
      toast.add({ title: error ?? t("guidance.toast.generatedError"), type: "error" })
    }
  }

  async function handleTogglePrepared(pointId: number) {
    const point = guide?.points.find((p) => p.id === pointId)
    if (!point) {
      return
    }
    const ok = await togglePrepared(point)
    if (ok) {
      toast.add({ title: t("guidance.toast.pointUpdated"), type: "success" })
    }
  }

  async function handleRemove() {
    if (removeTarget === null) {
      return
    }
    const ok = await removePoint(removeTarget)
    if (ok) {
      toast.add({ title: t("guidance.toast.pointRemoved"), type: "success" })
    }
    setRemoveTarget(null)
  }

  const deadlineNotSet = thesis !== null && thesis.defense_deadline_at === null
  const hasChapters = (chapters?.length ?? 0) > 0

  return (
    <AppLayout
      pageTitle={t("guidance.title")}
      breadcrumb={[
        { title: t("thesis.title"), url: "/thesis" },
        { title: thesis?.title ?? "…", url: `/thesis/${thesisId}` },
        { title: t("guidance.breadcrumbSupervision") },
        { title: t("guidance.breadcrumbGuide") },
      ]}
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">{t("guidance.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("guidance.subtitle")}</p>

        <GuideHeader
          deadlineRemainingDays={guide?.defense_remaining_days}
          deadlineNotSet={deadlineNotSet}
          isUnread={guide?.is_unread ?? false}
          isTailored={guide?.is_tailored ?? false}
          generating={generating}
          onGenerate={() => void handleGenerate()}
        />

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        {!thesisLoading && !loading ? (
          <GuideEmptyState
            hasChapters={hasChapters}
            deadlineNotSet={deadlineNotSet}
            hasGuide={guide !== null}
            generating={generating}
            onGenerate={() => void handleGenerate()}
          />
        ) : null}

        {guide ? (
          <>
            {guide.is_tailored ? (
              <p className="text-muted-foreground text-sm">{t("guidance.tailoredHint")}</p>
            ) : null}
            {guide.points.length === 0 ? (
              <Card>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{t("guidance.noPoints")}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-2">
                {guide.points.map((point) => (
                  <GuidancePointItem
                    key={point.id}
                    point={point}
                    onTogglePrepared={() => void handleTogglePrepared(point.id)}
                    onRemove={() => setRemoveTarget(point.id)}
                  />
                ))}
              </div>
            )}

            <AddPointForm chapters={chapters ?? []} onAdd={addPoint} />
          </>
        ) : null}

        {pastGuide ? (
          <HistoryDetail
            guide={pastGuide}
            onBack={clearPast}
            onTogglePrepared={() => undefined}
            onRemove={() => undefined}
          />
        ) : (
          <HistoryList history={history} onSelect={(guideId) => void selectPast(guideId)} />
        )}

        {removeTarget !== null ? (
          <ConfirmRemoveDialog
            onCancel={() => setRemoveTarget(null)}
            onConfirm={() => void handleRemove()}
          />
        ) : null}
      </div>
    </AppLayout>
  )
}

function ConfirmRemoveDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useTranslation("thesis")

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm">{t("guidance.removeConfirm")}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t("thesis.cancel")}
            </Button>
            <Button onClick={onConfirm}>{t("guidance.removePoint")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

