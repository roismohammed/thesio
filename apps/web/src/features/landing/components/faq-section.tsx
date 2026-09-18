import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Sparkles } from "lucide-react"

export interface FaqItem {
  id: string
  number: string
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    number: "01",
    question: "Apakah dosen pembimbing saya harus memiliki akun di Thesio?",
    answer:
      "Tidak perlu. Thesio dirancang 100% untuk kemandirian mahasiswa. Anda cukup mencatat hasil arahan dosen ke modul Notulen Bimbingan setelah sesi bimbingan selesai, lalu sistem akan mengonversinya menjadi daftar tugas terstruktur.",
  },
  {
    id: "faq-2",
    number: "02",
    question: "Apakah draf dan data tulisan skripsi saya terjamin keamanannya?",
    answer:
      "Sangat aman. Seluruh draf naskah skripsi Anda dienkripsi dan hanya dapat diakses melalui akun pribadi Anda. Kami tidak pernah membagikan, memonetisasi, atau menggunakan karya ilmiah mahasiswa untuk pelatihan AI pihak ketiga.",
  },
  {
    id: "faq-3",
    number: "03",
    question: "Bisakah saya mengekspor naskah ke format Microsoft Word (.docx)?",
    answer:
      "Tentu saja. Naskah tiap bab dapat disalin atau diekspor ke dokumen Word (.docx) dan PDF resmi secara instan, lengkap dengan struktur heading dan format standar yang siap disesuaikan dengan template resmi kampus Anda.",
  },
  {
    id: "faq-4",
    number: "04",
    question: "Apakah Thesio cocok untuk semua jurusan dan jenis penelitian?",
    answer:
      "Ya. Baik penelitian kuantitatif, kualitatif, eksperimen laboratorium, studi kasus, studi literatur, maupun proyek tugas akhir vokasi dapat mengadopsi struktur bab dan alur tahapan di Thesio secara fleksibel sesuai panduan akademik universitas.",
  },
  {
    id: "faq-5",
    number: "05",
    question: "Bagaimana cara kerja fitur pelacak target kata harian?",
    answer:
      "Anda dapat menentukan target jumlah kata per bab atau total naskah. Setiap kali Anda menulis di editor Thesio, progres kata akan dihitung otomatis secara real-time dan disajikan dalam bentuk metrik visual kecepatan penulisan mingguan.",
  },
]

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1")

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="faq" className="py-16 md:py-20 border-t border-border/60 bg-muted/10 scroll-mt-16">
      <div className="max-w-[960px] mx-auto px-6 sm:px-8 lg:px-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground mb-3"
          >
            <Sparkles className="size-3 text-primary" />
            <span>Tanya Jawab</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-tight"
          >
            Semua yang Perlu Anda Ketahui
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto text-balance"
          >
            Jawaban ringkas seputar alur kerja, keamanan data, dan fitur unggulan di platform Thesio.
          </motion.p>
        </div>

        {/* 1-Column Vertical Grid with Separate Flat Cards */}
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + idx * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleToggle(item.id)}
                className={`rounded-[18px] border transition-all duration-200 cursor-pointer select-none bg-card ${
                  isOpen
                    ? "border-border"
                    : "border-border/60 hover:border-border hover:bg-muted/40"
                } py-5 px-6 sm:px-8`}
              >
                {/* Header Row: Number + Question + Morphing Plus/Minus Icon */}
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Fixed-width Number (01, 02, etc.) */}
                  <span className="font-mono text-xs sm:text-sm font-semibold text-muted-foreground/70 w-8 sm:w-10 shrink-0">
                    {item.number}
                  </span>

                  {/* Center: Question Text */}
                  <h3 className="font-heading text-sm sm:text-base font-semibold text-foreground flex-1 text-left leading-snug">
                    {item.question}
                  </h3>

                  {/* Right: Morphing SVG Plus/Minus Icon */}
                  <div className="size-6 rounded-full flex items-center justify-center text-muted-foreground shrink-0 transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 stroke-foreground dark:stroke-foreground transition-transform duration-200"
                      fill="none"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      {/* Horizontal Bar (always visible) */}
                      <line x1="5" y1="12" x2="19" y2="12" />
                      {/* Vertical Bar (rotates & scales out on expand to become minus) */}
                      <line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        className={`origin-center transition-all duration-200 ${
                          isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                        }`}
                      />
                    </svg>
                  </div>
                </div>

                {/* Smooth Animated Height & Opacity for Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.25, delay: 0.08 },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.15 },
                        },
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pl-8 sm:pl-10 pr-2 sm:pr-8">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
