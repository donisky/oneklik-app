'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link as LinkIcon, Copy, CheckCircle2, ArrowLeft, Download, 
  Crown, Loader2, Globe, Palette
} from 'lucide-react';

const BASE_URL = 'https://oneklik.my.id';

// Daftar Template Warna untuk Visualisasi
const COLOR_TEMPLATES = [
  { label: 'Brand Oneklik', fg: '#0B2E24', bg: '#FAF8F3' },
  { label: 'Emas Premium', fg: '#E8B448', bg: '#FFFFFF' },
  { label: 'Modern Biru', fg: '#2563EB', bg: '#F8FAFC' },
  { label: 'Elegant Ungu', fg: '#7C3AED', bg: '#F5F3FF' }
];

export default function UrlShortenerPage() {
  const [inputUrl, setInputUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  // Set default ke Brand Oneklik
  const [design, setDesign] = useState({ fgColor: '#0B2E24', bgColor: '#FAF8F3' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCreate = async () => {
    if (!inputUrl.trim()) { toast.error('Masukkan URL!'); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Login dulu'); router.push('/upgrade'); return; }

      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl, isPremium, customSlug: isPremium ? customSlug : undefined, design: isPremium ? design : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (data.shortUrl && !data.shortUrl.includes(BASE_URL)) {
        const code = data.shortCode || data.shortUrl.split('/').pop();
        data.shortUrl = `${BASE_URL}/s/${code}`;
      }
      setResult(data);
      toast.success('Short link berhasil dibuat!');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link disalin!');
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    try {
      const dataUrl = await toPng(qrRef.current, { quality: 1 });
      const link = document.createElement('a');
      link.download = `qrcode-${result?.shortCode || 'oneklik'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('QR Code berhasil di-download!');
    } catch {
      toast.error('Gagal mendownload QR. Pastikan library html-to-image terinstall.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <Toaster position="top-center" />
      
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <Globe className="text-blue-600" size={20} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Short Link
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto p-6 w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 p-6 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/link-panjang-ini-mau-dipendekkan"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 focus:bg-white transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={loading || !inputUrl}
                className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Buat Link 🔗'}
              </button>
            </div>

            {/* Premium Section */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  id="premium-toggle"
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="premium-toggle" className="text-sm text-slate-700 flex items-center gap-1 cursor-pointer select-none">
                  <Crown size={16} className="text-yellow-500" /> Premium (Custom slug & QR Design)
                </label>
              </div>

              <AnimatePresence>
                {isPremium && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">/s/</span>
                      <input
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value)}
                        placeholder="mylink (custom slug)"
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">QR Warna:</span>
                        <input
                          type="color"
                          value={design.fgColor}
                          onChange={(e) => setDesign({ ...design, fgColor: e.target.value })}
                          className="w-8 h-8 p-1 border rounded cursor-pointer"
                        />
                        <input
                          type="color"
                          value={design.bgColor}
                          onChange={(e) => setDesign({ ...design, bgColor: e.target.value })}
                          className="w-8 h-8 p-1 border rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              {/* Card Hasil Utama dengan Ref untuk Download */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={18} /> Berhasil!</div>
                  <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border">
                    <span className="text-blue-600 font-medium truncate">{result.shortUrl}</span>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded">{copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}</button>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">
                      <Download size={14} /> Download QR (PNG)
                    </button>
                    <a href={result.shortUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"><Download size={14} /> Buka Link</a>
                  </div>
                </div>
                <div className="md:border-l md:pl-6 flex flex-col items-center border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 w-full md:w-auto">
                  <div ref={qrRef} className="bg-white p-2 border rounded shadow-sm">
                    <QRCodeSVG value={result.shortUrl} size={140} fgColor={design.fgColor} bgColor={design.bgColor} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">SCAN QR</p>
                </div>
              </div>

              {/* 🎨 VISUALISASI TEMPLATE INTERAKTIF (SEKARANG BISA DIKLIK!) */}
              {isPremium && (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Palette size={20} className="text-purple-600" />
                    <h3 className="font-bold text-slate-800">Pilih Template Warna QR</h3>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Klik untuk mengganti warna</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {COLOR_TEMPLATES.map((style, idx) => {
                      const isSelected = design.fgColor === style.fg && design.bgColor === style.bg;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setDesign({ fgColor: style.fg, bgColor: style.bg })}
                          className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                            isSelected ? 'border-slate-900 shadow-lg bg-slate-50' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                            <QRCodeSVG value={result.shortUrl} size={100} fgColor={style.fg} bgColor={style.bg} />
                          </div>
                          <p className={`text-xs font-medium mt-2 ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                            {isSelected ? '✓ ' : ''}{style.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-4 text-center">
                    * Klik salah satu template di atas. QR Code utama dan file download akan otomatis berubah warna sesuai template pilihan Anda!
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}