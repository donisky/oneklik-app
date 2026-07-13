import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-blue-600">Oneklik.id</h1>
        <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Dashboard
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Satu Klik untuk <br/>Semua Tautanmu
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-lg">
          Buat halaman bio keren dalam 1 menit. Gratis! Gabung ribuan pengguna Oneklik.
        </p>
        <Link 
          href="/dashboard" 
          className="px-8 py-4 bg-blue-600 text-white rounded-full text-xl font-semibold hover:bg-blue-700 shadow-lg transition-all"
        >
          Buat Halaman Gratis Sekarang
        </Link>
        
        {/* Tempat Pasang Iklan Google AdSense */}
        <div className="mt-16 w-full max-w-2xl h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed">
          [Iklan Google AdSense - Pasang di sini]
        </div>
      </main>

      <footer className="p-6 text-center text-gray-500 text-sm">
        © 2026 Oneklik.id. All rights reserved.
      </footer>
    </div>
  );
}