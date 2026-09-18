import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Book02Icon,
  HelpCircleIcon,
  Mail01Icon,
  Search01Icon,
  SentIcon,
  SparklesIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"

import { AppLayout } from "@/components/layout/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InsetCard,
  InsetCardContent,
  InsetCardHeader,
  InsetCardTitle,
} from "@/components/ui/inset-card"

export function BantuanPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")

  const guideSteps = [
    {
      step: 1,
      title: "Tentukan Judul & Buat Dokumen Skripsi",
      desc: "Buka menu Skripsi Saya, buat entitas skripsi baru, lalu lengkapi informasi judul, abstrak awal, serta target semester kelulusan.",
      url: "/thesis",
      actionLabel: "Buka Skripsi",
      category: "Awal",
    },
    {
      step: 2,
      title: "Tulis & Susun Naskah Bab 1 sampai Bab 5",
      desc: "Tulis naskah langsung per bab dengan editor terintegrasi, fitur asistensi parafrase, manajemen sitasi (APA/IEEE), dan pratinjau struktur.",
      url: "/thesis",
      actionLabel: "Mulai Menulis",
      category: "Penyusunan",
    },
    {
      step: 3,
      title: "Catat Notulen & Konversi Tugas Bimbingan",
      desc: "Setelah sesi bimbingan bersama dosen, catat masukan revisi agar otomatis terintegrasi ke papan tugas kanban mandiri.",
      url: "/dashboard",
      actionLabel: "Lihat Dasbor",
      category: "Bimbingan",
    },
    {
      step: 4,
      title: "Simulasi Sidang Skripsi & Ekspor Final",
      desc: "Latih kesiapan ujian dengan Simulator Sidang AI, pantau checklist berkas yudisium, dan ekspor naskah final berformat DOCX/PDF.",
      url: "/dashboard",
      actionLabel: "Coba Simulasi",
      category: "Sidang",
    },
  ]

  const faqList = [
    {
      q: "Apakah dosen pembimbing harus memiliki akun di Thesio?",
      a: "Tidak perlu. Thesio dirancang agar mahasiswa dapat mandiri mengelola naskah, mencatat notulen masukan dosen, dan mengejar target kelulusan.",
      category: "Akun",
    },
    {
      q: "Format sitasi dan daftar pustaka apa saja yang didukung?",
      a: "Thesio mendukung format standar internasional seperti APA 7th Edition dan IEEE, lengkap dengan ekspor daftar pustaka otomatis.",
      category: "Fitur",
    },
    {
      q: "Bagaimana cara mengekspor naskah skripsi ke Microsoft Word?",
      a: "Pada editor bab atau halaman rincian skripsi, pilih tombol Ekspor Naskah lalu pilih format .DOCX untuk menghasilkan naskah sesuai margin kampus.",
      category: "Ekspor",
    },
    {
      q: "Bagaimana jika kuota asistensi parafrase saya habis?",
      a: "Anda dapat meningkatkan status paket langganan ke paket Pro atau Ultimate melalui menu Langganan Saya untuk mendapatkan akses tanpa batas.",
      category: "Langganan",
    },
  ]

  const filteredSteps = useMemo(() => {
    if (!searchQuery.trim()) return guideSteps
    const q = searchQuery.toLowerCase()
    return guideSteps.filter(
      (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqList
    const q = searchQuery.toLowerCase()
    return faqList.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <AppLayout
      pageTitle={t("nav.guide", "Pusat Bantuan & Panduan")}
      breadcrumb={[
        { title: t("breadcrumb.dashboard", "Dasbor"), url: "/dashboard" },
        { title: t("breadcrumb.guide", "Bantuan") },
      ]}
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Hero Section with Live Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Pusat Bantuan & Alur Pengerjaan
              </h1>
              <Badge variant="outline" className="text-[11px] font-medium">
                Panduan Mandiri
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Pelajari langkah demi langkah penyusunan tugas akhir secara sistematis di platform Thesio.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik bantuan atau FAQ…"
              className="h-9 pl-9 pr-3 text-xs w-full"
            />
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HugeiconsIcon icon={Book02Icon} strokeWidth={2} className="size-4 text-primary" />
              <span>4 Tahapan Alur Skripsi Mandiri</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              {filteredSteps.length} langkah ditemukan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {filteredSteps.map((step) => (
              <InsetCard key={step.step} className="flex flex-col justify-between w-full">
                <InsetCardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold font-mono text-primary">
                      {step.step}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {step.category}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Tahap {step.step}/4
                  </span>
                </InsetCardHeader>

                <InsetCardContent className="flex flex-col justify-between flex-1 gap-4 p-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link to={step.url} />}
                      className="text-xs h-8 gap-1.5 font-medium"
                    >
                      <span>{step.actionLabel}</span>
                      <HugeiconsIcon icon={SentIcon} strokeWidth={2} className="size-3.5 text-primary" />
                    </Button>
                  </div>
                </InsetCardContent>
              </InsetCard>
            ))}
          </div>
        </div>

        {/* Interactive FAQ Section */}
        <InsetCard className="w-full">
          <InsetCardHeader className="flex items-center justify-between">
            <InsetCardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} className="size-4 text-primary" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </InsetCardTitle>
            <span className="text-xs text-muted-foreground">
              {filteredFaqs.length} tanya jawab
            </span>
          </InsetCardHeader>

          <InsetCardContent className="p-4 space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian.
              </div>
            ) : (
              filteredFaqs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-muted/30 border border-border/60 space-y-2 transition-colors hover:border-border"
                >
                  <div className="flex items-start gap-2.5">
                    <HugeiconsIcon
                      icon={Tick01Icon}
                      strokeWidth={2}
                      className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">
                          {item.q}
                        </h4>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </InsetCardContent>
        </InsetCard>

        {/* Support & Community Card */}
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-5" />
            </div>
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Butuh Bantuan Lebih Lanjut?
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Tim dukungan Thesio siap membantu kendala teknis penulisan naskah dan penggunaan fitur.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1.5 shrink-0"
            render={<a href="mailto:support@thesio.id" />}
          >
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-3.5" />
            <span>Hubungi Bantuan</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
