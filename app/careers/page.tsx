import Link from 'next/link';
import { ArrowLeft, Briefcase, MapPin } from 'lucide-react';

const jobs = [
  { title: 'Full Stack Developer (Next.js)', location: 'Remote / Jakarta', type: 'Full-time' },
  { title: 'UI/UX Designer', location: 'Remote', type: 'Full-time' },
  { title: 'Marketing Lead', location: 'Jakarta', type: 'Full-time' },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>
        <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">Bergabunglah dengan Tim Oneklik</h1>
          <p className="text-slate-500 mb-8">Kami sedang mencari talenta hebat untuk tumbuh bersama.</p>
          <div className="space-y-4">
            {jobs.map((job, idx) => (
              <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{job.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                  </div>
                </div>
                <button className="mt-3 md:mt-0 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Lamar Sekarang</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}