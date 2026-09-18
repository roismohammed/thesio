import { Link } from "react-router-dom"

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 py-16 bg-muted/10">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12 border-b border-border/60 text-xs">
          {/* Col 1-2: Brand & Overview */}
          <div className="space-y-3 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo/thesio.png"
                alt="Thesio"
                className="size-6 rounded-md object-contain"
              />
              <span className="font-heading font-semibold text-sm tracking-tight text-foreground">
                Thesio
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Platform manajemen skripsi mandiri terpadu yang membantu mahasiswa menyelesaikan tugas akhir secara terstruktur dan tepat waktu.
            </p>
            <p className="text-[11px] text-muted-foreground font-mono pt-1">
              v2.0 • Standar Akademik Indonesia
            </p>
          </div>

          {/* Col 3: Product */}
          <div className="space-y-2.5">
            <p className="font-semibold text-foreground">Produk</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/#cara-kerja" className="hover:text-foreground transition-colors">Perencanaan Judul</Link></li>
              <li><Link to="/#fitur" className="hover:text-foreground transition-colors">Editor Anotasi Bab</Link></li>
              <li><Link to="/integrations" className="hover:text-foreground transition-colors">Integrasi Referensi</Link></li>
              <li><Link to="/#cara-kerja" className="hover:text-foreground transition-colors">Kanban Tugas Harian</Link></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-2.5">
            <p className="font-semibold text-foreground">Panduan</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#cara-kerja" className="hover:text-foreground transition-colors">Alur Penulisan</a></li>
              <li><a href="#keunggulan" className="hover:text-foreground transition-colors">Perbandingan Metode</a></li>
              <li><a href="#harga" className="hover:text-foreground transition-colors">Paket & Biaya</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Col 5: Account */}
          <div className="space-y-2.5">
            <p className="font-semibold text-foreground">Akses Akun</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link to="/login" className="hover:text-foreground transition-colors">Masuk Akun</Link></li>
              <li><Link to="/register" className="hover:text-foreground transition-colors">Daftar Baru</Link></li>
              <li><Link to="/forgot-password" className="hover:text-foreground transition-colors">Lupa Sandi</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dasbor Mahasiswa</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Thesio. Hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privasi Terjamin</span>
            <span>•</span>
            <span>100% Mandiri Mahasiswa</span>
            <span>•</span>
            <span>Dibuat untuk Akademisi</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
