'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Copy, CheckCircle2, ArrowLeft, Download, 
  Crown, Loader2, Globe, Palette
} from 'lucide-react';

const BASE_URL = 'https://oneklik.my.id';

export default function FileQrPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [design, setDesign] = useState({ fgColor: '#0B2E24', bgColor: '#FAF8F3' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string; fileUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State untuk Auth & User
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- 1. CEK AUTENTIKASI & DATA USER SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Belum login -> Redirect ke login, lalu balik lagi ke halaman ini
          router.push(`/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        // Sudah login -> Ambil data user dari tabel 'users'
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Gagal memuat data user');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  // --- 2. LOGIKA SAAT MEN CENTANG FITUR PREMIUM ---
  const handlePremiumToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Cek status premium dari database
      if (!user || !user.is_premium) {
        toast.error('Fitur Premium memerlukan akun Premium. Anda akan diarahkan ke halaman upgrade.');
        router.push(`/upgrade?redirectTo=${encodeURIComponent(window.location.pathname)}`);
        setIsPremium(false); // Batalkan centang
        return;
      }
      setIsPremium(true);
    } else {
      setIsPremium(false);
    }
  };

  // --- SISA FUNGSI ---
  const handleCreate = async () => {
    if (!file) { toast.error('Pilih file terlebih dahulu!'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Login dulu'); router.push('/login'); return; }

      const formData = new FormData();
      formData.append('file', file);
      if (isPremium) {
        formData.append('customSlug', customSlug);
        formData.append('fgColor', design.fgColor);
        formData.append('bgColor', design.bgColor);
      }

      const response = await fetch('/api/file-upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal upload file');

      if (data.shortUrl && !data.shortUrl.includes(BASE_URL)) {
        const code = data.shortCode || data.shortUrl.split('/').pop();
        data.shortUrl = `${BASE_URL}/s/${code}`;
      }

      setResult(data);
      toast.success('File berhasil diupload & QR dibuat!');
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
      toast.error('Gagal mendownload QR.');
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat autentikasi...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex flex-col">
      <Toaster position="top-center" />
      
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
            <ArrowLeft size={18} /> Kembali
          </button>
          <div className="flex items-center gap-3">
            <Globe className="text-purple-600" size={20} />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              File to QR Code
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto p-6 w-full">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-gray-100 p-6 mb-8 space-y-4">
          
          {/* Drop Zone */}
          <div 
            className="w-full border-2 border-dashed border-purple-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50/50 transition-colors bg-purple-50/20"
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center gap-3 text-purple-700">
                <Upload size={20} />
                <span className="text-sm font-medium truncate max-w-[250px]">{file.name}</span>
                <span className="text-xs text-purple-400 bg-purple-100 px-2 py-0.5 rounded-full">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-red-500 hover:text-red-700 text-xs ml-2">
                  Hapus
                </button>
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
              onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
            />
          </div>

          {/* Premium Section */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={handlePremiumToggle}
                id="premium-toggle"
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label htmlFor="premium-toggle" className="text-sm text-slate-700 flex items-center gap-1 cursor-pointer select-none">
                <Crown size={16} className="text-yellow-500" /> Premium (Custom slug & QR color)
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
                      placeholder="namafile (custom slug)"
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50/50"
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

          <button
            onClick={handleCreate}
            disabled={loading || !file}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-xl transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Upload & Generate QR ⚡'}
          </button>
        </div>

        {/* Result Area */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center relative overflow-hidden">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={18} /> Berhasil diupload!</div>
                  <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between border">
                    <span className="text-blue-600 font-medium truncate">{result.shortUrl}</span>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded">{copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}</button>
                  </div>
                  {result.fileUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <Download size={16} className="text-blue-500" /> 
                      <span>File tersimpan di cloud.</span>
                      <a href={result.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline ml-auto font-medium">
                        Lihat File
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={downloadQR} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">
                      <Download size={14} /> Download QR (PNG)
                    </button>
                  </div>
                </div>
                <div className="md:border-l md:pl-6 flex flex-col items-center border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 w-full md:w-auto">
                  <div ref={qrRef} className="bg-white p-2 border rounded shadow-sm">
                    <QRCodeSVG value={result.shortUrl} size={140} fgColor={design.fgColor} bgColor={design.bgColor} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">SCAN QR</p>
                </div>
              </div>

              {/* Visualisasi Template (Hanya untuk Premium) */}
              {isPremium && (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Palette size={20} className="text-purple-600" />
                    <h3 className="font-bold text-slate-800">Pilih Template Warna QR</h3>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Klik untuk mengganti warna</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Brand Oneklik', fg: '#0B2E24', bg: '#FAF8F3' },
                      { label: 'Emas Premium', fg: '#E8B448', bg: '#FFFFFF' },
                      { label: 'Modern Biru', fg: '#2563EB', bg: '#F8FAFC' },
                      { label: 'Elegant Ungu', fg: '#7C3AED', bg: '#F5F3FF' }
                    ].map((style, idx) => (
                      <div key={idx} onClick={() => setDesign({ fgColor: style.fg, bgColor: style.bg })} className="flex flex-col items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md bg-white border-slate-200">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                          <QRCodeSVG value={result.shortUrl} size={100} fgColor={style.fg} bgColor={style.bg} />
                        </div>
                        <p className="text-xs font-medium text-slate-600 mt-2">{style.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}