import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600">Memuat...</div>}>
      <LoginContent />
    </Suspense>
  );
}