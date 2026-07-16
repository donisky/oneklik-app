'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import toast, { Toaster } from 'react-hot-toast';
import { Link as LinkIcon, Copy, CheckCircle2, ArrowLeft, Crown, Paintbrush, Loader2 } from 'lucide-react';

export default function URLShortenerPage() {
  const [url, setUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [design, setDesign] = useState({ fgColor: '#000000', bgColor: '#ffffff', logo: null });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; shortCode: string; design: any } | null>(null);
  const [copied, setCopied] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleCreate = async () => {
    if (!url.trim()) { toast.error('Masukkan URL!'); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Login dulu'); router.push('/upgrade'); return; }

      const res = await fetch('/api/url-shortener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customSlug: isPremium ? customSlug : undefined, design: isPremium ? design : undefined, isPremium }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast.success('Short link berhasil dibuat!');
    } catch (err: any) { toast.error(err.message); } finally { setLoading(false); }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link disalin!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600"><ArrowLeft size={18} /> Kembali</button>
          <h1 className="text-xl font-bold text-slate-800">URL Shortener & QR</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Input */}
          <div className="flex flex-col gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/panjang-ini-mau-dipendekkan"
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm"
            />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  id="premium-toggle"
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="premium-toggle" className="text-sm text-slate-700 flex items-center gap-1">
                  <Crown size={14} className="text-yellow-500" /> Premium (Custom slug & QR design)
                </label>
              </div>
            </div>
            {isPremium && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3">
                <input
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="Custom slug (misal: mylink)"
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <label className="text-xs">QR Color</label>
                  <input
                    type="color"
                    value={design.fgColor}
                    onChange={(e) => setDesign({ ...design, fgColor: e.target.value })}
                    className="w-8 h-8 p-1 border rounded"
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Buat Short Link + QR'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={18} /> Berhasil!</div>
              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border">
                <span className="text-blue-600 font-medium truncate">{result.shortUrl}</span>
                <button onClick={copy} className="p-2 hover:bg-white rounded">{copied ? <CheckCircle2 size={16} className="text-green-600" /> : <Copy size={16} />}</button>
              </div>
              <p className="text-xs text-gray-400">Buka di browser atau scan QR</p>
            </div>
            <div className="border-l pl-6 flex flex-col items-center">
              <div className="bg-white p-2 border rounded shadow-sm">
                <QRCodeSVG value={result.shortUrl} size={140} fgColor={result.design?.fgColor || '#000000'} bgColor={result.design?.bgColor || '#ffffff'} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Scan untuk buka</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}