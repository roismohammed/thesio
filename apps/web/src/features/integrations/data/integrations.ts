export type IntegrationCategory =
  | "Referensi"
  | "Penyimpanan"
  | "Dokumen"
  | "Komunikasi"
  | "AI & Bahasa"
  | "Jadwal"

export type IntegrationStatus = "Tersedia" | "Instan" | "Populer"

export type IntegrationIconType =
  | "mendeley"
  | "gdrive"
  | "word"
  | "whatsapp"
  | "ai"
  | "calendar"
  | "turnitin"
  | "latex"
  | "notulen"

export interface IntegrationItem {
  id: string
  name: string
  category: IntegrationCategory
  description: string
  iconType: IntegrationIconType
  status: IntegrationStatus
}

export const INTEGRATIONS_LIST: IntegrationItem[] = [
  {
    id: "mendeley-zotero",
    name: "Mendeley & Zotero",
    category: "Referensi",
    description:
      "Tarik data metadata jurnal dan sitasi otomatis format APA 7th atau IEEE langsung ke naskah bab.",
    iconType: "mendeley",
    status: "Populer",
  },
  {
    id: "gdrive",
    name: "Google Drive & Cloud",
    category: "Penyimpanan",
    description:
      "Cadangan otomatis versi draf bab dan lampiran data riset langsung ke Google Drive setiap kali Anda menyimpan.",
    iconType: "gdrive",
    status: "Tersedia",
  },
  {
    id: "word-docx",
    name: "Microsoft Word (.docx)",
    category: "Dokumen",
    description:
      "Kompilasi seluruh Bab 1–5 menjadi file DOCX rapi sesuai margin 4-4-3-3 dan tata letak standar kampus.",
    iconType: "word",
    status: "Populer",
  },
  {
    id: "whatsapp-notif",
    name: "WhatsApp & Email Reminder",
    category: "Komunikasi",
    description:
      "Terima pengingat tenggat revisi dosen dan notifikasi jadwal bimbingan langsung di pesan WhatsApp Anda.",
    iconType: "whatsapp",
    status: "Instan",
  },
  {
    id: "ai-grammar",
    name: "AI Tata Bahasa & EYD V",
    category: "AI & Bahasa",
    description:
      "Deteksi otomatis kalimat tidak baku, ejaan typo, dan saran perbaikan kalimat ilmiah berbahasa Indonesia.",
    iconType: "ai",
    status: "Populer",
  },
  {
    id: "gcalendar",
    name: "Google Calendar",
    category: "Jadwal",
    description:
      "Sinkronisasi otomatis countdown target seminar proposal, seminar hasil, dan sidang skripsi ke kalender pribadi.",
    iconType: "calendar",
    status: "Tersedia",
  },
  {
    id: "turnitin-checker",
    name: "Cek Kemiripan & Plagiasi",
    category: "AI & Bahasa",
    description:
      "Pemeriksaan kemiripan teks internal sebelum naskah dikirim ke dosen untuk mencegah plagiarisme tidak disengaja.",
    iconType: "turnitin",
    status: "Tersedia",
  },
  {
    id: "latex-bibtex",
    name: "Overleaf & BibTeX",
    category: "Dokumen",
    description:
      "Ekspor daftar pustaka format .bib dan rumus persamaan matematis siap pakai untuk naskah skripsi teknik & sains.",
    iconType: "latex",
    status: "Tersedia",
  },
  {
    id: "notulen-sync",
    name: "Notulen & Catatan Dosen",
    category: "Referensi",
    description:
      "Konversi rekaman arahan dan catatan bimbingan dosen menjadi kartu aksi kanban revisi secara instan.",
    iconType: "notulen",
    status: "Instan",
  },
]
