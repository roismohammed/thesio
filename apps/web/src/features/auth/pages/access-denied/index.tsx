import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AccessDeniedPage() {
  const { t } = useTranslation()

  return (
    <div className="bg-background text-foreground flex min-h-svh items-center justify-center p-4 md:p-6">
      <Card className="gap-0 w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("auth.accessDenied.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {t("auth.accessDenied.description")}
          </p>
          <Button render={<Link to="/" />}>
            {t("auth.accessDenied.backHome")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
