import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon, Shield02Icon, UserIcon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"
import type { CurrentUser } from "@/lib/auth-context"

interface ProfileIdentityCardProps {
  user: CurrentUser | null
}

export function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US"

  return (
    <div className="flex flex-col gap-5 w-full">
      <InsetCard className="w-full">
        <InsetCardHeader>
          <InsetCardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 text-primary" />
            <span>Kartu Profil Pengguna</span>
          </InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className="flex flex-col items-center text-center p-6 gap-4">
          <div className="relative">
            <Avatar className="size-20 ring-4 ring-primary/10 shadow-sm">
              <AvatarFallback className="text-xl font-bold bg-primary/15 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>

          <div className="space-y-1 w-full">
            <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
              {user?.name ?? "Pengguna Thesio"}
            </h2>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {user?.roles?.map((role) => (
              <Badge key={role} variant="default" className="text-[11px] capitalize">
                {role}
              </Badge>
            ))}
            <Badge variant="outline" className="text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Akun Aktif
            </Badge>
          </div>

          <div className="w-full border-t border-border/60 pt-4 mt-1 flex flex-col gap-2.5 text-xs text-left">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>ID Pengguna:</span>
              <span className="font-mono font-medium text-foreground">#{user?.id ?? 1}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Status Keamanan:</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
                Terlindungi
              </span>
            </div>
          </div>
        </InsetCardContent>
      </InsetCard>

      <InsetCard className="w-full">
        <InsetCardHeader>
          <InsetCardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} className="size-4 text-primary" />
            <span>Hak Akses & Fitur Aktif</span>
          </InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className="p-4 space-y-2">
          <span className="text-xs text-muted-foreground block">
            Izin modul yang diizinkan untuk peran akun ini:
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {user?.permissions && user.permissions.length > 0 ? (
              user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 border border-border/60 text-[11px] font-medium text-foreground"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3 text-emerald-600" />
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Akses standar mahasiswa.</span>
            )}
          </div>
        </InsetCardContent>
      </InsetCard>
    </div>
  )
}
