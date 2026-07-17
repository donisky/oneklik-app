'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import { Upload, CheckCircle2, ArrowLeft, Crown, Loader2, Download } from 'lucide-react';

export default function FileQRPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [design, setDesign] = useState({ fgColor: '#000000', bgColor: '#ffffff', logo: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; fileUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) { toast.error('Pilih file!'); return; }
    if (isPremium && !customSlug) {
      toast.error('Custom slug wajib diisi untuk Premium!');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Login dulu'); router.push('/upgrade'); return; }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('isPremium', String(isPremium));
      if (isPremium) formData.append('customSlug', customSlug);
      formData.append('design', JSON.stringify(design));

      const res = await fetch('/api/file-qr', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast.success('File berhasil diupload! QR code siap.');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600"><ArrowLeft size={18} /> Kembali</button>
          <h1 className="text-xl font-bold text-slate-800">File to QR Code</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50" onClick={() => fileInputRef.current?.click()}>
            {file ? (
              <div className="flex items-center gap-3 text-blue-600 justify-center">
                <Upload size={24} />
                <span className="font-medium">{file.name}</span>
                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                <p className="text-sm font-medium text-gray-600">Klik atau drag & drop file</p>
                <p className="text-xs text-gray-400">Maks 10 MB</p>
              </>
            )}
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          </div>

          {/* Premium Toggle */}
          <div className="flex items-center gap-3 mt-4">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} id="premium-toggle" className="w-4 h-4 text-purple-600" />
            <label htmlFor="premium-toggle" className="text-sm flex items-center gap-1"><Crown size={14} className="text-yellow-500" /> Premium: Custom slug & QR color</label>
          </div>

          {/* Premium Options */}
          {isPremium && (
            <div className="mt-3 space-y-3 border-t pt-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Custom Slug</label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="myfile"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Warna QR</label>
                <input type="color" value={design.fgColor} onChange={(e) => setDesign({ ...design, fgColor: e.target.value })} className="w-8 h-8 p-1 border rounded ml-2" />
              </div>
            </div>
          )}

          <button onClick={handleUpload} disabled={loading || !file} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Upload & Generate QR'}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={18} /> Berhasil!</div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <a href={result.shortUrl} target="_blank" className="text-blue-600 font-medium truncate block">{result.shortUrl}</a>
                <a href={result.fileUrl} target="_blank" className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Download size={14} /> Download file asli</a>
              </div>
            </div>
            <div className="border-l pl-6 flex flex-col items-center">
              <div className="bg-white p-2 border rounded shadow-sm">
                <QRCodeSVG value={result.shortUrl} size={140} fgColor={design.fgColor || '#000000'} bgColor={design.bgColor || '#ffffff'} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Scan QR untuk download file</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}