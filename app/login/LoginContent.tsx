'use client';

import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Lock } from 'lucide-react';
import { useState } from 'react';

export default function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${redirectTo}` },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
          <Lock size={28} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Admin</h1>
        <p className="text-slate-500 mb-6 text-sm">Silakan login menggunakan akun Google Anda yang terdaftar sebagai Admin.</p>
        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Login dengan Google'}
        </button>
      </div>
    </div>
  );
}