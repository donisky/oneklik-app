'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image'; // npm install html-to-image
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link as LinkIcon, FileText, Upload, Copy, CheckCircle2, 
  ArrowLeft, Download, QrCode, Loader2, Globe, Crown, Palette, Lock
} from 'lucide-react';

// Domain Anda
const BASE_URL = 'https://oneklik.my.id';

export default function ToolsUrlShortenerPage() {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  
  // State untuk Link mode
  const [inputUrl, setInputUrl] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [design, setDesign] = useState({ fgColor: '#0B2E24', bgColor: '#FFFFFF' });

  // State untuk File mode
  const [file, setFile] = useState<File | null>(null);
  
  // State Global
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string; fileUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Silakan login terlebih dahulu.');
        router.push('/upgrade');
        return;
      }

      let response;
      if (mode === 'link') {
        if (!inputUrl.trim()) { toast.error('Masukkan URL yang valid!'); return; }
        
        // Kirim data premium (custom slug & design) ke API
        response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: inputUrl, 
            mode: 'link',
            isPremium,
            customSlug: isPremium ? customSlug : undefined,
            design: isPremium ? design : undefined
          }),
        });
      } else {
        if (!file) { toast.error('Pilih file terlebih dahulu!'); return; }
        const formData = new FormData();
        formData.append('file', file);
        // Untuk file, kita tetap pakai endpoint upload (premium color bisa ditambahkan nanti)
        response = await fetch('/api/file-upload', { method: 'POST', body: formData });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal membuat short link');
      
      // Pastikan URL menggunakan domain kita
      if (data.shortUrl && !data.shortUrl.includes(BASE_URL)) {
        const code = data.shortCode || data.shortUrl.split('/').pop();
        data.shortUrl = `${BASE_URL}/s/${code}`;
      }

      setResult(data);
      toast.success('Berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
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
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <Globe className="text-blue-600" size={20} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Short Link & QR
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto p-6 w-full">
        
        {/* Mode Selector dengan Animasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            { id: 'link', icon: LinkIcon, title: 'Short Link', desc: 'Persingkat URL panjang jadi pendek.', color: 'blue' },
            { id: 'file', icon: FileText, title: 'File to Link', desc: 'Upload file & dapatkan link + QR.', color: 'purple' }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { 
                setMode(item.id as any); 
                setResult(null); 
                setFile(null); 
                setInputUrl(''); 
                setIsPremium(false);
              }}
              className={`p-8 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                mode === item.id 
                  ? `border-${item.color}-500 bg-${item.color}-50/50 shadow-md shadow-${item.color}-500/10` 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {mode === item.id && (
                <motion.div layoutId="activeMode" className={`absolute inset-0 bg-${item.color}-500/5 -z-10`} />
              )}
              <div className={`w-14 h-14 bg-${item.color}-100 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner`}>
                <item.icon size={28} />
              </div>
              <h3 className="font-bold text-slate-800 text-xl">{item.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 p-6 mb-8 space-y-4">
          {mode === 'link' ? (
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

              {/* Area Premium Customization */}
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
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={design.fgColor}
                              onChange={(e) => setDesign({ ...design, fgColor: e.target.value })}
                              className="w-8 h-8 p-1 border rounded cursor-pointer"
                              title="Warna QR"
                            />
                            <input
                              type="color"
                              value={design.bgColor}
                              onChange={(e) => setDesign({ ...design, bgColor: e.target.value })}
                              className="w-8 h-8 p-1 border rounded cursor-pointer"
                              title="Background QR"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div 
                className="flex-1 w-full border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/50 transition-colors bg-purple-50/20"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center gap-3 text-purple-700">
                    <Upload size={20} />
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-purple-400 bg-purple-100 px-2 py-0.5 rounded-full">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-purple-400 mb-2" size={32} />
                    <p className="text-sm font-semibold text-purple-700">Klik atau drag & drop file di sini</p>
                    <p className="text-xs text-purple-400 mt-1">Maksimal 10 MB</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={loading || !file}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Upload ⚡'}
              </button>
            </div>
          )}
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Card Hasil Utama */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                
                <div className="flex-1 space-y-5 w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                    <h3 className="font-bold text-lg text-slate-800">Link Siap Digunakan!</h3>
                  </div>

                  {/* Box Link */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-blue-600 truncate">{result.shortUrl}</span>
                    <div className="flex gap-1">
                      <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded-lg transition-colors relative">
                        {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
                      </button>
                      <a href={result.shortUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-white rounded-lg transition-colors">
                        <ArrowLeft size={16} className="rotate-45 text-gray-500" />
                      </a>
                    </div>
                  </div>

                  {/* Detail File */}
                  {mode === 'file' && result.fileUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <Download size={16} className="text-blue-500" /> 
                      <span>File tersimpan di cloud.</span>
                      <a href={result.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-auto font-medium">
                        Lihat File
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">
                      <Download size={14} /> Download QR (PNG)
                    </button>
                  </div>
                </div>

                {/* QR Code Utama dengan Ref untuk Download */}
                <div className="flex flex-col items-center justify-center md:border-l md:pl-8 border-gray-100 w-full md:w-auto">
                  <div ref={qrRef} className="bg-white p-3 rounded-2xl shadow-md border border-gray-100">
                    <QRCodeSVG 
                      value={result.shortUrl} 
                      size={160} 
                      fgColor={isPremium ? design.fgColor : '#0B2E24'} 
                      bgColor={isPremium ? design.bgColor : '#FFFFFF'} 
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 font-medium tracking-wide">SCAN UNTUK BUKA LINK</p>
                </div>
              </div>

              {/* VISUALISASI TEMPLATE QR CODE */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette size={20} className="text-purple-600" />
                  <h3 className="font-bold text-slate-800">Contoh Visualisasi Template QR Code</h3>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Warna bisa dikustom</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Brand Oneklik', fg: '#0B2E24', bg: '#FAF8F3' },
                    { label: 'Emas Premium', fg: '#E8B448', bg: '#FFFFFF' },
                    { label: 'Modern Biru', fg: '#2563EB', bg: '#F8FAFC' },
                    { label: 'Elegant Ungu', fg: '#7C3AED', bg: '#F5F3FF' }
                  ].map((style, idx) => (
                    <div key={idx} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                        <QRCodeSVG value={result.shortUrl} size={100} fgColor={style.fg} bgColor={style.bg} />
                      </div>
                      <p className="text-xs font-medium text-slate-600 mt-2">{style.label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-4 text-center">
                  * Tampilan di atas hanya ilustrasi. QR Code asli yang akan disimpan adalah versi dengan warna pilihan Anda.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}