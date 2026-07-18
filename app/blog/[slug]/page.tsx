import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, ChevronRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    slug: 'cara-membuat-bio-link-profesional',
    title: 'Cara Membuat Bio Link yang Profesional untuk Meningkatkan Konversi',
    date: '12 Juli 2026',
    category: 'Bio Link',
    readTime: '3 menit',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `
      <h2>Apa itu Bio Link?</h2>
      <p>Bio link adalah halaman satu tautan yang berisi kumpulan tautan penting Anda. Ini adalah solusi untuk masalah "hanya satu tautan di bio Instagram atau TikTok".</p>
      <p>Dengan Oneklik.id, Anda dapat membuat halaman bio link yang profesional dengan foto profil, deskripsi diri, dan tombol yang terintegrasi.</p>
      <h2>Tips Membuat Bio Link Profesional</h2>
      <ul><li><strong>Gunakan Foto Profil Berkualitas:</strong> Kesan pertama sangat penting.</li>
      <li><strong>Kustomisasi Tampilan:</strong> Ganti wallpaper, warna tombol, dan tambahkan stiker interaktif.</li>
      <li><strong>Pantau Analitik:</strong> Lihat total kunjungan dan klik melalui dashboard.</li></ul>
    `
  },
  {
    slug: 'mengenal-fitur-short-link-qr-code-oneklik',
    title: 'Mengenal Fitur Short Link & QR Code Oneklik untuk Bisnis Anda',
    date: '10 Juli 2026',
    category: 'Short Link',
    readTime: '2 menit',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `
      <h2>Mengapa Perlu Short Link?</h2>
      <p>Link panjang terlihat tidak rapi dan merusak estetika media sosial. Dengan Oneklik, Anda bisa mempersingkat URL panjang menjadi tautan pendek yang mudah diingat.</p>
      <h2>Fitur Unggulan</h2>
      <ul><li><strong>Custom Slug (Premium):</strong> Ubah kode acak menjadi kata kunci Anda (misal: /s/portofolio).</li>
      <li><strong>QR Code Interaktif:</strong> Otomatis menghasilkan QR code dengan warna yang bisa dikustomisasi.</li>
      <li><strong>File to QR:</strong> Ubah file PDF/Gambar menjadi QR code instan.</li></ul>
    `
  },
  {
    slug: 'panduan-lengkap-membuat-cv-digital',
    title: 'Panduan Lengkap Membuat CV Digital dengan 14 Template Premium',
    date: '8 Juli 2026',
    category: 'CV Generator',
    readTime: '5 menit',
    image: 'https://images.unsplash.com/photo-1586281380349-632531f7c7f2?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `
      <h2>Mengapa CV Digital Penting?</h2>
      <p>Perusahaan saat ini mencari kandidat dengan CV modern dan terstruktur.</p>
      <h2>Fitur Unggulan CV Generator</h2>
      <ul><li><strong>AI Rewrite:</strong> Rangkai deskripsi pengalaman jadi profesional.</li>
      <li><strong>AI Parse:</strong> Upload CV lama, data langsung terisi otomatis.</li>
      <li><strong>Download PDF Anti-Potong:</strong> Unduh langsung tanpa halaman terpotong.</li></ul>
    `
  },
  {
    slug: 'optimasi-tautan-untuk-afiliasi',
    title: 'Optimasi Tautan untuk Program Afiliasi & Dapatkan Komisi 20%',
    date: '5 Juli 2026',
    category: 'Afiliasi',
    readTime: '4 menit',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `
      <h2>Apa itu Program Afiliasi Oneklik?</h2>
      <p>Dapatkan komisi 20% setiap kali ada upgrade Premium melalui link afiliasi Anda.</p>
      <h2>Keuntungan</h2>
      <ul><li><strong>Tanpa Modal:</strong> Daftar gratis dan bagikan link.</li>
      <li><strong>Dashboard Real-Time:</strong> Pantau klik dan komisi langsung.</li>
      <li><strong>Komisi Otomatis:</strong> Tercatat saat pembayaran sukses via Midtrans.</li></ul>
    `
  },
  {
    slug: 'mengubah-file-menjadi-qr-code',
    title: 'Mengubah File Menjadi QR Code: Cara Mudah Bagikan Dokumen',
    date: '1 Juli 2026',
    category: 'QR Code',
    readTime: '2 menit',
    image: 'https://images.unsplash.com/photo-1595079676339-0c8d5845fda4?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `
      <h2>File to QR Code: Solusi Praktis</h2>
      <p>Ubah file apapun (PDF, gambar, video) menjadi QR Code yang bisa di-scan.</p>
      <h2>Cara Kerja:</h2>
      <ol><li>Upload file (maks 10 MB).</li>
      <li>Dapatkan link pendek + QR Code.</li>
      <li>Bagikan QR Code ke audiens.</li></ol>
      <h2>Kapan Berguna?</h2>
      <ul><li><strong>Brosur Event:</strong> Pengunjung scan untuk unduh brosur digital.</li>
      <li><strong>Portofolio:</strong> Tempel QR di kartu nama.</li></ul>
    `
  },
  {
    slug: 'kenapa-harus-oneklik-id',
    title: 'Kenapa Harus Oneklik.id? Platform All-in-One untuk Digital Anda',
    date: '28 Juni 2026',
    category: 'Oneklik',
    readTime: '3 menit',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&h=800&fit=crop&auto=format',
    fallback: 'https://placehold.co/800x800/0B2E24/E8B448?text=Oneklik.id',
    author: 'Tim Oneklik',
    content: `
      <h2>Satu Platform untuk Semua Kebutuhan Digital</h2>
      <p>Oneklik.id adalah solusi "All-in-One" untuk kreator konten dan pebisnis.</p>
      <h2>Fitur Utama</h2>
      <ul><li><strong>Bio Link:</strong> Atur tautan sosial media.</li>
      <li><strong>Generator CV:</strong> 14 Template + AI Rewrite.</li>
      <li><strong>Short Link & QR:</strong> Custom slug dan QR interaktif.</li>
      <li><strong>Program Afiliasi:</strong> Komisi 20%.</li></ul>
    `
  }
];

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-8 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0B2E24] mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Blog
        </Link>
        <div className="mb-8">
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
            <span className="bg-[#E8B448]/20 text-[#E8B448] px-3 py-1 rounded-full">{post.category}</span>
            <div className="w-px h-3 bg-slate-300"></div>
            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
            <span className="w-px h-3 bg-slate-300"></span>
            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#0B2E24] mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 border-t border-slate-200 pt-4">
            <div className="w-8 h-8 bg-[#0B2E24] text-white rounded-full flex items-center justify-center text-xs font-bold">{post.author.charAt(0)}</div>
            <span>Oleh <span className="text-slate-800 font-medium">{post.author}</span></span>
          </div>
        </div>
        <div className="mb-10 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md">
          <img src={post.image} alt={post.title} className="w-full h-auto object-cover" 
               onError={(e) => (e.target as HTMLImageElement).src = post.fallback} />
        </div>
        <article className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#0B2E24] prose-a:text-blue-600 prose-strong:text-slate-900 mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        <div className="border-t border-slate-200 pt-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
          <div><p className="text-sm font-medium text-slate-800">Tertarik mencoba fitur ini?</p><p className="text-xs text-slate-500">Kunjungi dashboard Oneklik dan mulai tingkatkan produktivitas Anda.</p></div>
          <Link href="/dashboard" className="px-6 py-2.5 bg-[#0B2E24] hover:bg-[#0B2E24]/90 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-2">
            Buka Dashboard <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}