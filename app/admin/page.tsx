'use client';

import { useEffect, useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { supabase } from '@/lib/supabase'; // Pastikan koneksi supabase client
import { Sparkles, TrendingUp, FileText, Users } from 'lucide-react';

const dummyData = [
  { name: 'Sen', views: 120 }, { name: 'Sel', views: 210 }, 
  { name: 'Rab', views: 80 }, { name: 'Kam', views: 160 }, 
  { name: 'Jum', views: 240 }, { name: 'Sab', views: 320 }, 
  { name: 'Min', views: 180 }
];

export default function AdminDashboard() {
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Fungsi meminta saran dari AI Groq
  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      // Kirim data dummy atau data real dari database ke API
      const res = await fetch('/api/admin/insight', { method: 'POST' });
      const data = await res.json();
      setInsight(data.suggestion);
    } catch {
      setInsight('Gagal memuat saran AI.');
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Admin</h1>
        <button 
          onClick={generateInsight}
          disabled={loadingInsight}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Sparkles size={18} className={loadingInsight ? 'animate-spin' : ''} />
          {loadingInsight ? 'Menganalisis...' : 'Generate Saran AI'}
        </button>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">1,240</p>
          <p className="text-sm text-slate-500">Pengunjung Minggu Ini</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">6</p>
          <p className="text-sm text-slate-500">Total Artikel Blog</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-2xl font-bold text-slate-800">15.2%</p>
          <p className="text-sm text-slate-500">Pertumbuhan Trafik</p>
        </div>
      </div>

      {/* Bagan Analitik */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Grafik Trafik Mingguan</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#0B2E24" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ruang Saran AI (Groq) */}
      {insight && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 p-6 rounded-2xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
            <Sparkles className="text-purple-600" /> Saran AI untuk Konten Anda
          </h3>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
        </div>
      )}
    </div>
  );
}