'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Link as LinkIcon, FileText, Upload, Copy, CheckCircle2, 
  ArrowLeft, Download, QrCode, Loader2
} from 'lucide-react';

export default function ShortenerPage() {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  const [inputUrl, setInputUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string; fileUrl?: string } | null>(null);
  const [copied, setCopied] = useState(false);
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
        response = await fetch('/api/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: inputUrl, mode: 'link' }),
        });
      } else {
        if (!file) { toast.error('Pilih file terlebih dahulu!'); return; }
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch('/api/file-upload', { method: 'POST', body: formData });
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal membuat short link');
      
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
            <ArrowLeft size={18} /> Kembali
          </button>
          <h1 className="text-xl font-bold text-slate-800">Short Link & QR Code</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto p-6 w-full">
        {/* Mode Selector (Card seperti MyQRCode) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => { setMode('link'); setResult(null); setFile(null); }}
            className={`p-8 rounded-2xl border-2 transition-all text-left hover:shadow-md ${
              mode === 'link' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <LinkIcon size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">Short Link</h3>
            <p className="text-sm text-slate-500">Persingkat URL panjang menjadi link pendek.</p>
          </button>

          <button
            onClick={() => { setMode('file'); setResult(null); setInputUrl(''); }}
            className={`p-8 rounded-2xl border-2 transition-all text-left hover:shadow-md ${
              mode === 'file' ? 'border-purple-500 bg-purple-50/50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">File to Link</h3>
            <p className="text-sm text-slate-500">Upload file & dapatkan link + QR code.</p>
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          {mode === 'link' ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/link-panjang-ini-mau-dipendekkan"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleCreate}
                disabled={loading || !inputUrl}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Buat Link'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div 
                className="flex-1 w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center gap-3 text-blue-600">
                    <Upload size={20} />
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-400 mb-2" size={28} />
                    <p className="text-sm font-medium text-gray-600">Klik atau drag & drop file di sini</p>
                    <p className="text-xs text-gray-400 mt-1">Maksimal 10 MB</p>
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
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Upload'}
              </button>
            </div>
          )}
        </div>

        {/* Result Area */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 size={18} />
                <span className="font-medium text-sm">Berhasil dibuat!</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between gap-2">
                <span className="text-sm text-blue-600 font-medium truncate">{result.shortUrl}</span>
                <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded-lg transition-colors">
                  {copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-500" />}
                </button>
              </div>

              {mode === 'file' && result.fileUrl && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Download size={14} /> 
                  <a href={result.fileUrl} target="_blank" rel="noreferrer" className="hover:underline">
                    Download File Asli
                  </a>
                </div>
              )}

              <div className="flex gap-3">
                <a href={result.shortUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <QrCode size={14} /> Buka di tab baru
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l pl-8 border-gray-100">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <QRCodeSVG value={result.shortUrl} size={140} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Scan QR untuk buka link</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}