import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api"
import { useSeoMeta } from "@/hooks/use-seo-meta"

export function LoginPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useSeoMeta({
    title: "Masuk ke Akun — Thesio",
    description: "Masuk ke ruang kerja Thesio untuk melanjutkan pengerjaan skripsi Anda.",
    path: "/login",
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? "/dashboard", { replace: true })
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : t("auth.login.error.generic", "Email atau kata sandi tidak valid.")
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[920px] mx-auto">
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand & Value Prop */}
        <div className="lg:col-span-5 bg-muted/30 p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-border/60 flex flex-col justify-between text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="/logo/thesio.png"
                  alt="Thesio"
                  className="size-8 rounded-lg object-contain"
                />
                <span className="font-heading font-semibold text-base tracking-tight text-foreground">
                  Thesio
                </span>
              </Link>
              <Badge variant="outline" className="text-[11px] font-mono border-border/80">
                Workspace
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-snug">
                Selesaikan skripsi lebih cepat & terstruktur.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Kelola penulisan bab naskah, notulen bimbingan dosen, dan target kata harian dalam satu alur mandiri.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Editor naskah terstruktur per bab bebas draf hilang",
                "Notulen bimbingan otomatis terkonversi jadi tugas",
                "Pelacak kata harian & estimasi kesiapan sidang",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <div className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary shrink-0" />
            <span>Standar Pedoman Akademik Universitas</span>
          </div>
        </div>

        {/* Right Column: Clean Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-card text-left">
          <div className="space-y-6 max-w-sm w-full mx-auto">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Selamat Datang Kembali
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t("auth.login.subtitle", "Masukkan akun Anda untuk melanjutkan tugas akhir.")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  {t("auth.login.emailLabel", "Alamat Email")}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@kampus.ac.id"
                    className="pl-9 h-10 text-xs sm:text-sm rounded-lg"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    {t("auth.login.passwordLabel", "Kata Sandi")}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t("auth.login.forgotPassword", "Lupa sandi?")}
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10 h-10 text-xs sm:text-sm rounded-lg"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2"
                >
                  <span className="font-bold">•</span>
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-10 rounded-lg text-xs sm:text-sm font-medium gap-2 mt-2"
              >
                <span>
                  {submitting ? t("auth.login.signingIn", "Memproses...") : t("auth.login.signIn", "Masuk ke Akun")}
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 space-y-2 text-center text-xs">
            <p className="text-muted-foreground">
              {t("auth.login.noAccount", "Belum punya akun?")}{" "}
              <Link to="/register" className="text-foreground font-semibold hover:underline">
                {t("auth.login.createAccount", "Daftar gratis")}
              </Link>
            </p>

            <Link
              to="/"
              className="text-[11px] text-muted-foreground hover:text-foreground inline-block transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
