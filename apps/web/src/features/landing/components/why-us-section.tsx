import { Check, Sparkles } from "lucide-react"
import { motion } from "motion/react"

import { Badge } from "@/components/ui/badge"

const VALUE_POINTS = [
  {
    title: "Notulen Bimbingan Rapi & Terhubung",
    desc: "Tidak ada lagi coretan dosen yang hilang di kertas atau tenggelam di pesan singkat.",
  },
  {
    title: "Struktur Naskah Bebas Dokumen Korup",
    desc: "Penyuntingan per bab yang terpisah menjaga draf Anda aman dengan riwayat versi.",
  },
  {
    title: "Kanban Tugas Harian dengan Rekomendasi",
    desc: "Mengetahui persis apa yang harus diselesaikan hari ini tanpa kebingungan.",
  },
  {
    title: "Target Pacing Kata Menuju Wisuda",
    desc: "Metrik visual menjaga konsistensi menulis hingga siap naik meja sidang.",
  },
]

export function WhyUsSection() {
  return (
    <section id="keunggulan" className="py-16 md:py-20 border-t border-border/60">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Benefits List */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
              >
                <Sparkles className="size-3 text-primary" />
                <span>Mengapa Memilih Thesio</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground"
              >
                Perbedaan nyata antara cara manual dengan ruang kerja digital
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="mt-3 text-muted-foreground text-sm leading-relaxed"
              >
                Menyelesaikan skripsi bukan soal bekerja lebih keras, melainkan memiliki alur yang jelas setiap hari.
              </motion.p>
            </div>

            <div className="space-y-3">
              {VALUE_POINTS.map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.25 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3"
                >
                  <Check className="size-4 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Status Center Card */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6"
          >
            <div className="rounded-xl border border-border/80 bg-card p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                <span className="font-semibold text-foreground">Thesio Status Center</span>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  Sidang Ready
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                  <span className="text-muted-foreground">Kelengkapan Naskah:</span>
                  <span className="text-primary font-semibold font-mono">Bab 1 - 5 Lengkap</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                  <span className="text-muted-foreground">Total Kata Tersusun:</span>
                  <span className="text-foreground font-mono font-semibold">18,500 Kata</span>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between">
                  <span className="text-muted-foreground">Poin Revisi Dosen:</span>
                  <span className="text-primary font-semibold">0 Tertunda (100% Selesai)</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-muted-foreground font-mono">
                🎓 Naskah siap diajukan ke sidang skripsi
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
