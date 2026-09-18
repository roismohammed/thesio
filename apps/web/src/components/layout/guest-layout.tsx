import { Outlet, Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

/**
 * Layout untuk route group `(guest)` — halaman autentikasi publik
 * (login, register, lupa sandi). Flat & clean menggunakan struktur InsetCard terpusat.
 */
export function GuestLayout() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="relative min-h-svh bg-background text-foreground flex flex-col justify-between overflow-x-hidden selection:bg-primary/15 selection:text-primary">
      {/* Guest Minimal Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo/thesio.png"
            alt="Thesio"
            className="size-7 rounded-md object-contain"
          />
          <span className="font-heading font-bold text-base tracking-tight">Thesio</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Ganti tema"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="w-full flex-1 flex items-center justify-center p-4 sm:p-6">
        <Outlet />
      </main>

      {/* Guest Minimal Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Thesio. Platform skripsi terstruktur mandiri.</p>
      </footer>
    </div>
  )
}
