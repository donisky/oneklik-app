'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Crown, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function RegisterInstitution() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    studentDomain: '',   // misal: student.unsri.ac.id
    lecturerDomain: '',  // misal: fakultas.unsri.ac.id
    adminEmail: '',
    plan: 'basic'
  });

  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simpan data institusi
      const { data, error } = await supabase
        .from('institutions')
        .insert({
          name: formData.name,
          student_domain_pattern: formData.studentDomain || null,
          lecturer_domain_pattern: formData.lecturerDomain || null,
          admin_email: formData.adminEmail,
          subscription_plan: formData.plan,
          subscription_status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Institusi berhasil didaftarkan!');
      setStep(3);
    } catch (error: any) {
      toast.error('Gagal mendaftar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    { id: 'trial', label: 'Trial 30 Hari', price: 'Gratis', users: '50 Mahasiswa' },
    { id: 'basic', label: 'Paket Akademik', price: 'Rp 2.500.000/thn', users: '500 Mahasiswa' },
    { id: 'university', label: 'Paket Universitas', price: 'Rp 12.000.000/thn', users: '5.000+ Mahasiswa' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />
      
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-blue-200/50 border border-slate-100 max-w-3xl w-full">
        
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
                <Crown size={28} />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Daftarkan Institusi Anda</h1>
              <p className="text-sm text-slate-500 mt-2">Bergabunglah dengan Oneklik.id Ecosystem untuk verifikasi akademik digital.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Institusi / Kampus</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Universitas Sriwijaya"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Domain Mahasiswa</label>
                  <input
                    type="text"
                    required
                    value={formData.studentDomain}
                    onChange={(e) => setFormData({ ...formData, studentDomain: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="contoh: student.unsri.ac.id"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Mahasiswa dengan email @domain ini akan otomatis terdaftar sebagai student.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Domain Dosen</label>
                  <input
                    type="text"
                    required
                    value={formData.lecturerDomain}
                    onChange={(e) => setFormData({ ...formData, lecturerDomain: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="contoh: fakultas.unsri.ac.id"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dosen dengan email @domain ini akan otomatis terdaftar sebagai lecturer.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Admin Institusi</label>
                <input
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="admin@kampus.ac.id"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Pilih Paket Langganan</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setFormData({ ...formData, plan: p.id })}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all hover:shadow-md ${formData.plan === p.id ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-200' : 'border-slate-200'}`}
                    >
                      <h4 className="text-sm font-bold text-slate-800">{p.label}</h4>
                      <p className="text-xs text-slate-500 mb-1">{p.users}</p>
                      <p className="text-xs font-bold text-blue-600">{p.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100 text-blue-800 text-[11px]">
                <ShieldCheck size={16} className="flex-shrink-0" />
                <span>Data institusi dan mahasiswa Anda dienkripsi dan aman. Hanya dosen dari domain yang sama yang dapat mengakses data verifikasi.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Memproses...</> : 'Daftarkan Sekarang'}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="text-center py-10 space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto border-4 border-green-50">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Institusi Anda telah terdaftar. Mahasiswa dengan email <strong>{formData.studentDomain}</strong> dan dosen dengan email <strong>{formData.lecturerDomain}</strong> akan otomatis terikat saat login.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors mt-2"
            >
              Buka Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}