import { useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  Clock,
  Compass,
  FileCheck,
  FileSpreadsheet,
  FileText,
  KanbanSquare,
  Link2,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { Badge } from "@/components/ui/badge"

const WORKFLOW_TABS = [
  { label: "Perencanaan Judul & Bab", icon: <Compass className="size-3.5" /> },
  { label: "Manajemen Tugas & Kanban", icon: <KanbanSquare className="size-3.5" /> },
  { label: "Analisis & Target Kata", icon: <TrendingUp className="size-3.5" /> },
  { label: "Integrasi Format & Sitasi", icon: <Link2 className="size-3.5" /> },
]

export function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section id="cara-kerja" className="py-16 md:py-20 scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
          >
            <Sparkles className="size-3 text-primary" />
            <span>Cara Kerja</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-tight"
          >
            Bawa Alur Kerja Skripsi dari Ide hingga Eksekusi Sidang
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed text-balance"
          >
            Rencanakan topik, kelola bab naskah, dan selesaikan setiap tahapan bimbingan dengan alur mandiri yang terstruktur.
          </motion.p>
        </div>

        {/* Category Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 md:mb-12 overflow-x-auto pb-2 flex justify-center"
        >
          <div className="inline-flex items-center p-1 rounded-full border border-border/70 bg-muted/40 gap-1 text-xs">
            {WORKFLOW_TABS.map((tab, idx) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  activeTab === idx
                    ? "bg-card text-foreground border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={activeTab === idx ? "text-primary" : ""}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic Tab Views */}
        <div className="relative min-h-[460px]">
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="tab-0"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <span className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-mono font-semibold text-xs border border-border/70">
                    01
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-snug">
                    Rencanakan dengan Jelas & Terstruktur
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Petakan kerangka penelitian, rumuskan masalah, dan susun proposal penelitian dengan panduan metodologi yang sistematis sebelum seminar proposal.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/80 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>Mulai perencanaan</span>
                      <ArrowRight className="size-3.5 text-primary" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="rounded-xl border border-border/80 bg-card p-6 sm:p-7 text-left relative overflow-hidden">
                    <div className="flex items-center justify-between pb-4 border-b border-border/60 text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <Target className="size-4 text-primary" />
                        Analitik Kesiapan Seminar Proposal
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                        Audit Selesai
                      </Badge>
                    </div>

                    <div className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                      <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
                        <div className="relative size-32 sm:size-36 flex items-center justify-center">
                          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-muted/60"
                              strokeWidth="3.2"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-primary transition-all duration-1000"
                              strokeDasharray="86, 100"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground">86%</span>
                            <span className="text-[10px] text-muted-foreground font-medium">Skor Kelayakan</span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:col-span-7 space-y-3 text-xs">
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Kelengkapan Bab 1 - 3:</span>
                          <span className="font-semibold text-foreground">Lengkap (100%)</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Jurnal Rujukan Terindeks:</span>
                          <span className="font-mono font-semibold text-foreground">18 Paper Valid</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                          <span className="text-muted-foreground font-medium">Estimasi Siap Sempro:</span>
                          <span className="text-foreground font-medium">Tersisa 10 Hari</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-foreground text-background px-4 py-2.5 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-background/80 font-mono flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" /> Standar Format Kemendikbudristek
                      </span>
                      <span className="text-[11px] font-mono font-semibold">Siap Daftar Sempro</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="tab-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
              >
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 text-left space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                      <div className="flex items-center gap-2">
                        <KanbanSquare className="size-4 text-primary" />
                        <span className="font-semibold text-foreground">Papan Kanban Skripsi</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">6 Tugas Aktif</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pb-1">
                          <span>To Do</span>
                          <span className="size-4 rounded-full bg-muted flex items-center justify-center font-mono text-[10px]">2</span>
                        </div>
                        <div className="p-2.5 rounded bg-card border border-border/50 space-y-1.5">
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium">
                            Analisis
                          </span>
                          <p className="text-[11px] font-medium text-foreground leading-snug">Uji Normalitas Data 60 Sampel</p>
                          <p className="text-[10px] text-muted-foreground">Deadline: 2 hari lagi</p>
                        </div>
                        <div className="p-2.5 rounded bg-card border border-border/50 space-y-1.5">
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                            Naskah
                          </span>
                          <p className="text-[11px] font-medium text-foreground leading-snug">Rangkum Sitasi Bab 2</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-primary pb-1">
                          <span>In Progress</span>
                          <span className="size-4 rounded-full bg-primary/15 flex items-center justify-center font-mono text-[10px]">1</span>
                        </div>
                        <div className="p-2.5 rounded bg-card border border-primary/30 space-y-1.5">
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            Prioritas Tinggi
                          </span>
                          <p className="text-[11px] font-medium text-foreground leading-snug">Draf Bab 4 Pembahasan</p>
                          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                            <div className="bg-primary h-full w-[70%]" />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pb-1">
                          <span>Done</span>
                          <span className="size-4 rounded-full bg-muted flex items-center justify-center font-mono text-[10px]">3</span>
                        </div>
                        <div className="p-2.5 rounded bg-card border border-border/50 opacity-80 space-y-1">
                          <p className="text-[11px] font-medium text-muted-foreground line-through">Revisi Notulen Bimbingan #7</p>
                          <p className="text-[10px] text-primary font-medium">✓ Selesai ditinjau</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                  <span className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-mono font-semibold text-xs border border-border/70">
                    02
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-snug">
                    Tetap Teratur & Terkendali
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Pecah skripsi tebal menjadi tugas-tugas kecil harian. Pantau setiap arahan bimbingan dosen dalam alur To-Do, In Progress, dan Done secara otomatis.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/80 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>Jelajahi workspace</span>
                      <ArrowRight className="size-3.5 text-primary" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="tab-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
              >
                <div className="lg:col-span-5 space-y-4">
                  <span className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-mono font-semibold text-xs border border-border/70">
                    03
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-snug">
                    Pantau Progres Secara Real-Time
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Lacak tren volume kata harian, riwayat bimbingan yang telah disetujui, dan estimasi waktu kesiapan naskah sebelum batas akhir pengajuan sidang.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/80 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>Lihat analitik naskah</span>
                      <ArrowRight className="size-3.5 text-primary" />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="rounded-xl border border-border/80 bg-card p-6 sm:p-7 text-left space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="size-4 text-primary" />
                        <span className="font-semibold text-foreground">Metrik Kata & Riwayat Aktivitas</span>
                      </div>
                      <span className="text-[11px] font-mono text-primary font-medium">+3,450 kata minggu ini</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Aktivitas Menulis (7 Hari Terakhir)</span>
                        <span className="font-mono">Rata-rata: 490 kata/hari</span>
                      </div>
                      <div className="grid grid-cols-7 gap-2 items-end h-24 pt-2 border-b border-border/40 pb-2 text-center font-mono text-[10px]">
                        {[
                          { day: "Sen", h: "45%", val: "350" },
                          { day: "Sel", h: "70%", val: "550" },
                          { day: "Rab", h: "90%", val: "720" },
                          { day: "Kam", h: "60%", val: "480" },
                          { day: "Jum", h: "100%", val: "850" },
                          { day: "Sab", h: "35%", val: "250" },
                          { day: "Min", h: "40%", val: "300" },
                        ].map((bar) => (
                          <div key={bar.day} className="flex flex-col items-center justify-end h-full gap-1">
                            <div
                              className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
                              style={{ height: bar.h }}
                            />
                            <span className="text-muted-foreground">{bar.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="text-[11px] font-semibold text-muted-foreground">Aktivitas Terakhir</span>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/50 text-[11px]">
                          <span className="flex items-center gap-2">
                            <Clock className="size-3 text-primary" />
                            <span>Draf Bab 3 Metodologi tersimpan otomatis</span>
                          </span>
                          <span className="text-muted-foreground font-mono">14:30 WIB</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/50 text-[11px]">
                          <span className="flex items-center gap-2">
                            <Check className="size-3 text-primary" />
                            <span>Notulen Bimbingan #8 selesai ditandai</span>
                          </span>
                          <span className="text-muted-foreground font-mono">Kemarin</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="tab-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center"
              >
                <div className="lg:col-span-7 order-2 lg:order-1">
                  <div className="rounded-xl border border-border/80 bg-card p-6 sm:p-8 text-center">
                    <div className="text-xs font-semibold text-foreground pb-4 border-b border-border/60 flex items-center justify-between text-left">
                      <span className="flex items-center gap-2">
                        <Link2 className="size-4 text-primary" />
                        Hub Format & Sinkronisasi Akademik
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        6 Format Aktif
                      </Badge>
                    </div>

                    <div className="py-6 flex flex-col items-center justify-center relative">
                      <img
                        src="/logo/thesio.png"
                        alt="Thesio Central Hub"
                        className="size-16 rounded-2xl object-contain z-10"
                      />

                      <div className="grid grid-cols-3 gap-3 w-full mt-6 text-xs">
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center gap-2">
                          <FileText className="size-4 text-primary" />
                          <span className="font-medium">Word (.docx)</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center gap-2">
                          <FileCheck className="size-4 text-primary" />
                          <span className="font-medium">PDF Ekspor</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center gap-2">
                          <Quote className="size-4 text-primary" />
                          <span className="font-medium">Mendeley</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center gap-2">
                          <BookOpen className="size-4 text-primary" />
                          <span className="font-medium">Zotero BibTeX</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center gap-2">
                          <FileSpreadsheet className="size-4 text-primary" />
                          <span className="font-medium">Excel Data</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border/60 bg-muted/30 flex items-center justify-center gap-2">
                          <ShieldCheck className="size-4 text-primary" />
                          <span className="font-medium">Turnitin Check</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground font-mono bg-muted/40 p-2.5 rounded-lg border border-border/50">
                      Format naskah selalu sinkron & siap diekspor ke template resmi universitas
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                  <span className="size-7 rounded-md bg-muted text-foreground flex items-center justify-center font-mono font-semibold text-xs border border-border/70">
                    04
                  </span>
                  <h3 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-snug">
                    Terhubung dengan Semua Perkakas Anda
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Ekspor naskah per bab secara instan ke Microsoft Word atau PDF dengan tata letak rapi, serta integrasikan kutipan jurnal dari Mendeley dan Zotero.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border/80 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
                    >
                      <span>Lihat integrasi format</span>
                      <ArrowRight className="size-3.5 text-primary" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
