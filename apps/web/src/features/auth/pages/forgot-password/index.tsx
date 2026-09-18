import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setSubmitting(true)

    try {
      const payload = await api<{ message: string }>("/api/forgot-password", {
        method: "POST",
        body: { email },
      })
      setMessage(payload.message)
    } catch {
      setMessage(t("auth.forgotPassword.neutral"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-2xl font-semibold tracking-tight">Thesio</div>
        <p className="text-muted-foreground text-sm">
          {t("auth.forgotPassword.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@contoh.com"
          />
        </div>

        {message ? (
          <p role="status" className="text-muted-foreground text-sm">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting}>
          {submitting
            ? t("auth.forgotPassword.sending")
            : t("auth.forgotPassword.send")}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link to="/login" className="text-foreground font-medium">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </p>
    </div>
  )
}
