'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  LayoutDashboard, Share2, Users, Wallet, FileText, BarChart3,
  Settings, Gift, Bell, CheckCircle2, Link as LinkIcon,
  MousePointerClick, TrendingUp, Zap, ChevronDown, Download, ArrowUpRight,
  Plus, History, CreditCard, ArrowRightLeft, Ticket, ChevronRight,
  X, Copy
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ============================================================
// ROUTE CONFIG
// 🔧 Sesuaikan path di bawah ini dengan struktur routing Next.js Anda
//    yang sebenarnya (App Router). Nilai untuk item sidebar diambil
//    langsung dari kode asli Anda — hanya dipindah ke satu tempat.
// ============================================================
const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  affiliate: '/affiliate',
  affiliateUsers: '/affiliate/users',
  promoMaterials: '/dashboard/promo',
  stats: '/dashboard/stats',
  settings: '/dashboard/settings',
  wallet: '/wallet',
};

const SHARE_TEXT = 'Dapatkan kemudahan tools digital all-in-one di Oneklik.id!';

type ReferredUser = {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  status: 'Upgrade' | 'Belum Upgrade';
  upgradePackage?: string;
  commission: number;
};

type Stats = {
  referralCode: string;
  referralLink: string;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  referredUsers: ReferredUser[];
};

type AggregateData = {
  totalAffiliates: number;
  totalCommissionThisMonth: number;
};

type StatusFilter = 'Semua Status' | 'Upgrade' | 'Belum Upgrade';

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

// ============================================================
// LOGO RESMI ONEKLIK.ID
// ============================================================
const OneklikLogo = () => (
  <div className="flex items-center gap-2.5 cursor-pointer">
    <Image
      src="/icon-oneklik.svg"
      width={32}
      height={32}
      alt="Oneklik Logo"
      className="w-8 h-8 shrink-0"
    />
    <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
      Oneklik.id
    </span>
  </div>
);

const shareToSocial = (platform: string, url: string, text: string) => {
  if (!url) {
    toast.error('Link afiliasi belum tersedia.');
    return;
  }
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  let shareUrl = '';

  if (platform === 'whatsapp') shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  else if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  else if (platform === 'telegram') shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  else if (platform === 'instagram') {
    navigator.clipboard.writeText(url);
    toast.success('Link disalin! Silakan tempel di Bio/Story Instagram Anda.');
    return;
  }

  if (shareUrl) window.open(shareUrl, '_blank');
};

// Daftar platform share — dipindah ke luar komponen supaya bisa dipakai ulang
// di banner utama maupun modal detail affiliate (hindari duplikasi SVG).
const SOCIAL_PLATFORMS = [
  {
    name: 'whatsapp',
    bg: 'bg-[#25D366] hover:bg-[#1ebe5a]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: 'telegram',
    bg: 'bg-[#26A5E4] hover:bg-[#1f8fc7]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'instagram',
    bg: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: 'facebook',
    bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'twitter',
    bg: 'bg-black hover:bg-gray-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function AffiliateClient() {
  // --- STATE DATA ---
  const [stats, setStats] = useState<Stats>({
    referralCode: '',
    referralLink: '',
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalCommission: 0,
    pendingCommission: 0,
    paidCommission: 0,
    referredUsers: []
  });

  const [aggregate, setAggregate] = useState<AggregateData>({ totalAffiliates: 0, totalCommissionThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({ fullName: '', avatarUrl: '' });
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  // State: notifikasi
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // State: modal detail program affiliate
  const [showAffiliateDetail, setShowAffiliateDetail] = useState(false);

  // State: modal info sistem tracking
  const [showTrackingInfo, setShowTrackingInfo] = useState(false);

  // State: filter tabel pengguna
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Semua Status');

  const router = useRouter();
  const supabase = createClientComponentClient();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef<{ x: number | undefined; y: number | undefined }>({ x: undefined, y: undefined });
  const walletPopupRef = useRef<HTMLDivElement>(null);
  const notifPopupRef = useRef<HTMLDivElement>(null);

  // --- CLICK OUTSIDE UNTUK POPUP WALLET & NOTIFIKASI ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletPopupRef.current && !walletPopupRef.current.contains(event.target as Node)) {
        setIsWalletOpen(false);
      }
      if (notifPopupRef.current && !notifPopupRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FETCH DATA UTAMA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          setLoading(false);
          return;
        }

        console.log('🔐 User logged in:', user.id, user.email);

        // 1. Profil user
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        const avatar = profile?.avatar_url || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || user.email || 'U')}&background=random`;
        setUserData({
          fullName: profile?.full_name || user.email?.split('@')[0] || 'User',
          avatarUrl: avatar
        });

        // 2. Saldo wallet (gabungan affiliate + shop)
        const { data: walletData } = await supabase
          .from('wallets')
          .select('affiliate_balance, shop_balance')
          .eq('user_id', user.id)
          .maybeSingle();

        if (walletData) {
          setWalletBalance((walletData.affiliate_balance || 0) + (walletData.shop_balance || 0));
        }

        // 3. Aggregate global
        fetch('/api/affiliate/aggregate')
          .then(res => res.json())
          .then(data => {
            if (data && typeof data.totalAffiliates === 'number') {
              setAggregate(data);
            }
          })
          .catch(() => {});

        // 4. Pastikan user punya affiliate_profiles
        const { data: existingAffiliate, error: affError } = await supabase
          .from('affiliate_profiles')
          .select('referral_code, referral_link')
          .eq('user_id', user.id)
          .maybeSingle();

        let finalReferralCode = '';
        let finalReferralLink = '';

        if (affError) {
          console.error('Error checking affiliate profile:', affError);
        }

        if (!existingAffiliate) {
          // Buat referral code unik
          const base = user.email?.split('@')[0] || 'user';
          const random = Math.random().toString(36).substring(2, 6);
          const newCode = `${base}${random}`;
          const newLink = `https://oneklik.my.id/r/${newCode}`;

          const { error: insertError } = await supabase
            .from('affiliate_profiles')
            .insert({
              user_id: user.id,
              referral_code: newCode,
              referral_link: newLink,
              total_clicks: 0,
              total_conversions: 0,
              total_commission: 0,
              pending_commission: 0,
              paid_commission: 0,
            });

          if (!insertError) {
            finalReferralCode = newCode;
            finalReferralLink = newLink;
            console.log('✅ Affiliate profile created for user:', user.id);
          } else {
            console.error('❌ Failed to create affiliate profile:', insertError);
          }
        } else {
          finalReferralCode = existingAffiliate.referral_code;
          finalReferralLink = existingAffiliate.referral_link || `https://oneklik.my.id/r/${finalReferralCode}`;
          console.log('✅ Existing affiliate code found:', finalReferralCode);
        }

        // ⚠️ UPDATE LINK AFILIASI KE UI SEBELUM PANGGIL API
        if (finalReferralCode) {
          setStats(prev => ({
            ...prev,
            referralCode: finalReferralCode,
            referralLink: finalReferralLink
          }));
          console.log('📌 Link afiliasi sudah diset ke UI:', finalReferralLink);
        }

        // 5. Ambil data statistik afiliasi dari API (Opsional, tidak mempengaruhi link)
        if (user.email) {
          try {
            const resStats = await fetch(`/api/affiliate/stats?email=${encodeURIComponent(user.email)}`);
            if (resStats.ok) {
              const dataStats = await resStats.json();
              if (dataStats) {
                const code = dataStats.referralCode || dataStats.referral_code || finalReferralCode;
                const link = dataStats.referralLink || finalReferralLink;
                setStats(prev => ({
                  ...prev,
                  referralCode: code,
                  referralLink: link,
                  totalClicks: typeof dataStats.totalClicks === 'number' ? dataStats.totalClicks : prev.totalClicks,
                  totalConversions: typeof dataStats.totalConversions === 'number' ? dataStats.totalConversions : prev.totalConversions,
                  conversionRate: typeof dataStats.conversionRate === 'number' ? dataStats.conversionRate : prev.conversionRate,
                  totalCommission: typeof dataStats.totalCommission === 'number' ? dataStats.totalCommission : prev.totalCommission,
                  pendingCommission: typeof dataStats.pendingCommission === 'number' ? dataStats.pendingCommission : prev.pendingCommission,
                  paidCommission: typeof dataStats.paidCommission === 'number' ? dataStats.paidCommission : prev.paidCommission,
                  referredUsers: Array.isArray(dataStats.referredUsers) ? dataStats.referredUsers : prev.referredUsers
                }));
                console.log('📊 API stats berhasil, memperbarui data komisi');
              }
            } else {
              console.warn('⚠️ API stats 404 atau error, tetapi link afiliasi tetap muncul');
            }
          } catch (err) {
            console.warn('⚠️ Error fetch stats, using fallback referral from DB');
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Error utama:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  // --- CANVAS DOT MATRIX (Sama seperti sebelumnya) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const points: { x: number; y: number; originX: number; originY: number; z: number }[] = [];
    const gridSize = 40;

    const init = () => {
      points.length = 0;
      if (!canvas) return;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          points.push({
            x: i * gridSize,
            y: j * gridSize,
            originX: i * gridSize,
            originY: j * gridSize,
            z: 0
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      points.forEach(p => {
        if (mousePos.current.x !== undefined && mousePos.current.y !== undefined) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = mousePos.current.x - rect.left;
          const mouseY = mousePos.current.y - rect.top;

          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 150;

          if (dist < maxDist) {
            const angle = Math.atan2(dy, dx);
            const force = (maxDist - dist) / maxDist;
            p.x += Math.cos(angle) * force * 3;
            p.y += Math.sin(angle) * force * 3;
            p.z = force * 10;
          }
        }

        p.x += (p.originX - p.x) * 0.1;
        p.y += (p.originY - p.y) * 0.1;
        p.z += (0 - p.z) * 0.1;

        ctx.beginPath();
        const radius = 1.5 + (p.z / 3);
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 70, 229, ${0.25 + (p.z / 15)})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        init();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseOut = () => {
      mousePos.current = { x: undefined, y: undefined };
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const copyToClipboard = (text: string, label = 'Link afiliasi') => {
    if (!text) {
      toast.error('Link afiliasi belum tersedia.');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  // ==========================================
  // FILTER TABEL PENGGUNA (client-side, data yang sudah dimuat)
  // ==========================================
  const filteredUsers = useMemo(() => {
    if (statusFilter === 'Semua Status') return stats.referredUsers;
    return stats.referredUsers.filter(u => u.status === statusFilter);
  }, [stats.referredUsers, statusFilter]);

  // ==========================================
  // EKSPOR DATA PENGGUNA KE CSV (client-side, tanpa backend tambahan)
  // ==========================================
  const exportUsersCSV = () => {
    if (!filteredUsers.length) {
      toast.error('Tidak ada data pengguna untuk diekspor.');
      return;
    }
    const header = ['No', 'Nama', 'Email', 'Tanggal Daftar', 'Status', 'Paket Upgrade', 'Komisi'];
    const rows = filteredUsers.map((u, i) => [
      String(i + 1), u.name, u.email, u.joinedDate, u.status, u.upgradePackage || '-', String(u.commission)
    ]);
    const csvContent = [header, ...rows]
      .map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-affiliate-oneklik-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data pengguna berhasil diekspor ke CSV.');
  };

  // ==========================================
  // NOTIFIKASI — dibangun dari pengguna yang mendaftar (data nyata, tanpa tabel baru)
  // ==========================================
  const notificationItems = useMemo(() => {
    return stats.referredUsers.slice(0, 6).map(u => ({
      id: u.id,
      title: u.status === 'Upgrade' ? 'Upgrade Premium Baru 🎉' : 'Pendaftaran Baru',
      desc: u.status === 'Upgrade'
        ? `${u.name} upgrade ke ${u.upgradePackage || 'Premium'} • Komisi ${formatRupiah(u.commission)}`
        : `${u.name} mendaftar melalui link Anda`,
      time: u.joinedDate,
    }));
  }, [stats.referredUsers]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <Toaster position="top-center" />

      <canvas id="dot-matrix-canvas" ref={canvasRef} className="absolute inset-0 z-0 opacity-80 pointer-events-none" />

      {/* ================= MODAL DETAIL PROGRAM AFFILIATE ================= */}
      <AnimatePresence>
        {showAffiliateDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAffiliateDetail(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-7 py-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Gift size={18} />
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">Program Affiliate Anda</h3>
                </div>
                <button onClick={() => setShowAffiliateDetail(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-7 overflow-y-auto space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kode Referral</p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="flex-1 font-mono font-bold text-slate-800 text-sm truncate">{stats.referralCode || '—'}</span>
                    <button onClick={() => copyToClipboard(stats.referralCode, 'Kode referral')} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Link Referral</p>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <span className="flex-1 text-slate-700 text-sm truncate">{stats.referralLink || 'Belum tersedia'}</span>
                    <button onClick={() => copyToClipboard(stats.referralLink, 'Link afiliasi')} className="text-slate-400 hover:text-blue-600 transition-colors shrink-0">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white">
                  <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-2">Komisi 20% Seumur Hidup</p>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-300 text-xs">Upgrade Premium</p>
                      <p className="font-extrabold text-white">Rp 100.000</p>
                    </div>
                    <span className="text-blue-400 font-bold">&rarr;</span>
                    <div className="text-right">
                      <p className="text-slate-300 text-xs">Komisi Anda</p>
                      <p className="font-extrabold text-emerald-400">Rp 20.000</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bagikan ke media sosial</p>
                  <div className="flex flex-wrap gap-2.5">
                    {SOCIAL_PLATFORMS.map((soc, idx) => (
                      <button
                        key={idx}
                        onClick={() => shareToSocial(soc.name, stats.referralLink, SHARE_TEXT)}
                        disabled={!stats.referralLink || loading}
                        className={`flex items-center justify-center w-11 h-11 rounded-2xl text-white transition-all shadow-sm ${soc.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {soc.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL INFO SISTEM TRACKING ================= */}
      <AnimatePresence>
        {showTrackingInfo && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTrackingInfo(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.15)] overflow-hidden relative z-10"
            >
              <div className="px-7 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-slate-900">Sistem Tracking Affiliate</h3>
                <button onClick={() => setShowTrackingInfo(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="p-7 space-y-5">
                {[
                  { icon: MousePointerClick, title: 'Pencatatan Klik', desc: 'Setiap klik pada link referral Anda tercatat otomatis berdasarkan kode referral unik Anda.' },
                  { icon: Users, title: 'Atribusi Pendaftaran', desc: 'Saat seseorang mendaftar lewat link Anda, akun mereka tertaut ke kode referral Anda.' },
                  { icon: Wallet, title: 'Komisi Otomatis', desc: 'Ketika mereka upgrade ke Premium, komisi 20% langsung ditambahkan ke saldo Wallet Anda.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <item.icon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-800">{item.title}</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className="w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200/80 hidden lg:flex flex-col justify-between sticky top-0 h-screen z-20 shadow-sm">
        <div>
          <div className="p-6 flex items-center gap-2.5" onClick={() => router.push(ROUTES.dashboard)}>
            <OneklikLogo />
          </div>

          <div className="px-4 py-2 space-y-1">
            {[
              { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.dashboard },
              { label: 'Affiliate', icon: Share2, href: ROUTES.affiliate, active: true },
              { label: 'Pengguna Saya', icon: Users, href: ROUTES.affiliateUsers },
              { label: 'Materi Promosi', icon: FileText, href: ROUTES.promoMaterials },
              { label: 'Statistik', icon: BarChart3, href: ROUTES.stats },
              { label: 'Pengaturan', icon: Settings, href: ROUTES.settings },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  item.active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 m-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20">
            <Gift size={20} />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-1">Ajak Teman, Dapatkan Komisi</h4>
          <p className="text-xs text-slate-500 mb-3">Setiap upgrade Premium melalui link Anda</p>
          <button
            onClick={() => setShowAffiliateDetail(true)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
            disabled={loading || !stats.referralLink}
          >
            {loading ? 'Memuat...' : 'Lihat Detail Program →'}
          </button>
        </div>

        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          <p>© 2026 Oneklik.id</p>
          <p>All rights reserved.</p>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-20 px-6 md:px-10 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(ROUTES.home)} className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
              ← Kembali ke Beranda
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* POPUP WALLET */}
            <div className="relative" ref={walletPopupRef}>
              <button
                onClick={() => setIsWalletOpen(!isWalletOpen)}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                <Wallet size={16} className="text-blue-600" />
                <span className="hidden sm:inline-block">{loading ? '...' : formatRupiah(walletBalance)}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isWalletOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isWalletOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-5 border-b border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Wallet size={18} className="text-blue-600" />
                        <span className="font-bold text-slate-900 text-sm">Dompet Digital</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">Saldo Anda</p>
                      <h3 className="text-2xl font-black text-slate-900 mb-4">{formatRupiah(walletBalance)}</h3>
                      <button onClick={() => router.push(ROUTES.wallet)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Top Up Saldo
                      </button>
                    </div>

                    <div className="py-2">
                      {[
                        { icon: History, label: 'Riwayat Transaksi' },
                        { icon: CreditCard, label: 'Tarik Saldo' },
                        { icon: ArrowRightLeft, label: 'Transfer Saldo' },
                        { icon: Ticket, label: 'Voucher & Promo' }
                      ].map((item, idx) => (
                        <button key={idx} onClick={() => router.push(ROUTES.wallet)} className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-slate-700 group">
                          <div className="flex items-center gap-3">
                            <item.icon size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-sm font-semibold">{item.label}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </button>
                      ))}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                      <button onClick={() => router.push(ROUTES.wallet)} className="w-full text-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1">
                        Lihat Semua di Wallet <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NOTIFIKASI */}
            <div className="relative hidden sm:block" ref={notifPopupRef}>
              <button onClick={() => setIsNotifOpen(v => !v)} className="relative p-2 text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-full transition-colors">
                <Bell size={18} />
                {notificationItems.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">Notifikasi</span>
                      {notificationItems.length > 0 && <span className="text-[11px] font-bold text-blue-600">{notificationItems.length} aktivitas</span>}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                      {notificationItems.length === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-400 font-medium">Belum ada aktivitas terbaru</div>
                      ) : notificationItems.map(n => (
                        <div key={n.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors">
                          <p className="text-[13px] font-bold text-slate-800">{n.title}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{n.desc}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setIsNotifOpen(false); router.push(ROUTES.affiliateUsers); }} className="w-full py-3 text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100">
                      Lihat Semua Pengguna
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* HEADER USER */}
            <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-slate-200">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative border border-slate-300 shadow-sm">
                <Image
                  src={userData.avatarUrl}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-bold text-sm text-slate-900 leading-tight">
                  {loading ? 'Memuat...' : userData.fullName || 'User'}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-0.5 border border-blue-100">
                  Affiliator
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 space-y-8 max-w-[1400px] w-full mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Affiliate Dashboard</h1>
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Affiliator Aktif
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Anda sudah terdaftar sebagai afiliator secara otomatis.</p>
            </div>
          </div>

          {/* GRID ATAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* BANNER KIRI */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-blue-500/20">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold mb-1">Bagikan Link Unik Anda</h2>
                    <p className="text-blue-100 text-sm">Setiap klik dan pendaftaran dari link Anda akan tercatat secara otomatis.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-center shadow-inner">
                    <span className="block text-[10px] text-blue-200 uppercase font-bold">Komisi</span>
                    <span className="text-xl font-extrabold">20%</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 my-6 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
                  <span className="flex-1 text-white font-medium text-sm md:text-base break-all px-2">
                    {loading ? 'Memuat link...' : (stats.referralLink || 'Belum ada link afiliasi')}
                  </span>
                  <button
                    onClick={() => copyToClipboard(stats.referralLink)}
                    disabled={!stats.referralLink || loading}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <LinkIcon size={16} /> Salin Link
                  </button>
                </div>
              </div>

              {/* BAGIAN SHARE SOSIAL MEDIA */}
              <div>
                <p className="text-xs text-blue-200 mb-3 font-medium">Bagikan ke media sosial:</p>
                <div className="flex flex-wrap gap-2.5">
                  {SOCIAL_PLATFORMS.map((soc, idx) => (
                    <button
                      key={idx}
                      onClick={() => shareToSocial(soc.name, stats.referralLink, SHARE_TEXT)}
                      disabled={!stats.referralLink || loading}
                      className={`flex items-center justify-center w-11 h-11 rounded-2xl text-white transition-all shadow-sm ${soc.bg} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {soc.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RINGKASAN KOMISI */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-2xl flex flex-col justify-between border border-slate-800">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Ringkasan Komisi</h3>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                    <Wallet size={16} className="text-blue-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Total Komisi</p>
                    <p className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                      {loading ? 'Rp 0' : formatRupiah(stats.totalCommission || 0)}
                    </p>
                    <span className="text-xs text-emerald-400 font-medium inline-flex items-center gap-1 mt-1">
                      <TrendingUp size={12} /> {loading ? '0%' : '+0% dari bulan lalu'}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400">Komisi Tertunda</p>
                      <p className="font-bold text-slate-200 text-sm mt-0.5">
                        {loading ? 'Rp 0' : formatRupiah(stats.pendingCommission || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400">Total Dibayarkan</p>
                      <p className="font-bold text-emerald-400 text-sm mt-0.5">
                        {loading ? 'Rp 0' : formatRupiah(stats.paidCommission || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push(ROUTES.wallet)}
                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors border border-white/10 shadow-sm"
              >
                Lihat Semua Riwayat &rarr;
              </button>
            </div>
          </div>

          {/* STATS CARDS 4 KOLOM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Klik', value: stats.totalClicks.toLocaleString(), note: '+0% dari bulan lalu', icon: MousePointerClick, color: 'text-blue-600 bg-blue-50' },
              { title: 'Pendaftaran', value: stats.totalConversions.toLocaleString(), note: '+0% dari bulan lalu', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
              { title: 'Upgrade Premium', value: stats.referredUsers.filter(u => u.status === 'Upgrade').length.toLocaleString(), note: '+0% dari bulan lalu', icon: Zap, color: 'text-purple-600 bg-purple-50' },
              { title: 'Komisi Diperoleh', value: formatRupiah(stats.totalCommission || 0), note: '+0% dari bulan lalu', icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
            ].map((card, idx) => (
              <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:shadow-lg transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{card.title}</span>
                    <div className={`w-10 h-10 rounded-2xl ${card.color} flex items-center justify-center shadow-inner`}>
                      <card.icon size={20} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {loading ? 'Memuat...' : card.value}
                  </h3>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <TrendingUp size={14} /> {loading ? '0%' : card.note}
                </div>
              </div>
            ))}
          </div>

          {/* TABEL PENGGUNA YANG MENDAFTAR */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-xl text-slate-950">Pengguna yang Mendaftar Melalui Link Anda</h3>
                <p className="text-sm text-slate-500 mt-0.5">Daftar lengkap pengguna yang bergabung melalui link affiliate Anda.</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl px-4 py-2.5 outline-none shadow-sm cursor-pointer"
                >
                  <option value="Semua Status">Semua Status</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="Belum Upgrade">Belum Upgrade</option>
                </select>
                <button onClick={exportUsersCSV} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20">
                  <Download size={16} /> Export Data
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-4 px-6">#</th>
                    <th className="py-4 px-6">Pengguna</th>
                    <th className="py-4 px-6">Tanggal Daftar</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Upgrade</th>
                    <th className="py-4 px-6 text-right">Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-400">Memuat data...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        {stats.referredUsers.length === 0
                          ? 'Belum ada pengguna yang mendaftar melalui link Anda.'
                          : `Tidak ada pengguna dengan status "${statusFilter}".`}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 text-slate-400">{idx + 1}</td>
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0 shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500">{user.joinedDate}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            user.status === 'Upgrade' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {user.upgradePackage ? (
                            <span className="inline-block bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                              {user.upgradePackage}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900">
                          {user.commission > 0 ? formatRupiah(user.commission) : <span className="text-slate-400 font-normal">Rp 0</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 text-center">
              <button onClick={() => router.push(ROUTES.affiliateUsers)} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Lihat Semua Pengguna &rarr;
              </button>
            </div>
          </div>

          {/* CARA KERJA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 mb-2">Cara Kerja Affiliate</h3>
                <p className="text-sm text-slate-500 mb-8">Pahami alur kerja program afiliasi Oneklik.id dengan mudah.</p>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'Bagikan Link', desc: 'Bagikan link unik Anda ke teman, media sosial, atau komunitas.' },
                    { step: '2', title: 'Mereka Daftar & Upgrade', desc: 'Mereka mendaftar dan upgrade ke Premium melalui link Anda.' },
                    { step: '3', title: 'Dapatkan Komisi', desc: 'Anda mendapatkan komisi 20% secara otomatis.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 mt-0.5 border border-blue-100 shadow-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-extrabold text-xl text-white">Komisi 20% Seumur Hidup 🚀</h3>
                    <p className="text-sm text-blue-200 mt-1">Dapatkan komisi 20% dari setiap upgrade Premium yang dilakukan oleh pengguna yang mendaftar melalui link Anda.</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-6 shadow-inner">
                  <span className="text-xs text-blue-300 font-bold uppercase tracking-wider block mb-2">Contoh Perhitungan</span>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-slate-300 text-xs">Upgrade Premium</p>
                      <p className="font-extrabold text-lg text-white">Rp 100.000</p>
                    </div>
                    <span className="text-blue-400 font-bold">&rarr;</span>
                    <div className="text-right">
                      <p className="text-slate-300 text-xs">Komisi Anda (20%)</p>
                      <p className="font-extrabold text-lg text-emerald-400">Rp 20.000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BANNER */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sistem Tracking Akurat</h4>
                <p className="text-xs text-slate-500">Kami mencatat setiap klik dan pendaftaran dengan teknologi tracking canggih untuk memastikan komisi Anda terhitung dengan benar.</p>
              </div>
            </div>
            <button onClick={() => setShowTrackingInfo(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 px-5 py-3 rounded-xl transition-colors shrink-0 shadow-sm">
              Pelajari Sistem Tracking &rarr;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}