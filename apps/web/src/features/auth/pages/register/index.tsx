import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useSeoMeta } from "@/hooks/use-seo-meta"

export function RegisterPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useSeoMeta({
    title: "Buat Akun Gratis — Thesio",
    description: "Daftar akun Thesio untuk mulai menyusun skripsi secara mandiri dan terstruktur.",
    path: "/register",
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError("Konfirmasi kata sandi tidak cocok.")
      return
    }

    setSubmitting(true)

    try {
      await api("/api/auth/register", {
        method: "POST",
        body: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      })
      await signIn(email, password)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : t("auth.login.error.generic", "Gagal mendaftar. Silakan coba kembali."),
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[920px] mx-auto">
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand & Benefits */}
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
                Registrasi
              </Badge>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground leading-snug">
                Mulai Susun Skripsi Anda Hari Ini.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Platform terstruktur mandiri untuk memandu mahasiswa dari perumusan judul hingga siap sidang.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                "Akses gratis editor naskah Bab 1 - 5",
                "Arsip notulen bimbingan & pelacak revisi",
                "Papan kanban tugas & rekomendasi tahapan",
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
            <span>Gratis selamanya tanpa kartu kredit</span>
          </div>
        </div>

        {/* Right Column: Clean Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-card text-left">
          <div className="space-y-5 max-w-sm w-full mx-auto">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Buat Akun Baru
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t("auth.register.subtitle", "Daftar untuk mengelola tugas akhir secara mandiri.")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-foreground">
                  {t("auth.register.nameLabel", "Nama Lengkap")}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Muhammad Rois"
                    className="pl-9 h-10 text-xs sm:text-sm rounded-lg"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  {t("auth.register.emailLabel", "Alamat Email")}
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
                <Label htmlFor="password" className="text-xs font-medium text-foreground">
                  {t("auth.register.passwordLabel", "Kata Sandi")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
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

              <div className="space-y-1.5">
                <Label htmlFor="passwordConfirmation" className="text-xs font-medium text-foreground">
                  {t("auth.register.passwordConfirmLabel", "Ulangi Kata Sandi")}
                </Label>
                <div className="relative">
                  <Input
                    id="passwordConfirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={passwordConfirmation}
                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                    placeholder="Ketik ulang kata sandi"
                    className="pl-9 pr-10 h-10 text-xs sm:text-sm rounded-lg"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                  >
                    {showConfirmPassword ? (
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
                  {submitting ? t("auth.register.registering", "Mendaftar...") : t("auth.register.register", "Daftar Akun")}
                </span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-border/60 space-y-2 text-center text-xs">
            <p className="text-muted-foreground">
              {t("auth.register.haveAccount", "Sudah punya akun?")}{" "}
              <Link to="/login" className="text-foreground font-semibold hover:underline">
                {t("auth.register.signIn", "Masuk di sini")}
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
