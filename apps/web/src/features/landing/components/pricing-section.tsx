import { Link } from "react-router-dom"
import { ArrowRight, Check, Sparkles, GraduationCap } from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: string
  period: string
  ctaText: string
  ctaHref: string
  isFeatured?: boolean
  badge?: string
  includedLabel: string
  features: string[]
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "gratis",
    name: "Gratis",
    description: "Cocok untuk mahasiswa tahap awal judul & perumusan proposal",
    price: "Rp 0",
    period: "/ selamanya",
    ctaText: "Mulai Gratis",
    ctaHref: "/register",
    includedLabel: "Fitur yang Termasuk:",
    features: [
      "Editor naskah Bab 1 - 5 dasar",
      "5 Notulen bimbingan tersimpan",
      "Papan kanban tugas skripsi",
      "Panduan struktur naskah standar",
    ],
  },
  {
    id: "semester",
    name: "Pejuang Skripsi",
    description: "Ideal untuk pengerjaan aktif bab inti hingga persiapan sempro",
    price: "Rp 29.000",
    period: "/ bulan",
    ctaText: "Mulai Berlangganan",
    ctaHref: "/register",
    includedLabel: "Fitur yang Termasuk:",
    features: [
      "Semua fitur di paket Gratis",
      "Notulen bimbingan tanpa batas",
      "Anotasi naskah & pelacak revisi dosen",
      "Metrik target kata harian",
    ],
  },
  {
    id: "lulus",
    name: "Sekali Bayar (Lulus)",
    description: "Akses penuh tanpa batas waktu hingga naskah disidangkan dan wisuda",
    price: "Rp 149.000",
    period: "/ sekali bayar",
    ctaText: "Dapatkan Akses Penuh",
    ctaHref: "/register",
    isFeatured: true,
    badge: "Paling Populer",
    includedLabel: "Fitur yang Termasuk:",
    features: [
      "Semua fitur Pejuang Skripsi",
      "Akses penuh tanpa batasan durasi",
      "Ekspor dokumen Word (.docx) & PDF",
      "Rekomendasi tugas berbasis tahapan",
      "Prioritas bantuan teknis skripsi",
    ],
  },
]

export function PricingHeader() {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      {/* Pill Badge (Harmonized with Cara Kerja & Fitur) */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
      >
        <Sparkles className="size-3 text-primary" />
        <span>Paket & Biaya</span>
      </motion.div>

      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-tight"
      >
        Paket Terjangkau untuk Setiap Tahapan Skripsi
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed text-balance"
      >
        Dari perumusan judul hingga persiapan sidang kelulusan, pilih paket yang tepat untuk kelancaran tugas akhir Anda.
      </motion.p>
    </div>
  )
}

export function PricingFeature({ text, isDark }: { text: string; isDark?: boolean }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <div
        className={`size-4 rounded-full flex items-center justify-center shrink-0 ${
          isDark
            ? "bg-primary/20 text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Check className="size-2.5 stroke-[3]" />
      </div>
      <span className={isDark ? "text-foreground" : "text-muted-foreground"}>
        {text}
      </span>
    </li>
  )
}

export function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const isScale = plan.isFeatured

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: 0.2 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isScale
          ? "border-primary/50 bg-card shadow-sm"
          : "border-border/70 bg-card hover:border-border"
      }`}
    >
      {/* Top Header Portion */}
      {isScale ? (
        <div className="p-6 sm:p-7 bg-primary text-primary-foreground relative overflow-hidden border-b border-primary/20">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-base sm:text-lg text-primary-foreground">
                {plan.name}
              </h3>
              {plan.badge && (
                <Badge className="text-[10px] font-medium bg-background text-foreground border-border px-2 py-0.5 rounded-full">
                  {plan.badge}
                </Badge>
              )}
            </div>

            <p className="text-xs text-primary-foreground/80 min-h-[36px] leading-relaxed">
              {plan.description}
            </p>

            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground font-mono">
                {plan.price}
              </span>
              <span className="text-xs text-primary-foreground/80">
                {plan.period}
              </span>
            </div>

            <Button
              render={<Link to={plan.ctaHref} />}
              size="sm"
              className="w-full text-xs font-semibold h-9 rounded-lg bg-background text-foreground hover:bg-background/90 transition-colors gap-2 mt-2"
            >
              <span>{plan.ctaText}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base sm:text-lg text-foreground">
              {plan.name}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground min-h-[36px] leading-relaxed">
            {plan.description}
          </p>

          <div className="pt-1 flex items-baseline gap-1.5">
            <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
              {plan.price}
            </span>
            <span className="text-xs text-muted-foreground">
              {plan.period}
            </span>
          </div>

          <Button
            render={<Link to={plan.ctaHref} />}
            size="sm"
            className="w-full text-xs font-medium h-9 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors gap-2 mt-2"
          >
            <span>{plan.ctaText}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Feature Area */}
      <div className="p-6 sm:p-7 space-y-3 flex-1 bg-card">
        <p className="text-xs font-semibold text-foreground">
          {plan.includedLabel}
        </p>
        <ul className="space-y-2.5">
          {plan.features.map((feat) => (
            <PricingFeature key={feat} text={feat} />
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

export function EnterpriseCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8 rounded-xl border border-border/70 bg-muted/20 p-5 sm:p-7 lg:p-8 relative overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        {/* Left Side: Label, Heading, Text, CTA */}
        <div className="lg:col-span-7 space-y-3.5 text-left z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/70 bg-card text-[11px] font-medium text-foreground">
            <GraduationCap className="size-3 text-primary" />
            <span>Fakultas & Laboratorium Riset</span>
          </span>

          <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground leading-snug text-balance">
            Solusi Terpadu untuk Kelompok Riset & Program Studi
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
            Fasilitasi mahasiswa bimbingan dengan lisensi kolektif, penyesuaian template naskah universitas, dan pendampingan teknis.
          </p>

          <div className="pt-1">
            <Button
              render={<Link to="/register" />}
              size="sm"
              className="text-xs font-medium h-9 px-5 rounded-lg bg-foreground text-background hover:bg-foreground/90 gap-2"
            >
              <span>Konsultasi Program</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Right Side: Workspace Status Card */}
        <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-lg border border-border/70 bg-card p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-border/60">
              <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                <GraduationCap className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground leading-tight">
                  Lisensi Kampus & Lab Riset
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Format universitas & bantuan prioritas
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40 text-[11px]">
                <span className="text-muted-foreground">Template Khusus Kampus:</span>
                <span className="font-mono text-primary font-medium flex items-center gap-1">
                  <Check className="size-3 stroke-[3]" /> Terintegrasi
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40 text-[11px]">
                <span className="text-muted-foreground">Akses Mahasiswa Kolektif:</span>
                <span className="font-mono font-medium text-foreground">Tanpa Batas</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/40 text-[11px]">
                <span className="text-muted-foreground">Bimbingan & Workshop:</span>
                <span className="text-primary font-medium">Termasuk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function PricingSection() {
  return (
    <section id="harga" className="py-16 md:py-20 border-t border-border/60 bg-background scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* 1. Header */}
        <PricingHeader />

        {/* 2. 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PRICING_PLANS.map((plan, idx) => (
            <PricingCard key={plan.id} plan={plan} index={idx} />
          ))}
        </div>

        {/* 3. Enterprise CTA Banner */}
        <EnterpriseCTA />
      </div>
    </section>
  )
}
