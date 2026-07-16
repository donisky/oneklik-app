import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Komunitas Pengguna</h1>
          <p className="text-slate-500 mb-6">Bergabunglah dengan ribuan pengguna Oneklik.id lainnya. Berbagi tips, trik, dan inspirasi.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-bold text-slate-800">Grup Telegram</h3>
              <p className="text-sm text-slate-500 mt-1">Diskusi aktif dan update terbaru.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} />
              </div>
              <h3 className="font-bold text-slate-800">Discord Server</h3>
              <p className="text-sm text-slate-500 mt-1">Forum diskusi dan kolaborasi.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}