import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileEdit,
  FileText,
  KanbanSquare,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { motion } from "motion/react"

// Types
export interface SectionHeaderProps {
  badge?: string
  title: string
  description: string
}

export interface FeatureContentProps {
  title: string
  description: string
  ctaText?: string
  ctaHref?: string
}

export interface FeatureVisualProps {
  children: React.ReactNode
  variant?: "left" | "right"
}

// 1. Reusable Section Header - Consistent typography with Landing Page
export function SectionHeader({
  badge = "Satu Platform Terpadu",
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
        >
          <Sparkles className="size-3 text-primary" />
          <span>{badge}</span>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed text-balance"
      >
        {description}
      </motion.p>
    </div>
  )
}

// 2. Reusable Feature Visual Container with Animated Dotted Grid Pattern (Flat, No Shadows)
export function FeatureVisual({ children, variant = "left" }: FeatureVisualProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: variant === "left" ? -20 : 20, y: 16 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-[320px] sm:h-[350px] md:h-[360px] rounded-xl bg-muted/25 border border-border/70 overflow-hidden flex items-center justify-center p-4 sm:p-6"
    >
      {/* Animated Dotted Background */}
      <motion.div
        animate={{
          backgroundPosition: ["0px 0px", "24px 24px"],
        }}
        transition={{
          repeat: Infinity,
          duration: 16,
          ease: "linear",
        }}
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          color: "var(--muted-foreground)",
        }}
      />

      {/* Interactive Content */}
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </motion.div>
  )
}

// 3. Performance / Progress Analytics Dashboard (Flat Card, No Heavy Shadows)
export function PerformanceDashboard() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[360px] bg-card text-card-foreground rounded-xl border border-border p-5"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/50">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block">
            Total Progres Kata
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold tracking-tight text-foreground font-heading">
              18,450
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              <TrendingUp className="size-3" />
              +12%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            dari target minggu ini
          </span>
        </div>

        {/* Top-right icon */}
        <div className="size-8 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-muted-foreground shrink-0">
          <BarChart3 className="size-4 text-primary" />
        </div>
      </div>

      {/* SVG Smooth Area Chart */}
      <div className="relative pt-3 pb-1">
        <svg
          viewBox="0 0 320 85"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-20 overflow-visible"
        >
          <defs>
            <linearGradient id="thesioChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Minimal Grid lines */}
          <line
            x1="0"
            y1="75"
            x2="320"
            y2="75"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1="38"
            x2="320"
            y2="38"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeDasharray="4 4"
          />

          {/* Area Fill */}
          <path
            d="M 0,60 C 40,52 70,70 110,44 C 150,20 190,40 230,24 C 270,10 295,18 320,6 L 320,75 L 0,75 Z"
            fill="url(#thesioChartGradient)"
          />

          {/* Curve Stroke Line */}
          <path
            d="M 0,60 C 40,52 70,70 110,44 C 150,20 190,40 230,24 C 270,10 295,18 320,6"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Active Data Points */}
          <circle
            cx="230"
            cy="24"
            r="4"
            className="fill-background stroke-primary"
            strokeWidth="2"
          />
          <circle
            cx="320"
            cy="6"
            r="4"
            className="fill-background stroke-primary"
            strokeWidth="2"
          />
        </svg>

        {/* Chart Bottom Labels */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 font-mono">
          <span>Bab 1</span>
          <span>Bab 2</span>
          <span>Bab 3</span>
          <span>Bab 4</span>
          <span>Bab 5</span>
        </div>
      </div>
    </motion.div>
  )
}

// 4. Integration Ecosystem / Workflow Network Diagram (Flat, No Shadows)
export function IntegrationNetwork() {
  const integrationNodes = [
    {
      name: "Notulen Bimbingan",
      icon: <FileEdit className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
      pos: "top-3 left-4 sm:top-4 sm:left-6",
      delay: 0.35,
    },
    {
      name: "Kanban Revisi",
      icon: <KanbanSquare className="size-3.5 text-sky-600 dark:text-sky-400" />,
      pos: "top-3 right-4 sm:top-4 sm:right-6",
      delay: 0.4,
    },
    {
      name: "Daftar Pustaka APA",
      icon: <BookOpen className="size-3.5 text-amber-600 dark:text-amber-400" />,
      pos: "bottom-3 left-4 sm:bottom-4 sm:left-6",
      delay: 0.45,
    },
    {
      name: "Export PDF & DOCX",
      icon: <FileText className="size-3.5 text-rose-600 dark:text-rose-400" />,
      pos: "bottom-3 right-4 sm:bottom-4 sm:right-6",
      delay: 0.5,
    },
    {
      name: "Jadwal Target",
      icon: <Calendar className="size-3.5 text-violet-600 dark:text-violet-400" />,
      pos: "top-1/2 -translate-y-1/2 left-2 sm:left-3",
      delay: 0.55,
    },
    {
      name: "Simulasi Sidang",
      icon: <CheckCircle2 className="size-3.5 text-teal-600 dark:text-teal-400" />,
      pos: "top-1/2 -translate-y-1/2 right-2 sm:right-3",
      delay: 0.6,
    },
  ]

  return (
    <div className="relative w-full max-w-[380px] h-[250px] sm:h-[260px] flex items-center justify-center">
      {/* SVG Connecting Lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3">
          <line x1="50%" y1="50%" x2="20%" y2="18%" />
          <line x1="50%" y1="50%" x2="80%" y2="18%" />
          <line x1="50%" y1="50%" x2="20%" y2="82%" />
          <line x1="50%" y1="50%" x2="80%" y2="82%" />
          <line x1="50%" y1="50%" x2="12%" y2="50%" />
          <line x1="50%" y1="50%" x2="88%" y2="50%" />
        </g>
      </svg>

      {/* Central Brand Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 size-13 sm:size-14 rounded-xl bg-card border border-border p-2 flex items-center justify-center"
      >
        <img
          src="/logo/thesio.png"
          alt="Thesio Central Logo"
          className="size-8 sm:size-9 object-contain rounded-md"
        />
      </motion.div>

      {/* Surrounding Workflow Integration Nodes */}
      {integrationNodes.map((node, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: node.delay, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute ${node.pos} z-10 flex items-center gap-1.5 p-1.5 sm:p-2 rounded-lg bg-card border border-border text-foreground select-none`}
        >
          <div className="size-5 sm:size-6 rounded bg-muted/60 flex items-center justify-center shrink-0">
            {node.icon}
          </div>
          <span className="text-[11px] font-medium hidden sm:inline-block pr-0.5">
            {node.name}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// 5. Reusable Feature Title, Description, and CTA Button
export function FeatureContent({
  title,
  description,
  ctaText = "Pelajari lebih lanjut",
  ctaHref = "/register",
}: FeatureContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="mt-4 sm:mt-5 flex flex-col items-start"
    >
      <h3 className="font-heading text-lg sm:text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-muted-foreground text-xs sm:text-sm leading-relaxed">
        {description}
      </p>
      <Link
        to={ctaHref}
        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/80 bg-card hover:bg-muted/50 text-foreground text-xs font-medium transition-colors group"
      >
        <span>{ctaText}</span>
        <ArrowRight className="size-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </motion.div>
  )
}

// 6. Main Unified Platform Section
export function FeaturesOverviewSection() {
  return (
    <section
      id="fitur"
      className="py-16 md:py-20 border-t -mt-28 border-border/60 bg-muted/10 scroll-mt-16"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* 1. SECTION HEADER */}
        <SectionHeader
          badge="Satu Platform Terpadu"
          title="Satu ruang kerja untuk mengelola seluruh proses skripsi"
          description="Tinggalkan catatan berantakan di berbagai aplikasi. Thesio menyatukan penulisan naskah, notulen dosen, dan manajemen tugas dalam satu alur teratur."
        />

        {/* 2. FEATURE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* FEATURE CARD 1 — PERFORMANCE & TRACKING */}
          <div className="flex flex-col">
            <FeatureVisual variant="left">
              <PerformanceDashboard />
            </FeatureVisual>
            <FeatureContent
              title="Pelacakan Progres & Target Kata"
              description="Pantau perkembangan penulisan secara real-time dengan target harian dan tren kata per bab agar target sidang skripsi Anda selesai tepat waktu."
              ctaText="Pelajari fitur analitik"
              ctaHref="/register"
            />
          </div>

          {/* FEATURE CARD 2 — SEAMLESS INTEGRATION WORKFLOW */}
          <div className="flex flex-col">
            <FeatureVisual variant="right">
              <IntegrationNetwork />
            </FeatureVisual>
            <FeatureContent
              title="Alur Kerja & Integrasi Menyeluruh"
              description="Hubungkan notulen bimbingan dosen langsung menjadi kartu tugas revisi, generator daftar pustaka otomatis, hingga ekspor PDF & DOCX siap cetak."
              ctaText="Pelajari alur terpadu"
              ctaHref="/register"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
