import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [email, setEmail] = useState(searchParams.get("email") ?? "")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      await api("/api/reset-password", {
        method: "POST",
        body: {
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      })
      setMessage(t("auth.resetPassword.success"))
      navigate("/login", { replace: true })
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("auth.resetPassword.invalidLink"),
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-destructive text-sm">{t("auth.resetPassword.invalidLink")}</p>
        <Button render={<Link to="/forgot-password" />} variant="outline">
          {t("auth.resetPassword.requestNew")}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-2xl font-semibold tracking-tight">Thesio</div>
        <p className="text-muted-foreground text-sm">
          {t("auth.resetPassword.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">{t("auth.resetPassword.emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">{t("auth.resetPassword.newPassword")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="passwordConfirmation">
            {t("auth.resetPassword.confirmPassword")}
          </Label>
          <Input
            id="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />
        </div>

        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="text-muted-foreground text-sm">
            {message}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? t("auth.resetPassword.resetting") : t("auth.resetPassword.reset")}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        <Link to="/login" className="text-foreground font-medium">
          {t("auth.resetPassword.backToLogin")}
        </Link>
      </p>
    </div>
  )
}
