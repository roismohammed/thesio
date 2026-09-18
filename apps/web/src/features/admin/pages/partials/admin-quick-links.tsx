import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Book02Icon,
  Invoice02Icon,
  Key01Icon,
  Shield02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"

const links = [
  {
    title: "Skripsi Mahasiswa",
    description: "Pantau progres bab & proposal seluruh skripsi",
    to: "/admin/theses",
    icon: Book02Icon,
  },
  {
    title: "Paket Langganan",
    description: "Kelola harga, kuota, dan fitur tiap paket",
    to: "/admin/plans",
    icon: Invoice02Icon,
  },
  {
    title: "Data Pengguna",
    description: "Kelola akun pengguna, status, dan data mahasiswa",
    to: "/admin/users",
    icon: UserGroupIcon,
  },
  {
    title: "Peran Pengguna",
    description: "Kelola role & hierarki akses dalam sistem",
    to: "/admin/roles",
    icon: Shield02Icon,
  },
  {
    title: "Hak Izin Sistem",
    description: "Konfigurasi izin granular tiap modul aplikasi",
    to: "/admin/permissions",
    icon: Key01Icon,
  },
]

export function AdminQuickLinks() {
  return (
    <InsetCard>
      <InsetCardHeader className="flex items-center justify-between pb-1.5">
        <InsetCardTitle>Navigasi Cepat Administrasi</InsetCardTitle>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
          Modul Platform
        </span>
      </InsetCardHeader>
      <InsetCardContent className="gap-2.5 p-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group flex items-start gap-2.5 rounded-lg border border-border bg-card p-2.5 transition-transform duration-100 hover:border-border/80 active:scale-[0.98]"
            >
              <div className="flex size-7 flex-none items-center justify-center rounded-md bg-muted text-foreground transition-colors group-hover:text-primary">
                <HugeiconsIcon icon={link.icon} size={15} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                  <span className="truncate text-[13px]">{link.title}</span>
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    size={13}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </div>
                <p className="line-clamp-2 mt-0.5 text-xs text-muted-foreground">
                  {link.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </InsetCardContent>
    </InsetCard>
  )
}
