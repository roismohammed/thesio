import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function LandingHeader() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isIntegrationsPage = location.pathname === "/integrations"

  useEffect(() => {
    let ticking = false
    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY
          setIsScrolled((prev) => {
            if (!prev && currentY > 50) return true
            if (prev && currentY < 20) return false
            return prev
          })
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function handleSectionNav(sectionId: string) {
    setMobileMenuOpen(false)
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`)
      setTimeout(() => {
        const el = document.getElementById(sectionId)
        if (el) {
          el.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    } else {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[padding,background-color,border-color,backdrop-filter] duration-300 ease-out border-b ${
        isScrolled
          ? "py-2 sm:py-2.5 px-4 sm:px-6 lg:px-8 bg-background/85 backdrop-blur-md border-border/80 shadow-none"
          : "pt-3 sm:pt-4 pb-0 px-4 sm:px-6 lg:px-8 bg-transparent border-transparent"
      }`}
    >
      <div
        className={`mx-auto transition-[max-width,padding,height,border-radius,background-color,border-color] duration-300 ease-out flex items-center justify-between ${
          isScrolled
            ? "max-w-[1200px] px-2 sm:px-4 h-12 sm:h-13 rounded-none border-0 bg-transparent"
            : "max-w-[1140px] px-4 sm:px-6 h-14 rounded-full border border-border/70 bg-card/85 dark:bg-card/75 backdrop-blur-md"
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="/logo/thesio.png"
            alt="Thesio"
            className="size-7 rounded-md object-contain"
          />
          <span className="font-heading font-semibold text-base tracking-tight text-foreground">
            Thesio
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-medium text-muted-foreground">
          <button
            type="button"
            onClick={() => handleSectionNav("cara-kerja")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Cara Kerja
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav("fitur")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Fitur
          </button>
          <Link
            to="/integrations"
            className={`px-2.5 py-1 rounded-full transition-all ${
              isIntegrationsPage
                ? "bg-muted/80 text-foreground font-semibold border border-border/70"
                : "hover:text-foreground"
            }`}
          >
            Integrasi
          </Link>
          <button
            type="button"
            onClick={() => handleSectionNav("keunggulan")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Keunggulan
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav("harga")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Biaya
          </button>
          <button
            type="button"
            onClick={() => handleSectionNav("faq")}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* CTA & Controls (Desktop & Mobile trigger) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <Button
                render={<Link to="/dashboard" />}
                size="sm"
                className="text-xs h-8 px-3.5 font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
              >
                Buka Dasbor
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link to="/login" />}
                  className="text-xs h-8 px-3 font-medium text-muted-foreground hover:text-foreground"
                >
                  {t("auth.login.title", "Masuk")}
                </Button>
                <Button
                  size="sm"
                  render={<Link to="/register" />}
                  className="text-xs h-8 px-3.5 font-medium bg-foreground text-background hover:bg-foreground/90 rounded-full"
                >
                  {t("auth.register.title", "Mulai Gratis")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden size-8 text-foreground"
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden mt-2 mx-4 sm:mx-6 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl p-5 space-y-4 shadow-none"
          >
            <nav className="flex flex-col space-y-3 text-xs font-medium text-muted-foreground">
              <button
                type="button"
                onClick={() => handleSectionNav("cara-kerja")}
                className="py-1.5 text-left hover:text-foreground transition-colors border-b border-border/40 cursor-pointer"
              >
                Cara Kerja
              </button>
              <button
                type="button"
                onClick={() => handleSectionNav("fitur")}
                className="py-1.5 text-left hover:text-foreground transition-colors border-b border-border/40 cursor-pointer"
              >
                Fitur
              </button>
              <Link
                to="/integrations"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-1.5 transition-colors border-b border-border/40 flex items-center justify-between ${
                  isIntegrationsPage
                    ? "text-foreground font-semibold"
                    : "hover:text-foreground"
                }`}
              >
                <span>Integrasi</span>
                {isIntegrationsPage && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </Link>
              <button
                type="button"
                onClick={() => handleSectionNav("keunggulan")}
                className="py-1.5 text-left hover:text-foreground transition-colors border-b border-border/40 cursor-pointer"
              >
                Keunggulan
              </button>
              <button
                type="button"
                onClick={() => handleSectionNav("harga")}
                className="py-1.5 text-left hover:text-foreground transition-colors border-b border-border/40 cursor-pointer"
              >
                Biaya & Paket
              </button>
              <button
                type="button"
                onClick={() => handleSectionNav("faq")}
                className="py-1.5 text-left hover:text-foreground transition-colors cursor-pointer"
              >
                Tanya Jawab (FAQ)
              </button>
            </nav>

            <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
              {user ? (
                <Button
                  render={<Link to="/dashboard" />}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-xs h-9 font-medium bg-foreground text-background"
                >
                  Buka Dasbor Mahasiswa
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    render={<Link to="/login" />}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-xs h-9 font-medium border-border/80"
                  >
                    {t("auth.login.title", "Masuk ke Akun")}
                  </Button>
                  <Button
                    render={<Link to="/register" />}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-xs h-9 font-medium bg-foreground text-background"
                  >
                    {t("auth.register.title", "Daftar Gratis Sekarang")}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
