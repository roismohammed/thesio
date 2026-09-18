import { Check, Sparkles, X } from "lucide-react"
import { motion } from "motion/react"

export function IntegrationComparison() {
  const withoutList = [
    "Format sitasi harus diketik dan diperiksa manual satu per satu",
    "Catatan revisi dosen sering tercecer di WhatsApp atau kertas coretan",
    "Risiko file rusak atau salah versi draf akhir saat mengirim naskah",
    "Sulit mengukur estimasi kata dan target waktu selesai sidang",
  ]

  const withList = [
    "Daftar pustaka APA 7th & IEEE terbuat otomatis dan sinkron per bab",
    "Notulen bimbingan langsung otomatis jadi kartu tugas revisi kanban",
    "Draf tersimpan aman per bab dengan riwayat versi dan backup instan",
    "Analisis kata dan countdown otomatis memandu mahasiswa tepat waktu",
  ]

  return (
    <section className="py-16 md:py-20 border-t border-border/60">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
          >
            <Sparkles className="size-3 text-primary" />
            <span>Mengapa Integrasi Itu Penting</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance"
          >
            Satu Ruang Kerja untuk Mengendalikan Seluruh Skripsi
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed text-balance"
          >
            Hilangkan friksi teknis agar energi dan pikiran Anda dapat sepenuhnya tercurah pada substansi penelitian.
          </motion.p>
        </div>

        {/* Comparison Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left Panel: Tanpa Integrasi */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-border bg-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-border/60">
                <div className="size-6 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <X className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
                  Cara Manual Tanpa Thesio
                </h3>
              </div>

              <ul className="mt-5 space-y-3.5">
                {withoutList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                    <span className="mt-0.5 size-4 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center shrink-0">
                      <X className="size-2.5" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
              Rentan membuang puluhan jam hanya untuk penyesuaian format dan revisi berulang.
            </p>
          </motion.div>

          {/* Right Panel: Dengan Integrasi Thesio */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-primary/40 bg-card p-6 sm:p-7 flex flex-col justify-between ring-1 ring-primary/20"
          >
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-border/60">
                <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Check className="size-3.5" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
                  Dengan Ekosistem Terpadu Thesio
                </h3>
              </div>

              <ul className="mt-5 space-y-3.5">
                {withList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground">
                    <span className="mt-0.5 size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Check className="size-2.5" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 pt-4 border-t border-border/50 text-[11px] text-primary font-medium">
              Alur pengerjaan otomatis dan terstruktur menjamin naskah siap maju sidang lebih cepat.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
