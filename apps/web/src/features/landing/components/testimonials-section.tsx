import { Sparkles } from "lucide-react"
import { motion } from "motion/react"

const TESTIMONIALS = [
  {
    name: "Ahmad Fauzi, S.Kom",
    role: "Teknik Informatika",
    univ: "Universitas Indonesia",
    quote:
      "Dulu catatan bimbingan saya berserakan di chat WhatsApp. Bersama Thesio, semua poin revisi dari dosen langsung jadi to-do list yang rapi. Saya berhasil sidang tepat 4 tahun.",
  },
  {
    name: "Nadia Putri, S.E",
    role: "Manajemen Bisnis",
    univ: "Universitas Gadjah Mada",
    quote:
      "Fitur target kata harian dan editor per bab benar-benar menyelamatkan saya dari writer's block. Naskah 130 halaman selesai dalam 3 bulan tanpa stres berlebih.",
  },
  {
    name: "Rian Pratama, S.T",
    role: "Teknik Elektro",
    univ: "Institut Teknologi Bandung",
    quote:
      "Hal terbaiknya adalah dosen saya tidak perlu membuat akun. Saya yang mengelola seluruh progres secara mandiri, mencatat arahan beliau, dan naskah selalu siap saat bimbingan.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-20 border-t border-border/60">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
          >
            <Sparkles className="size-3 text-primary" />
            <span>Pengalaman Mahasiswa</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mt-2 text-foreground"
          >
            Dipercaya mahasiswa yang telah menyelesaikan tugas akhir
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testi, idx) => (
            <motion.div
              key={testi.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: 0.15 + idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-border/70 bg-card p-6 flex flex-col justify-between space-y-4 hover:border-border transition-colors"
            >
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic">
                "{testi.quote}"
              </p>

              <div className="pt-4 border-t border-border/60 flex items-center gap-3">
                <div className="size-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs">
                  {testi.name[0]}
                </div>
                <div>
                  <h4 className="font-heading text-xs font-semibold text-foreground">
                    {testi.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {testi.role} • {testi.univ}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
