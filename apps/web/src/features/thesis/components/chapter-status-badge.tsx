import { useTranslation } from "react-i18next"

import { Badge } from "@/components/ui/badge"

export function ChapterStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("thesis")

  const label =
    status === "draft"
      ? t("chapter.statusDraft")
      : status === "submitted"
        ? t("chapter.statusSubmitted")
        : t("chapter.statusReviewed")

  const variant =
    status === "draft" ? "outline" : status === "submitted" ? "secondary" : "default"

  return <Badge variant={variant}>{label}</Badge>
}
