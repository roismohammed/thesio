import { useTranslation } from "react-i18next"

export function MotivationalQuote({ quote }: { quote: string }) {
  const { t } = useTranslation()

  return (
    <div className="border-y border-border py-4 text-center">
      <p className="mx-auto max-w-[34ch] text-base font-normal leading-snug text-foreground/90 [text-wrap:balance]">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {t("common:page.dashboard.quoteSig")}
      </p>
    </div>
  )
}