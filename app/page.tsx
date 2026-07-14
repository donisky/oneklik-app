import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-100">
      
      {/* --- NAVBAR --- */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
            Oneklik<span className="text-blue-400">.id</span>
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-medium transition-all"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION (KIRI-KANAN) --- */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 lg:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Kiri: Teks */}
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
            Satu Klik untuk <br />
            <span className="text-blue-600">Semua Tautanmu</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
            Buat halaman bio profesional dalam 1 menit. 
            Gratis, tanpa ribet, dan langsung bisa dipakai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              href="/dashboard" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Buat Sekarang Gratis
            </Link>
            <Link 
              href="#features" 
              className="bg-gray-100 hover:bg-gray-200 text-slate-800 px-8 py-4 rounded-full text-lg font-semibold transition-all"
            >
              Lihat Fitur
            </Link>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            🚀 Sudah dipakai oleh <strong className="text-slate-800">+100 pengguna</strong> (dan terus bertambah!)
          </p>
        </div>

        {/* Kanan: Ilustrasi / Card Bio Simulasi */}
        <div className="relative flex justify-center md:justify-end">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3 shadow-md">
                A
              </div>
              <h3 className="font-bold text-xl text-slate-900">Andi Creator</h3>
              <p className="text-sm text-slate-500 mb-6">@andicreator</p>
              
              <div className="w-full space-y-3">
                <a href="#" className="block w-full bg-gray-100 hover:bg-gray-200 text-slate-800 py-3 rounded-lg font-medium transition-all">
                  Instagram
                </a>
                <a href="#" className="block w-full bg-gray-100 hover:bg-gray-200 text-slate-800 py-3 rounded-lg font-medium transition-all">
                  TikTok
                </a>
                <a href="#" className="block w-full bg-gray-100 hover:bg-gray-200 text-slate-800 py-3 rounded-lg font-medium transition-all">
                  WhatsApp
                </a>
                <a href="#" className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all shadow-sm">
                  🛒 Belanja di Shopee
                </a>
              </div>

              <p className="mt-6 text-xs text-slate-400 border-t pt-4 w-full">
                Powered by <span className="text-blue-600 font-semibold">Oneklik.id</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF (Logo Partner / Testimoni) --- */}
      <section className="bg-slate-50 py-12 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Dipercaya oleh ribuan kreator & pebisnis
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale">
            {/* Tempat logo partner - bisa diganti dengan SVG logo asli */}
            <span className="text-xl font-bold font-sans">📸 Instagram</span>
            <span className="text-xl font-bold font-sans">🎵 TikTok</span>
            <span className="text-xl font-bold font-sans">💬 WhatsApp</span>
            <span className="text-xl font-bold font-sans">🛒 Shopee</span>
            <span className="text-xl font-bold font-sans">▶️ YouTube</span>
          </div>
        </div>
      </section>

      {/* --- FITUR UTAMA (GRID 3 KOLOM) --- */}
      <section id="features" className="py-16 md:py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Kenapa pilih <span className="text-blue-600">Oneklik.id</span>?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Semua yang kamu butuhkan untuk mengubah bio media sosialmu menjadi halaman profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kartu 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Super Cepat</h3>
            <p className="text-slate-600">Buat halaman dalam waktu kurang dari 1 menit. Tidak perlu keahlian coding.</p>
          </div>

          {/* Kartu 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-4">
              🔗
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Link Tanpa Batas</h3>
            <p className="text-slate-600">Tambahkan semua link media sosial, toko online, atau konten digital kamu dalam satu tempat.</p>
          </div>

          {/* Kartu 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-4">
              📊
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analitik Premium</h3>
            <p className="text-slate-600">Lihat berapa banyak orang yang mengklik link kamu dengan fitur analitik eksklusif.</p>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIAL / CAROUSEL SEDERHANA --- */}
      <section className="bg-blue-600 py-16 md:py-24 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Apa kata mereka tentang <span className="text-blue-200">Oneklik</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <p className="italic text-lg mb-4">"Bikin link bio jadi gampang banget. UI-nya simpel dan profesional."</p>
              <p className="font-semibold">— Doni F.</p>
              <p className="text-sm text-blue-200">Content Creator</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <p className="italic text-lg mb-4">"Oneklik.id bantu bisnis UMKM saya terlihat lebih kredibel. Recommended!"</p>
              <p className="font-semibold">— Sari A.</p>
              <p className="text-sm text-blue-200">Owner UMKM</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <p className="italic text-lg mb-4">"Gratis, tapi fiturnya premium banget. Saya udah pindah dari Linktree."</p>
              <p className="font-semibold">— Rizki M.</p>
              <p className="text-sm text-blue-200">Freelancer</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA AKHIR --- */}
      <section className="py-16 md:py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
          Siap membuat <br />
          <span className="text-blue-600">Oneklik</span> kamu?
        </h2>
        <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
          Gabung sekarang, gratis selamanya. Tidak perlu kartu kredit, hanya butuh beberapa detik.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          Buat Halaman Oneklik Sekarang
        </Link>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-slate-500">
        <p>© 2026 Oneklik.id. Dibuat dengan ❤️ untuk kreator Indonesia.</p>
      </footer>

    </div>
  );
}