'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Box, Users, Wallet, ArrowUpRight,
  History, FileText, Settings, HelpCircle, Bell, ChevronRight,
  HelpCircleIcon, ArrowRightLeft, ShieldCheck,
  MoreVertical, ChevronDown, Lock, CheckCircle, X,
  Landmark, Loader2, CreditCard, Smartphone, User, Plus, Download,
  Search, Copy, Printer, FileDown
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// ==========================================
// 0. ROUTE CONFIG
// ==========================================
const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  order: '/dashboard/order',
  produk: '/dashboard/produk-digital',
  affiliate: '/dashboard/affiliate',
  wallet: '/dashboard/wallet',
  laporan: '/dashboard/laporan',
  pengaturan: '/dashboard/pengaturan',
  premium: '/dashboard/premium',
};

const SUPPORT_EMAIL = 'support@oneklik.id';

// ==========================================
// 1. SETUP SUPABASE CLIENT
// ==========================================
const supabase = createClientComponentClient();

// ==========================================
// 2. TYPES & INTERFACES
// ==========================================
type WalletBalances = {
  id: string;
  user_id: string;
  affiliate_balance: number;
  shop_balance: number;
};

type Transaction = {
  id: string;
  title: string;
  order_id: string;
  type: 'Pemasukan' | 'Penarikan' | 'Transfer';
  source: 'Affiliate' | 'Shop';
  amount: number;
  created_at: string;
  destination_detail?: string;
};

type ActionType = 'withdraw_aff' | 'withdraw_shop' | 'transfer_to_shop' | 'transfer_to_aff' | 'topup' | null;
type DestType = 'Bank' | 'E-Wallet';
type TopupDestType = 'Shop' | 'Affiliate';
type HistoryFilter = 'Semua' | 'Pemasukan' | 'Penarikan' | 'Transfer';

// ==========================================
// 3. HELPER FUNCTIONS & STYLES
// ==========================================
const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date) + ' WIB';
};

const getMidtransBankCode = (providerName: string): string => {
  const map: Record<string, string> = {
    'BCA': 'bca', 'Mandiri': 'mandiri', 'BNI': 'bni', 'BRI': 'bri',
    'BSI': 'bsm', 'CIMB Niaga': 'cimb', 'Permata': 'permata', 'Bank Jago': 'artos', 'Seabank': 'kesejahteraan_ekonomi',
    'GoPay': 'gopay', 'OVO': 'ovo', 'DANA': 'dana', 'ShopeePay': 'shopeepay', 'LinkAja': 'linkaja'
  };
  return map[providerName] || 'unknown';
};

const glassPlatinum = "bg-white/50 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_8px_32px_rgba(0,0,0,0.06)]";
const glassButton = "bg-white/60 backdrop-blur-xl border border-white/90 shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:bg-white/90 transition-all";
const glassInput = "w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-blue-400 outline-none backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all shadow-inner";

const BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga', 'Permata', 'Bank Jago', 'Seabank'];
const EWALLETS = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'];
const HISTORY_PAGE_SIZE = 15;

const txIcon = (tx: Transaction, size = 20) => {
  if (tx.type === 'Penarikan') return <ArrowUpRight size={size} />;
  if (tx.type === 'Transfer') return <ArrowRightLeft size={size} />;
  if (tx.title.includes('Top Up')) return <Download size={size} />;
  return tx.source === 'Affiliate' ? <Users size={size} /> : <ShoppingBag size={size} />;
};

export default function WalletPage() {
  const router = useRouter();

  // State Utama
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [actionType, setActionType] = useState<ActionType>(null);
  const [amountStr, setAmountStr] = useState<string>('');
  const [destType, setDestType] = useState<DestType>('Bank');
  const [provider, setProvider] = useState<string>('BCA');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [topupDest, setTopupDest] = useState<TopupDestType>('Shop');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // State: notifikasi
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // State: detail transaksi
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  // State: riwayat lengkap
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [fullHistory, setFullHistory] = useState<Transaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('Semua');
  const [historySearch, setHistorySearch] = useState('');

  // State: info keamanan & aksi tambahan
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // FETCH DATA & AUTH
  // ==========================================
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }
      const currentUserId = session.user.id;
      setUserId(currentUserId);
      setUserEmail(session.user.email || null);

      // AMBIL KEDUA SALDO DARI TABEL wallets
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, user_id, affiliate_balance, shop_balance')
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (walletError) throw new Error('Gagal mengambil data dompet.');

      if (!walletData) {
        // Jika belum ada, buat dengan saldo 0
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([{ user_id: currentUserId, affiliate_balance: 0, shop_balance: 0 }])
          .select()
          .single();
        if (createError) throw createError;
        setBalances(newWallet);
      } else {
        setBalances(walletData);
      }

      // Ambil transaksi riwayat
      const { data: txData, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (txError) throw new Error('Gagal mengambil riwayat transaksi.');
      setTransactions(txData || []);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // ✅ PERBAIKAN PENTING: Deteksi mode dari Environment Variable
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const midtransScriptUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'      // URL Live
      : 'https://app.sandbox.midtrans.com/snap/snap.js'; // URL Sandbox

    const myMidtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';

    if (myMidtransClientKey) {
      let scriptTag = document.createElement('script');
      scriptTag.src = midtransScriptUrl;
      scriptTag.setAttribute('data-client-key', myMidtransClientKey);
      scriptTag.async = true;
      document.body.appendChild(scriptTag);
      return () => { document.body.removeChild(scriptTag); }
    }
  }, []);

  useEffect(() => {
    setProvider(destType === 'Bank' ? BANKS[0] : EWALLETS[0]);
  }, [destType]);

  // Tutup dropdown notifikasi saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==========================================
  // RIWAYAT LENGKAP
  // ==========================================
  const fetchFullHistory = async (reset: boolean) => {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      const offset = reset ? 0 : fullHistory.length;
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + HISTORY_PAGE_SIZE - 1);

      if (historyFilter !== 'Semua') query = query.eq('type', historyFilter);
      if (historySearch.trim()) {
        const term = historySearch.trim();
        query = query.or(`title.ilike.%${term}%,order_id.ilike.%${term}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      setFullHistory(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setHistoryHasMore((data || []).length === HISTORY_PAGE_SIZE);
    } catch (err: any) {
      console.error(err);
      toast.error('Gagal memuat riwayat transaksi.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (showFullHistory) {
      setFullHistory([]);
      setHistoryHasMore(true);
      fetchFullHistory(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFullHistory, historyFilter]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const scrollToHistory = () => historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const openModal = (type: ActionType) => {
    setActionType(type);
    setAmountStr('');
    setAccountNumber('');
    setAccountName('');
    setIsSuccess(false);
  };

  const closeModal = () => {
    if (isProcessing) return;
    setActionType(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(numericValue);
  };

  const copyToClipboard = async (text: string, label = 'Teks') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} disalin ke clipboard.`);
    } catch {
      toast.error('Gagal menyalin, coba salin manual.');
    }
  };

  const printReceipt = (tx: Transaction) => {
    const receiptWindow = window.open('', '_blank', 'width=420,height=640');
    if (!receiptWindow) {
      toast.error('Popup diblokir browser. Izinkan popup untuk mencetak bukti.');
      return;
    }
    receiptWindow.document.write(`
      <html>
        <head>
          <title>Bukti Transaksi - ${tx.order_id}</title>
          <style>
            body { font-family: -apple-system, Segoe UI, sans-serif; padding: 28px; color: #1e293b; }
            h2 { margin-bottom: 2px; }
            .sub { color: #64748b; margin-top: 0; font-size: 13px; }
            .amount { font-size: 28px; font-weight: 800; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; }
            .label { color: #64748b; }
            .footer { margin-top: 28px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <h2>Oneklik.id</h2>
          <p class="sub">Bukti Transaksi</p>
          <div class="amount">${tx.type === 'Pemasukan' ? '+' : '-'} ${formatRupiah(tx.amount)}</div>
          <div class="row"><span class="label">ID Transaksi</span><span>${tx.order_id}</span></div>
          <div class="row"><span class="label">Judul</span><span>${tx.title}</span></div>
          <div class="row"><span class="label">Tipe</span><span>${tx.type}</span></div>
          <div class="row"><span class="label">Sumber Saldo</span><span>${tx.source}</span></div>
          <div class="row"><span class="label">Detail Tujuan</span><span>${tx.destination_detail || '-'}</span></div>
          <div class="row"><span class="label">Waktu</span><span>${formatDate(tx.created_at)}</span></div>
          <p class="footer">Dokumen ini dibuat otomatis oleh sistem Oneklik.id dan sah tanpa tanda tangan basah.</p>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 300);
  };

  const exportHistoryCSV = () => {
    const rows = fullHistory.length ? fullHistory : transactions;
    if (!rows.length) {
      toast.error('Tidak ada data transaksi untuk diekspor.');
      return;
    }
    const header = ['Tanggal', 'Judul', 'ID Transaksi', 'Tipe', 'Sumber', 'Nominal', 'Detail Tujuan'];
    const csvRows = rows.map(tx => [
      formatDate(tx.created_at), tx.title, tx.order_id, tx.type, tx.source, String(tx.amount), tx.destination_detail || '-'
    ]);
    const csvContent = [header, ...csvRows]
      .map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `riwayat-transaksi-oneklik-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Riwayat berhasil diekspor ke CSV.');
  };

  // ==========================================
  // EXECUTION LOGIC
  // ==========================================
  const executeTransaction = async () => {
    const amount = parseInt(amountStr);
    const modalInfo = getModalInfo();

    if (!amount || amount <= 0) return toast.error('Nominal tidak valid.');
    if (!userId || !balances) return toast.error('Data pengguna tidak ditemukan.');

    // Validasi saldo
    let currentBalance = 0;
    if (actionType === 'withdraw_aff' || actionType === 'transfer_to_shop') currentBalance = balances.affiliate_balance;
    else if (actionType === 'withdraw_shop' || actionType === 'transfer_to_aff') currentBalance = balances.shop_balance;

    if (actionType !== 'topup' && amount > currentBalance) {
      return toast.error(`Saldo ${actionType?.includes('aff') ? 'Affiliate' : 'Shop'} tidak mencukupi.`);
    }

    // --- TOP UP ---
    if (actionType === 'topup') {
      setIsProcessing(true);
      try {
        const res = await fetch('/api/wallet/topup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            userId: userId,
            email: userEmail || 'guest@oneklik.id'
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal membuat transaksi Top Up.');
        }

        if (data.token && window.snap) {
          window.snap.pay(data.token, {
            onSuccess: () => {
              toast.success('Top Up Berhasil!');
              fetchData();
              closeModal();
            },
            onPending: () => {
              toast.success('Pembayaran pending.');
              closeModal();
            },
            onError: () => {
              toast.error('Pembayaran gagal.');
              setIsProcessing(false);
            },
            onClose: () => {
              toast.error('Pembayaran dibatalkan.');
              setIsProcessing(false);
            }
          });
          return;
        } else {
          throw new Error('Script Midtrans gagal dimuat.');
        }
      } catch (err: any) {
        setIsProcessing(false);
        toast.error('Gagal Top Up: ' + err.message);
      }
      return;
    }

    // --- WITHDRAW & TRANSFER ---
    const isWithdrawal = actionType === 'withdraw_aff' || actionType === 'withdraw_shop';
    if (isWithdrawal) {
      if (!accountNumber || accountNumber.length < 5) return toast.error('Nomor Rekening/HP tidak valid.');
      if (!accountName || accountName.length < 3) return toast.error('Nama pemilik rekening tidak valid.');
    }

    setIsProcessing(true);

    try {
      let newBalances = { ...balances };

      // Hitung saldo baru
      if (actionType === 'withdraw_aff') newBalances.affiliate_balance -= amount;
      else if (actionType === 'withdraw_shop') newBalances.shop_balance -= amount;
      else if (actionType === 'transfer_to_shop') { newBalances.affiliate_balance -= amount; newBalances.shop_balance += amount; }
      else if (actionType === 'transfer_to_aff') { newBalances.shop_balance -= amount; newBalances.affiliate_balance += amount; }

      const txType = isWithdrawal ? 'Penarikan' : 'Transfer';
      const source = (actionType?.includes('aff') && actionType !== 'transfer_to_aff') || actionType === 'transfer_to_shop' ? 'Affiliate' : 'Shop';
      const orderId = isWithdrawal ? `WD-${Date.now().toString().slice(-6)}` : `TRF-${Date.now().toString().slice(-6)}`;

      // Update Database
      const { error: errBal } = await supabase.from('wallets').update({
        affiliate_balance: newBalances.affiliate_balance,
        shop_balance: newBalances.shop_balance,
        updated_at: new Date().toISOString()
      }).eq('id', balances.id);
      if (errBal) throw new Error('Gagal update saldo: ' + errBal.message);

      const txPayload = {
        user_id: userId,
        title: modalInfo.title,
        order_id: orderId,
        type: txType,
        source: source,
        amount: amount,
        destination_detail: isWithdrawal ? `${provider} - ${accountNumber} (${accountName})` : 'Transfer Internal'
      };

      const { error: errTx } = await supabase.from('wallet_transactions').insert([txPayload]);
      if (errTx) throw new Error('Gagal mencatat transaksi: ' + errTx.message);

      // Midtrans Iris Payout
      if (isWithdrawal) {
        const { data: wdData, error: errWd } = await supabase.from('withdrawals').insert([{
          user_id: userId,
          amount,
          provider_type: destType,
          provider_name: provider,
          account_number: accountNumber,
          account_name: accountName,
          status: 'pending'
        }]).select().single();
        if (errWd) throw new Error('Gagal mencatat Withdrawal.');

        try {
          await fetch('/api/midtrans/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference_id: wdData.id,
              beneficiary_name: accountName,
              beneficiary_account: accountNumber,
              beneficiary_bank: getMidtransBankCode(provider),
              amount,
              notes: `Penarikan Oneklik.id`
            })
          });
        } catch { /* Ignore fetch error, withdrawal saved in DB */ }
      }

      setBalances(newBalances);
      const newTx: Transaction = {
        id: orderId,
        title: modalInfo.title,
        order_id: orderId,
        type: txType,
        source: source,
        amount: amount,
        created_at: new Date().toISOString(),
        destination_detail: isWithdrawal ? `${provider} - ${accountNumber} (${accountName})` : 'Transfer Internal'
      };
      setTransactions(prev => [newTx, ...prev]);

      setIsProcessing(false);
      setIsSuccess(true);
      toast.success('Transaksi berhasil diproses!');
      setTimeout(() => closeModal(), 2500);

    } catch (error: any) {
      console.error(error);
      setIsProcessing(false);
      toast.error(error.message || 'Gagal memproses transaksi.');
    }
  };

  const getModalInfo = () => {
    const affBal = balances?.affiliate_balance || 0;
    const shopBal = balances?.shop_balance || 0;

    switch (actionType) {
      case 'topup': return { title: 'Top Up Saldo', color: 'text-indigo-600', bg: 'bg-indigo-100', btn: 'bg-indigo-600 hover:bg-indigo-700', max: 50000000 };
      case 'withdraw_aff': return { title: 'Tarik Saldo Affiliate', color: 'text-purple-600', bg: 'bg-purple-100', btn: 'bg-purple-600 hover:bg-purple-700', max: affBal };
      case 'withdraw_shop': return { title: 'Tarik Saldo Shop', color: 'text-blue-600', bg: 'bg-blue-100', btn: 'bg-blue-600 hover:bg-blue-700', max: shopBal };
      case 'transfer_to_shop': return { title: 'Transfer ke Saldo Shop', color: 'text-emerald-600', bg: 'bg-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700', max: affBal };
      case 'transfer_to_aff': return { title: 'Transfer ke Saldo Affiliate', color: 'text-amber-600', bg: 'bg-amber-100', btn: 'bg-amber-600 hover:bg-amber-700', max: shopBal };
      default: return { title: '', color: '', bg: '', btn: '', max: 0 };
    }
  };

  const modalInfo = getModalInfo();
  const isWithdrawalAction = actionType === 'withdraw_aff' || actionType === 'withdraw_shop';
  const isTopupAction = actionType === 'topup';

  // ==========================================
  // AKSI CEPAT
  // ==========================================
  const quickActions = [
    { icon: Download, label: 'Top Up Saldo', color: 'text-indigo-600', bg: 'bg-indigo-100/50 border-indigo-200/50', action: () => openModal('topup') },
    { icon: ArrowUpRight, label: 'Tarik Saldo Affiliate', color: 'text-purple-600', bg: 'bg-purple-100/50 border-purple-200/50', action: () => openModal('withdraw_aff') },
    { icon: ShoppingBag, label: 'Tarik Saldo Shop', color: 'text-blue-600', bg: 'bg-blue-100/50 border-blue-200/50', action: () => openModal('withdraw_shop') },
    { icon: ArrowRightLeft, label: 'Transfer ke Saldo Shop', color: 'text-emerald-600', bg: 'bg-emerald-100/50 border-emerald-200/50', action: () => openModal('transfer_to_shop') },
    { icon: Users, label: 'Transfer ke Saldo Affiliate', color: 'text-amber-600', bg: 'bg-amber-100/50 border-amber-200/50', action: () => openModal('transfer_to_aff') },
    { icon: FileText, label: 'Riwayat Transaksi', color: 'text-slate-600', bg: 'bg-slate-200/50 border-slate-300/50', action: scrollToHistory },
  ];

  const extraActions = [
    { icon: FileDown, label: 'Ekspor Riwayat CSV', color: 'text-teal-600', bg: 'bg-teal-100/50 border-teal-200/50', action: exportHistoryCSV },
    { icon: HelpCircleIcon, label: 'Pusat Bantuan', color: 'text-orange-600', bg: 'bg-orange-100/50 border-orange-200/50', action: () => window.open(`mailto:${SUPPORT_EMAIL}?subject=Bantuan%20Wallet%20Oneklik.id`, '_blank') },
  ];

  // ==========================================
  // NOTIFIKASI
  // ==========================================
  const notificationItems = useMemo(() => {
    return (transactions || []).slice(0, 5).map(tx => ({
      id: tx.id,
      title: tx.type === 'Pemasukan' ? 'Dana Masuk' : tx.type === 'Penarikan' ? 'Penarikan Diproses' : 'Transfer Berhasil',
      desc: `${tx.title} • ${formatRupiah(tx.amount)}`,
      time: formatDate(tx.created_at),
      unread: (Date.now() - new Date(tx.created_at).getTime()) < 24 * 60 * 60 * 1000,
      tx,
    }));
  }, [transactions]);

  const unreadNotifCount = notificationItems.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex font-sans text-slate-800 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <Toaster position="top-center" toastOptions={{ className: 'backdrop-blur-xl bg-white/90 border border-white/50 shadow-2xl font-semibold text-slate-800' }} />

      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-400/25 rounded-full blur-[100px] pointer-events-none" />

      {/* ================= MODAL AKSI WALLET ================= */}
      <AnimatePresence>
        {actionType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[440px] bg-white/80 backdrop-blur-3xl backdrop-saturate-200 border border-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-7 py-6 border-b border-white/60 bg-white/40 flex justify-between items-center backdrop-blur-md z-20 sticky top-0">
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">{modalInfo.title}</h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <div className="p-7 overflow-y-auto custom-scrollbar">
                {!isSuccess ? (
                  <>
                    <div className="text-center mb-8">
                      <p className="text-[13px] font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        {isTopupAction ? 'Batas Maksimum: ' : 'Tersedia: '}
                        <span className={modalInfo.color}>{formatRupiah(modalInfo.max)}</span>
                      </p>
                      <div className="relative flex items-center justify-center mb-6">
                        <span className="text-2xl font-black text-slate-400 mr-2 mt-1">Rp</span>
                        <input
                          type="text"
                          value={amountStr ? new Intl.NumberFormat('id-ID').format(parseInt(amountStr)) : ''}
                          onChange={handleAmountChange}
                          placeholder="0"
                          className="text-5xl font-black text-slate-900 bg-transparent text-center outline-none w-full max-w-[280px] placeholder:text-slate-200"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[50000, 100000, 500000].map(val => (
                          <button key={val} onClick={() => setAmountStr(val.toString())} className="py-2.5 rounded-xl bg-white/50 border border-white/60 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-sm">
                            {val / 1000}k
                          </button>
                        ))}
                        <button onClick={() => setAmountStr(modalInfo.max.toString())} className={`py-2.5 rounded-xl ${modalInfo.bg} ${modalInfo.color} font-bold text-xs hover:brightness-95 transition-all shadow-sm`}>
                          Max
                        </button>
                      </div>
                    </div>

                    {isTopupAction && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                          <p className="text-xs font-bold text-slate-500 mb-2 ml-1">Top Up Ke Saldo:</p>
                          <div className="flex bg-white/50 p-1 rounded-2xl shadow-inner border border-white/60">
                            <button onClick={() => setTopupDest('Shop')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${topupDest === 'Shop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🛍️ Shop</button>
                            <button onClick={() => setTopupDest('Affiliate')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${topupDest === 'Affiliate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>👥 Affiliate</button>
                          </div>
                       </motion.div>
                    )}

                    {isWithdrawalAction && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 mb-8">
                        <div className="flex bg-white/50 p-1 rounded-2xl shadow-inner border border-white/60 mb-2">
                          <button onClick={() => setDestType('Bank')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${destType === 'Bank' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Rekening Bank</button>
                          <button onClick={() => setDestType('E-Wallet')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${destType === 'E-Wallet' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>E-Wallet</button>
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 text-slate-400"><Landmark size={18}/></div>
                          <select value={provider} onChange={(e) => setProvider(e.target.value)} className={`${glassInput} pl-11 appearance-none cursor-pointer`}>
                            {(destType === 'Bank' ? BANKS : EWALLETS).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown size={16} className="absolute right-4 top-4 text-slate-400 pointer-events-none"/>
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 text-slate-400">{destType === 'Bank' ? <CreditCard size={18}/> : <Smartphone size={18}/>}</div>
                          <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))} placeholder={destType === 'Bank' ? "Nomor Rekening" : "Nomor HP (Contoh: 0812345...)"} className={`${glassInput} pl-11`} />
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-3.5 text-slate-400"><User size={18}/></div>
                          <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Nama Pemilik Rekening/Akun" className={`${glassInput} pl-11`} />
                        </div>
                      </motion.div>
                    )}

                    {!isWithdrawalAction && !isTopupAction && (
                      <div className="mb-8 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-3">
                        <HelpCircleIcon size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-900 font-medium leading-relaxed">Dana akan ditransfer secara instan dan bebas admin.</p>
                      </div>
                    )}

                    <button
                      onClick={executeTransaction}
                      disabled={isProcessing || !amountStr || parseInt(amountStr) <= 0 || (actionType !== 'topup' && parseInt(amountStr) > modalInfo.max)}
                      className={`w-full py-4 rounded-2xl ${modalInfo.btn} disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-[15px] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2`}
                    >
                      {isProcessing ? <><Loader2 className="animate-spin" size={20} /> Memproses...</> : isTopupAction ? 'Lanjut Pembayaran' : 'Konfirmasi Transaksi'}
                    </button>
                  </>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                      <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Transaksi Berhasil!</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed px-4">
                      {isWithdrawalAction
                         ? `Dana ${formatRupiah(parseInt(amountStr))} diproses ke ${provider}.`
                         : isTopupAction
                         ? `Top Up ${formatRupiah(parseInt(amountStr))} berhasil.`
                         : `Transfer ${formatRupiah(parseInt(amountStr))} berhasil.`}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL DETAIL TRANSAKSI ================= */}
      <AnimatePresence>
        {detailTx && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDetailTx(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[420px] bg-white/85 backdrop-blur-3xl backdrop-saturate-200 border border-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="px-7 py-6 border-b border-white/60 bg-white/40 flex justify-between items-center backdrop-blur-md">
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Detail Transaksi</h3>
                <button onClick={() => setDetailTx(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                  <X size={18} />
                </button>
              </div>

              <div className="p-7 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-sm border ${detailTx.source === 'Affiliate' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                    {txIcon(detailTx, 28)}
                  </div>
                  <p className={`text-3xl font-black tracking-tight ${detailTx.type === 'Pemasukan' ? 'text-emerald-600' : detailTx.type === 'Transfer' ? 'text-indigo-600' : 'text-rose-600'}`}>
                    {detailTx.type === 'Pemasukan' ? '+' : '-'} {formatRupiah(detailTx.amount)}
                  </p>
                  <p className="text-sm text-slate-500 font-semibold mt-1">{detailTx.title}</p>
                </div>

                <div className="space-y-0.5">
                  {[
                    { label: 'ID Transaksi', value: detailTx.order_id },
                    { label: 'Tipe', value: detailTx.type },
                    { label: 'Sumber Saldo', value: detailTx.source },
                    { label: 'Detail Tujuan', value: detailTx.destination_detail || '-' },
                    { label: 'Waktu', value: formatDate(detailTx.created_at) },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0 gap-4">
                      <span className="text-[13px] text-slate-500 font-medium shrink-0">{row.label}</span>
                      <span className="text-[13px] text-slate-800 font-bold text-right break-words">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-7">
                  <button onClick={() => copyToClipboard(detailTx.order_id, 'ID Transaksi')} className={`${glassButton} flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-700 flex items-center justify-center gap-2`}>
                    <Copy size={16} /> Salin ID
                  </button>
                  <button onClick={() => printReceipt(detailTx)} className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <Printer size={16} /> Cetak Bukti
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL RIWAYAT LENGKAP ================= */}
      <AnimatePresence>
        {showFullHistory && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFullHistory(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-2xl bg-white/90 backdrop-blur-3xl backdrop-saturate-200 border border-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden relative z-10 max-h-[85vh] flex flex-col"
            >
              <div className="px-7 py-6 border-b border-white/60 bg-white/40 flex justify-between items-center backdrop-blur-md">
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Riwayat Transaksi</h3>
                <div className="flex items-center gap-2">
                  <button onClick={exportHistoryCSV} className={`${glassButton} px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5`}>
                    <FileDown size={14} /> Ekspor CSV
                  </button>
                  <button onClick={() => setShowFullHistory(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="px-7 py-4 border-b border-slate-100 space-y-3 bg-white/30">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchFullHistory(true); }}
                    placeholder="Cari judul atau ID transaksi, lalu tekan Enter..."
                    className={`${glassInput} pl-10 !py-2.5`}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {(['Semua', 'Pemasukan', 'Penarikan', 'Transfer'] as HistoryFilter[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setHistoryFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${historyFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-white/50 text-slate-500 border border-white/60 hover:bg-white'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-slate-100">
                {(fullHistory || []).length === 0 && !historyLoading ? (
                  <div className="py-16 text-center text-slate-400 text-sm font-medium">Tidak ada transaksi ditemukan</div>
                ) : (fullHistory || []).map(tx => (
                  <div key={tx.id} className="px-7 py-4 flex items-center gap-4 hover:bg-white/70 cursor-pointer transition-colors" onClick={() => setDetailTx(tx)}>
                    <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-sm border shrink-0 ${tx.source === 'Affiliate' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                      {txIcon(tx, 18)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-[13px] truncate">{tx.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium truncate">{tx.order_id} • {formatDate(tx.created_at)}</p>
                    </div>
                    <p className={`font-extrabold text-[13px] shrink-0 ${tx.type === 'Pemasukan' ? 'text-emerald-600' : tx.type === 'Transfer' ? 'text-indigo-600' : 'text-rose-600'}`}>
                      {tx.type === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </p>
                  </div>
                ))}
                {historyLoading && (
                  <div className="py-6 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Memuat riwayat...
                  </div>
                )}
              </div>

              {historyHasMore && !historyLoading && (fullHistory || []).length > 0 && (
                <div className="p-4 border-t border-slate-100 bg-white/30">
                  <button onClick={() => fetchFullHistory(false)} className={`${glassButton} w-full py-3 rounded-2xl text-sm font-bold text-slate-700`}>
                    Muat Lebih Banyak
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL INFO KEAMANAN ================= */}
      <AnimatePresence>
        {showSecurityInfo && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowSecurityInfo(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-white/90 backdrop-blur-3xl backdrop-saturate-200 border border-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden relative z-10"
            >
              <div className="px-7 py-6 border-b border-white/60 flex justify-between items-center">
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">Keamanan Oneklik.id</h3>
                <button onClick={() => setShowSecurityInfo(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                  <X size={18} />
                </button>
              </div>
              <div className="p-7 space-y-5">
                {[
                  { icon: Lock, title: 'Enkripsi Data Tingkat Tinggi', desc: 'Seluruh data transaksi Anda dienkripsi menggunakan standar industri sebelum disimpan.' },
                  { icon: CheckCircle, title: 'Verifikasi 2 Langkah', desc: 'Aktifkan 2FA di halaman Pengaturan untuk lapisan keamanan tambahan pada akun Anda.' },
                  { icon: ShieldCheck, title: 'Monitoring 24/7', desc: 'Tim kami memantau aktivitas mencurigakan pada transaksi wallet secara berkelanjutan.' },
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
                <button
                  onClick={() => { setShowSecurityInfo(false); router.push(ROUTES.pengaturan); }}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                >
                  Buka Pengaturan Keamanan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= SIDEBAR KIRI ================= */}
      <aside className={`w-[260px] ${glassPlatinum} border-r-0 border-r-slate-200/50 hidden lg:flex flex-col justify-between sticky top-0 h-screen z-20 m-4 rounded-[2rem]`}>
        <div className="pt-6">
          <div className="px-8 flex items-center gap-3 mb-10 cursor-pointer" onClick={() => router.push(ROUTES.dashboard)}>
            <div className="relative w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100">
               <Image src="/icon-oneklik.svg" alt="Oneklik Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-[22px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">Oneklik.id</span>
          </div>

          <nav className="px-4 space-y-1.5">
            {[
              { label: 'Dashboard', icon: LayoutDashboard, action: () => router.push(ROUTES.dashboard) },
              { label: 'Order', icon: ShoppingBag, action: () => router.push(ROUTES.order) },
              { label: 'Produk Digital', icon: Box, action: () => router.push(ROUTES.produk) },
              { label: 'Affiliate', icon: Users, action: () => router.push(ROUTES.affiliate) },
              { label: 'Wallet', icon: Wallet, active: true },
              { label: 'Top Up Saldo', icon: Plus, action: () => openModal('topup') },
              { label: 'Withdrawal', icon: ArrowUpRight, action: () => openModal('withdraw_aff') },
              { label: 'Riwayat Transaksi', icon: History, action: scrollToHistory },
              { label: 'Laporan', icon: FileText, action: () => router.push(ROUTES.laporan) },
              { label: 'Pengaturan', icon: Settings, action: () => router.push(ROUTES.pengaturan) },
            ].map((item, idx) => (
              <button key={idx} onClick={item.action} className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl font-semibold text-[14px] transition-all ${
                item.active ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]' : 'text-slate-500 hover:bg-white/60 hover:text-blue-600'
              }`}>
                <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <div onClick={() => router.push(ROUTES.premium)} className="bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-500 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden mb-4 cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 mb-3"><span className="text-xl">👑</span></div>
            <h4 className="font-bold text-sm mb-1">Upgrade Premium</h4>
            <p className="text-[11px] text-blue-100 mb-4 leading-relaxed">Dapatkan fitur & komisi eksklusif.</p>
            <button onClick={(e) => { e.stopPropagation(); router.push(ROUTES.premium); }} className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm">Upgrade <ChevronRight size={14} /></button>
          </div>
        </div>
      </aside>

      {/* ================= KONTEN UTAMA ================= */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 relative z-10 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-8 pb-10">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Wallet</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Kelola saldo affiliate dan shop Anda dengan mudah.</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => openModal('topup')} className={`${glassButton} px-5 py-2.5 bg-indigo-50 border-indigo-100 rounded-2xl text-sm font-bold text-indigo-700 flex items-center gap-2`}>
                <Plus size={18} strokeWidth={3} /> Top Up Saldo
              </button>

              {/* Notifikasi */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(v => !v)} className={`${glassButton} w-11 h-11 rounded-2xl flex items-center justify-center text-slate-600 relative hover:scale-105`}>
                  <Bell size={20} />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-2 right-2 min-w-[16px] h-4 px-0.5 bg-purple-500 border-2 border-white rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                      {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotif && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-3 w-[340px] bg-white/95 backdrop-blur-2xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden z-50"
                    >
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-extrabold text-slate-900 text-sm">Notifikasi</h4>
                        {unreadNotifCount > 0 && <span className="text-[11px] font-bold text-blue-600">{unreadNotifCount} baru</span>}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                        {notificationItems.length === 0 ? (
                          <div className="py-10 text-center text-sm text-slate-400 font-medium">Belum ada notifikasi</div>
                        ) : notificationItems.map(n => (
                          <div key={n.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer" onClick={() => { setShowNotif(false); setDetailTx(n.tx); }}>
                            {n.unread ? <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" /> : <span className="w-2 h-2 shrink-0" />}
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-slate-800 truncate">{n.title}</p>
                              <p className="text-[12px] text-slate-500 truncate">{n.desc}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => { setShowNotif(false); setShowFullHistory(true); }} className="w-full py-3 text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100">
                        Lihat Semua Riwayat
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* MAIN BALANCE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Affiliate */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-[0_20px_40px_rgba(124,58,237,0.25)] border border-white/10 group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-6 opacity-90 text-sm font-semibold cursor-help" onClick={() => toast('Total saldo komisi yang belum ditarik')}>
                    Saldo Affiliate <HelpCircle size={14} className="opacity-70" />
                  </div>
                  <p className="text-purple-200 text-sm font-medium mb-1">Total Saldo</p>
                  <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">{loading ? '...' : formatRupiah(balances?.affiliate_balance || 0)}</h2>
                  <p className="text-purple-200 text-sm font-medium mb-1">Total Komisi</p>
                  <p className="text-xl font-bold">{loading ? '...' : 'Rp 0'}</p>
                </div>
                <div className="flex items-center gap-3 mt-10">
                  <button onClick={() => openModal('withdraw_aff')} className="flex-1 bg-white hover:bg-slate-50 text-purple-700 py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
                    <ArrowUpRight size={18} /> Tarik Saldo
                  </button>
                  <button onClick={scrollToHistory} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <History size={18} /> Riwayat
                  </button>
                </div>
              </div>
              <div className="absolute right-6 top-[20%] opacity-40 md:opacity-100 pointer-events-none">
                 <div className="w-32 h-32 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] shadow-2xl flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    <Wallet size={64} className="text-white drop-shadow-lg" />
                 </div>
              </div>
            </motion.div>

            {/* Card Shop */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-[0_20px_40px_rgba(37,99,235,0.25)] border border-white/10 group">
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-6 opacity-90 text-sm font-semibold cursor-help" onClick={() => toast('Hasil penjualan produk toko Anda')}>
                    Saldo Shop <HelpCircle size={14} className="opacity-70" />
                  </div>
                  <p className="text-blue-200 text-sm font-medium mb-1">Total Saldo</p>
                  <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">{loading ? '...' : formatRupiah(balances?.shop_balance || 0)}</h2>
                  <p className="text-blue-200 text-sm font-medium mb-1">Total Pemasukan</p>
                  <p className="text-xl font-bold">{loading ? '...' : 'Rp 0'}</p>
                </div>
                <div className="flex items-center gap-3 mt-10">
                  <button onClick={() => openModal('withdraw_shop')} className="flex-1 bg-white hover:bg-slate-50 text-blue-700 py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2">
                    <ArrowUpRight size={18} /> Tarik Saldo
                  </button>
                  <button onClick={scrollToHistory} className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 flex items-center justify-center gap-2">
                    <History size={18} /> Riwayat
                  </button>
                </div>
              </div>
               <div className="absolute right-6 top-[20%] opacity-40 md:opacity-100 pointer-events-none">
                 <div className="w-32 h-32 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] shadow-2xl flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <ShoppingBag size={64} className="text-white drop-shadow-lg" />
                 </div>
              </div>
            </motion.div>
          </div>

          {/* AKSI CEPAT */}
          <section className={`${glassPlatinum} rounded-[2.5rem] p-8`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-extrabold text-slate-900">Aksi Cepat</h3>
              <button onClick={() => setShowMoreActions(v => !v)} className="text-sm font-semibold text-blue-600 flex items-center hover:text-blue-700">
                {showMoreActions ? 'Sembunyikan' : 'Semua Aksi'} <ChevronRight size={16} className={`transition-transform duration-300 ${showMoreActions ? 'rotate-90' : ''}`} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {quickActions.map((item, idx) => (
                <div key={idx} onClick={item.action} className="flex flex-col items-center text-center gap-3 cursor-pointer group">
                  <div className={`w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-[1.5rem] flex items-center justify-center shadow-sm border backdrop-blur-md ${item.bg} group-active:scale-95 group-hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent"></div>
                     <item.icon size={26} className={`${item.color} relative z-10 drop-shadow-sm`} />
                  </div>
                  <span className="text-[12px] font-bold text-slate-700 leading-snug px-1">{item.label}</span>
                </div>
              ))}
              <AnimatePresence>
                {showMoreActions && extraActions.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={item.action}
                    className="flex flex-col items-center text-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-[1.5rem] flex items-center justify-center shadow-sm border backdrop-blur-md ${item.bg} group-active:scale-95 group-hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                       <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent"></div>
                       <item.icon size={26} className={`${item.color} relative z-10 drop-shadow-sm`} />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 leading-snug px-1">{item.label}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* TRANSAKSI TERAKHIR */}
          <section ref={historyRef} className={`${glassPlatinum} rounded-[2.5rem] overflow-hidden scroll-mt-24`}>
            <div className="p-8 border-b border-slate-200/50 flex justify-between items-center bg-white/30">
              <h3 className="text-xl font-extrabold text-slate-900">Transaksi Terakhir</h3>
              <button onClick={() => setShowFullHistory(true)} className="text-sm font-semibold text-blue-600 flex items-center hover:text-blue-700">Lihat Semua <ChevronRight size={16}/></button>
            </div>
            <div className="overflow-x-auto px-4 pb-4 bg-white/20">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[12px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/60">
                    <th className="py-5 px-6 font-semibold">Transaksi</th>
                    <th className="py-5 px-6 font-semibold">Tipe</th>
                    <th className="py-5 px-6 font-semibold hidden lg:table-cell">Detail Destinasi</th>
                    <th className="py-5 px-6 font-semibold">Nominal</th>
                    <th className="py-5 px-6 font-semibold hidden md:table-cell">Waktu</th>
                    <th className="py-5 px-6 text-center"></th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                  {transactions.length === 0 ? (
                     <tr><td colSpan={6} className="py-8 text-center text-slate-400">Belum ada transaksi ditemukan</td></tr>
                  ) : transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/70 transition-colors border-b border-slate-200/40 last:border-0 group cursor-pointer" onClick={() => setDetailTx(tx)}>
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-sm border shrink-0 ${
                          tx.source === 'Affiliate' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {txIcon(tx, 20)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-[14px] group-hover:text-blue-600 transition-colors whitespace-nowrap">{tx.title}</p>
                          <p className="text-[12px] text-slate-400 font-medium">{tx.order_id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[11px] font-bold border ${
                          tx.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' :
                          tx.type === 'Transfer' ? 'bg-indigo-50 text-indigo-600 border-indigo-200/50' : 'bg-rose-50 text-rose-600 border-rose-200/50'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium text-[13px] hidden lg:table-cell max-w-[200px] truncate">
                        {tx.destination_detail || tx.source}
                      </td>
                      <td className={`py-4 px-6 font-extrabold ${tx.type === 'Pemasukan' ? 'text-emerald-600' : tx.type === 'Transfer' ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {tx.type === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-[13px] hidden md:table-cell">{formatDate(tx.created_at)}</td>
                      <td className="py-4 px-6 text-center">
                        <button className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors ml-auto opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setDetailTx(tx); }}>
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECURITY BANNER */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden border border-blue-400/30">
            <div className="absolute right-0 top-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-8 relative z-10 w-full lg:w-auto">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <ShieldCheck size={56} className="text-blue-100 drop-shadow-md" />
              </div>
              <div className="max-w-sm">
                <h3 className="text-2xl font-extrabold mb-2 text-white">Aman & Terpercaya</h3>
                <p className="text-blue-100 text-[13px] leading-relaxed mb-4">Setiap transaksi di Oneklik.id dilindungi sistem keamanan berlapis. Dana Anda 100% aman bersama kami.</p>
                <button onClick={() => setShowSecurityInfo(true)} className="text-[13px] font-bold text-white flex items-center gap-2 hover:gap-3 transition-all bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 w-max">
                  Pelajari Selengkapnya <ArrowUpRight size={16}/>
                </button>
              </div>
            </div>
            <div className="w-full lg:w-auto flex flex-col gap-5 relative z-10 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
               {[{ icon: Lock, title: 'Enkripsi Data Tingkat Tinggi', desc: 'Melindungi data dan informasi Anda' }, { icon: CheckCircle, title: 'Verifikasi 2 Langkah', desc: 'Lapisan keamanan tambahan untuk akun Anda' }, { icon: ShieldCheck, title: 'Sistem Keamanan Berlapis', desc: 'Monitoring 24/7 untuk keamanan transaksi' }].map((item, idx) => (
                 <div key={idx} className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                     <item.icon size={18} className="text-blue-100" />
                   </div>
                   <div>
                     <h4 className="font-bold text-[14px] text-white leading-tight">{item.title}</h4>
                     <p className="text-[12px] text-blue-200 mt-0.5">{item.desc}</p>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          <p className="text-center text-[13px] font-medium text-slate-400 pt-6">© 2026 Oneklik.id. Semua hak cipta dilindungi.</p>
        </div>
      </main>
    </div>
  );
}