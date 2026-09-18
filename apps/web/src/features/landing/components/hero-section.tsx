import { Link } from "react-router-dom"
import {
  ArrowRight,
  Check,
  FileCheck,
  FileEdit,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative isolate pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      {/* Subtle Grid Pattern Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] opacity-70"
      >
        <svg
          className="absolute inset-0 h-full w-full stroke-neutral-900/[0.07] dark:stroke-white/[0.07]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="hero-grid-pattern"
              width={40}
              height={40}
              patternUnits="userSpaceOnUse"
              x="50%"
              y={-1}
            >
              <path d="M.5 40V.5H40" fill="none" strokeWidth={1} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid-pattern)" />
        </svg>
      </div>

      {/* Very Subtle Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[550px] h-[260px] bg-primary/[0.03] dark:bg-primary/[0.06] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating Badges - Left */}
      <motion.div
        initial={{ opacity: 0, x: -24, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="hidden xl:flex absolute top-16 left-[2%] 2xl:left-[5%] items-center gap-2.5 px-3.5 py-2 rounded-lg border border-border bg-card select-none z-10"
      >
        <div className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0 border border-border/60">
          <FileText className="size-3.5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">Naskah_Bab1_5.docx</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
              DOCX
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">14,250 kata • Format Standar</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20, y: 15 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="hidden 2xl:flex absolute top-56 left-[3%] items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-[11px] font-medium select-none z-10"
      >
        <Sparkles className="size-3 text-primary" />
        <span>Format Sitasi APA & IEEE Otomatis</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -16, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="hidden xl:flex absolute top-[380px] left-[2%] 2xl:left-[5%] items-center gap-2.5 px-3.5 py-2 rounded-lg border border-border bg-card select-none z-10"
      >
        <div className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0 border border-border/60">
          <FileSpreadsheet className="size-3.5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">Data_Responden.xlsx</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
              XLSX
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">60 Sampel Validasi Teruji</p>
        </div>
      </motion.div>

      {/* Floating Badges - Right */}
      <motion.div
        initial={{ opacity: 0, x: 24, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
        className="hidden xl:flex absolute top-16 right-[2%] 2xl:right-[5%] items-center gap-2.5 px-3.5 py-2 rounded-lg border border-border bg-card select-none z-10"
      >
        <div className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0 border border-border/60">
          <FileCheck className="size-3.5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">Draft_Sidang_Akhir.pdf</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
              PDF
            </span>
          </div>
          <p className="text-[10px] text-foreground font-medium flex items-center gap-1">
            <Check className="size-2.5 stroke-[3] text-primary" /> Siap Ujian Skripsi
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: 15 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
        className="hidden 2xl:flex absolute top-56 right-[3%] items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-[11px] font-medium select-none z-10"
      >
        <FileEdit className="size-3 text-primary" />
        <span>8 Catatan Bimbingan Terindeks</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
        className="hidden xl:flex absolute top-[380px] right-[2%] 2xl:right-[5%] items-center gap-2.5 px-3.5 py-2 rounded-lg border border-border bg-card select-none z-10"
      >
        <div className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-bold text-xs shrink-0 border border-border/60">
          <GraduationCap className="size-3.5" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">Lembar_Pengesahan.pdf</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground font-semibold">
              SKRIPSI
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Disetujui 2 Pembimbing</p>
        </div>
      </motion.div>

      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10 text-center flex flex-col items-center relative z-10">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-6"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          <span>Platform Manajemen Skripsi Mandiri Mahasiswa</span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-foreground font-semibold">Versi 2.0</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight max-w-4xl text-balance leading-[1.12] text-foreground"
        >
          Susun Skripsi Lebih Cepat dengan Alur Kerja Digital yang Terstruktur
        </motion.h1>

        {/* Supporting Paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
          className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl text-balance leading-relaxed"
        >
          Thesio memandu setiap tahapan tugas akhir mahasiswa: perumusan judul, draf bab 1 hingga 5,
          notulen bimbingan dosen, serta manajemen tugas harian dalam satu ruang kerja yang tenang.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <Button
            size="lg"
            render={<Link to={user ? "/dashboard" : "/register"} />}
            className="w-full sm:w-auto text-xs sm:text-sm px-6 h-10 font-medium bg-foreground text-background hover:bg-foreground/90 gap-2"
          >
            <span>{user ? "Masuk ke Dasbor Saya" : "Mulai Gratis Sekarang"}</span>
            <ArrowRight className="size-3.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<a href="#cara-kerja" />}
            className="w-full sm:w-auto text-xs sm:text-sm px-6 h-10 font-medium border-border/80 text-foreground hover:bg-muted/40"
          >
            Lihat Cara Kerja
          </Button>
        </motion.div>

        {/* Social Proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="mt-6 text-[11px] text-muted-foreground flex items-center gap-2"
        >
          <ShieldCheck className="size-3.5 text-primary" />
          <span>100% mandiri untuk mahasiswa • Dosen tidak perlu membuat akun</span>
        </motion.p>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.38, ease: "easeOut" }}
          className="relative mt-12 w-full max-w-[1020px]"
        >
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 text-left">
            {/* Mockup Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border/70 gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/logo/thesio.png"
                  alt="Thesio"
                  className="size-7 rounded-md object-contain"
                />
                <div>
                  <h3 className="font-heading text-xs sm:text-sm font-semibold text-foreground">
                    Sistem Rekomendasi Terstruktur Berbasis LLM untuk Riset Mahasiswa
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Program Studi Teknik Informatika • Universitas Indonesia
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                  Tahap 3 • Penelitian
                </Badge>
                <span className="font-mono text-xs font-semibold text-foreground">
                  72% Selesai
                </span>
              </div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground font-medium">Volume Kata Naskah</span>
                  <p className="text-2xl font-semibold font-mono mt-1 text-foreground">14,250</p>
                  <span className="text-[10px] text-foreground font-medium">
                    +850 kata minggu ini (Target: 15,000)
                  </span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground font-medium">Sesi Bimbingan Dosen</span>
                  <p className="text-2xl font-semibold font-mono mt-1 text-foreground">8 Sesi</p>
                  <span className="text-[10px] text-muted-foreground">
                    2 poin revisi aktif di Bab 4
                  </span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/60 bg-muted/20">
                  <span className="text-[11px] text-muted-foreground font-medium">Kanban Tugas Skripsi</span>
                  <p className="text-2xl font-semibold font-mono mt-1 text-foreground">6 / 8 Selesai</p>
                  <span className="text-[10px] text-foreground font-medium">
                    Target Seminar Hasil: 18 Hari
                  </span>
                </div>
              </div>

              {/* Chapter Roadmap Progress */}
              <div className="p-4 rounded-lg border border-border/60 bg-card space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    <Layers className="size-3.5 text-primary" />
                    Roadmap 5 Tahapan Skripsi
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Tahap 3: Eksperimen & Analisis
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-foreground h-full rounded-full w-[72%]" />
                </div>

                <div className="grid grid-cols-5 text-[10px] sm:text-[11px] text-muted-foreground text-center font-mono">
                  <span className="text-foreground font-medium">1. Judul ✓</span>
                  <span className="text-foreground font-medium">2. Proposal ✓</span>
                  <span className="text-foreground font-semibold text-primary">
                    3. Bab Inti (Aktif)
                  </span>
                  <span>4. Sidang</span>
                  <span>5. Revisi</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
