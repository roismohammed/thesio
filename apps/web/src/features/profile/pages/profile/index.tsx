import { useState } from "react"
import { useTranslation } from "react-i18next"
import { HugeiconsIcon } from "@hugeicons/react"
import { Key01Icon, Mail01Icon, SecurityCheckIcon } from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/toast"
import { ProfileIdentityCard } from "@/features/profile/pages/profile/partials/profile-identity-card"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

interface Profile {
  id: number
  name: string
  email: string
}

export function ProfilePage() {
  const { t } = useTranslation()
  const { user, refresh } = useAuth()

  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProfileSubmitting(true)
    try {
      await api<{ data: Profile }>("/api/profile", {
        method: "PATCH",
        body: { name, email },
      })
      toast.add({ title: t("profile.toast.profileSaved", "Profil berhasil diperbarui"), type: "success" })
      await refresh()
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : t("profile.toast.error", "Gagal memperbarui profil"),
        type: "error",
      })
    } finally {
      setProfileSubmitting(false)
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordSubmitting(true)
    try {
      await api("/api/profile/password", {
        method: "PATCH",
        body: {
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        },
      })
      toast.add({
        title: t("profile.toast.passwordSaved", "Kata sandi berhasil diubah"),
        type: "success",
      })
      setCurrentPassword("")
      setPassword("")
      setPasswordConfirmation("")
    } catch (err) {
      toast.add({
        title: err instanceof ApiError ? err.message : t("profile.toast.error", "Gagal mengubah kata sandi"),
        type: "error",
      })
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <AppLayout
      pageTitle={t("profile.title", "Profil Pengguna")}
      breadcrumb={[
        { title: t("breadcrumb.dashboard", "Dasbor"), url: "/" },
        { title: t("profile.title", "Profil") },
      ]}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Header Title */}
        <div className="space-y-1 border-b border-border/60 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Pengaturan Akun & Profil
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Kelola identitas akun Anda, perbarui informasi profil, serta jaga keamanan akun Thesio.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* Left Column: User Profile Hero Card */}
          <div className="lg:col-span-4 w-full">
            <ProfileIdentityCard user={user} />
          </div>

          {/* Right Column: Forms & Settings */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            {/* 1. Edit Profile Form */}
            <InsetCard className="w-full">
              <InsetCardHeader>
                <InsetCardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4 text-primary" />
                  <span>Informasi Akun & Kontak</span>
                </InsetCardTitle>
              </InsetCardHeader>
              <InsetCardContent className="p-5">
                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="profile-name" className="text-xs font-semibold text-foreground">
                      {t("profile.name", "Nama Lengkap")}
                    </Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="profile-email" className="text-xs font-semibold text-foreground">
                      {t("profile.email", "Alamat Email")}
                    </Label>
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={profileSubmitting} size="sm" className="font-semibold text-xs">
                      {profileSubmitting ? "Menyimpan…" : t("profile.save", "Simpan Perubahan")}
                    </Button>
                  </div>
                </form>
              </InsetCardContent>
            </InsetCard>

            {/* 2. Change Password Form */}
            <InsetCard className="w-full">
              <InsetCardHeader>
                <InsetCardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Key01Icon} strokeWidth={2} className="size-4 text-primary" />
                  <span>Keamanan & Kata Sandi</span>
                </InsetCardTitle>
              </InsetCardHeader>
              <InsetCardContent className="p-5">
                <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="current-password" className="text-xs font-semibold text-foreground">
                      {t("profile.currentPassword", "Kata Sandi Saat Ini")}
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
                        {t("profile.newPassword", "Kata Sandi Baru")}
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="text-xs h-9"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
                        {t("profile.confirmPassword", "Konfirmasi Kata Sandi")}
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="text-xs h-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} className="size-3.5 text-primary" />
                      Gunakan kombinasi huruf, angka, dan simbol.
                    </span>
                    <Button type="submit" disabled={passwordSubmitting} size="sm" className="font-semibold text-xs">
                      {passwordSubmitting ? "Memproses…" : t("profile.savePassword", "Perbarui Kata Sandi")}
                    </Button>
                  </div>
                </form>
              </InsetCardContent>
            </InsetCard>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
