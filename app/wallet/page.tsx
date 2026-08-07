'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; 
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Box, Users, Wallet, ArrowUpRight, 
  History, FileText, Settings, HelpCircle, Bell, ChevronRight, 
  HelpCircleIcon, ArrowRightLeft, ShieldCheck, 
  MoreVertical, ChevronDown, Lock, CheckCircle, X, 
  Landmark, Loader2, CreditCard, Smartphone, User, Plus, Download
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
  affiliate_commission: number;
  shop_balance: number;
  shop_income: number;
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

// Mapper Provider ke Midtrans IRIS Bank Code (Untuk Penarikan)
const getMidtransBankCode = (providerName: string): string => {
  const map: Record<string, string> = {
    'BCA': 'bca', 'Mandiri': 'mandiri', 'BNI': 'bni', 'BRI': 'bri', 
    'BSI': 'bsm', 
    'CIMB Niaga': 'cimb', 'Permata': 'permata', 'Bank Jago': 'artos', 'Seabank': 'kesejahteraan_ekonomi',
    'GoPay': 'gopay', 'OVO': 'ovo', 'DANA': 'dana', 'ShopeePay': 'shopeepay', 'LinkAja': 'linkaja'
  };
  return map[providerName] || 'unknown';
};

// Style Platinum Glassmorphism
const glassPlatinum = "bg-white/50 backdrop-blur-3xl backdrop-saturate-200 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_8px_32px_rgba(0,0,0,0.06)]";
const glassButton = "bg-white/60 backdrop-blur-xl border border-white/90 shadow-[0_4px_15px_rgba(0,0,0,0.04)] hover:bg-white/90 transition-all";
const glassInput = "w-full bg-white/40 border border-white/60 focus:bg-white/60 focus:border-blue-400 outline-none backdrop-blur-md rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all shadow-inner";

const BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'BSI', 'CIMB Niaga', 'Permata', 'Bank Jago', 'Seabank'];
const EWALLETS = ['GoPay', 'OVO', 'DANA', 'ShopeePay', 'LinkAja'];

export default function WalletPage() {
  // State Utama
  const [userId, setUserId] = useState<string | null>(null);
  const [balances, setBalances] = useState<WalletBalances | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [actionType, setActionType] = useState<ActionType>(null);
  const [amountStr, setAmountStr] = useState<string>('');
  
  // State Penarikan
  const [destType, setDestType] = useState<DestType>('Bank');
  const [provider, setProvider] = useState<string>('BCA');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');

  // State Top Up
  const [topupDest, setTopupDest] = useState<TopupDestType>('Shop');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const historyRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // FETCH DATA, AUTH & MIDTRANS INJECTION
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

      // Ambil dompet dari database real
      const { data: walletData, error: walletError } = await supabase.from('wallets').select('*').eq('user_id', currentUserId).maybeSingle();
      if (walletError) throw new Error('Gagal mengambil data dompet.');

      if (!walletData) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([{ user_id: currentUserId, affiliate_balance: 0, affiliate_commission: 0, shop_balance: 0, shop_income: 0 }])
          .select()
          .single();
        if (createError) throw createError;
        setBalances(newWallet);
      } else {
        setBalances(walletData);
      }

      // Ambil transaksi riwayat dari database real
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
      toast.error(err.message || 'Terjadi kesalahan sistem saat memuat data dompet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // INJEKSI SCRIPT MIDTRANS SNAP API SECARA DINAMIS
    const midtransScriptUrl = 'https://app.sandbox.midtrans.com/snap/snap.js'; // Ganti ke app.midtrans.com saat Production
    const myMidtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''; 
    
    if (myMidtransClientKey) {
      let scriptTag = document.createElement('script');
      scriptTag.src = midtransScriptUrl;
      scriptTag.setAttribute('data-client-key', myMidtransClientKey);
      scriptTag.async = true;
      document.body.appendChild(scriptTag);

      return () => { document.body.removeChild(scriptTag); }
    } else {
      console.error("NEXT_PUBLIC_MIDTRANS_CLIENT_KEY belum disetel di .env!");
    }
  }, []);

  useEffect(() => {
    setProvider(destType === 'Bank' ? BANKS[0] : EWALLETS[0]);
  }, [destType]);

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

  // ==========================================
  // BACKEND & MIDTRANS EXECUTION LOGIC (REAL)
  // ==========================================
  const executeTransaction = async () => {
    const amount = parseInt(amountStr);
    const modalInfo = getModalInfo();

    if (!amount || amount <= 0) return toast.error('Nominal tidak valid.');
    if (!userId || !balances) return toast.error('Data pengguna tidak ditemukan. Silakan muat ulang halaman.');
    
    // Validasi Limit Saldo HANYA jika bukan Top Up
    if (actionType !== 'topup' && amount > modalInfo.max) return toast.error('Saldo tidak mencukupi.');

    // ----------------------------------------------------
    // LOGIKA KHUSUS TOP UP (REAL MIDTRANS SNAP)
    // ----------------------------------------------------
    if (actionType === 'topup') {
      setIsProcessing(true);
      const orderId = `TU-${Date.now().toString().slice(-6)}`;
      const targetWallet = topupDest === 'Shop' ? 'shop_balance' : 'affiliate_balance';

      try {
        // 1. Simpan DB Status Pending
        const { error: topupErr } = await supabase.from('topups').insert([{
          user_id: userId, amount, destination: targetWallet, status: 'pending', order_id: orderId
        }]);
        if (topupErr) throw new Error('Gagal mencatat rencana Top Up ke database.');

        // 2. Fetch Backend API untuk Snap Token Nyata
        const res = await fetch('/api/midtrans/snap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId, amount, destination: targetWallet })
        });
        
        if (!res.ok) {
           const errData = await res.json().catch(() => ({}));
           throw new Error(errData.message || 'Server gagal membuat pesanan Midtrans.');
        }

        const data = await res.json();
        const snapToken = data.token;

        // 3. Panggil Pop-up Midtrans
        if (snapToken && window.snap) {
          window.snap.pay(snapToken, {
            onSuccess: function(result: any) {
              toast.success('Pembayaran Top Up Berhasil diproses!');
              fetchData(); 
              closeModal();
            },
            onPending: function(result: any) {
              toast.success('Pembayaran pending, silakan selesaikan instruksi pembayaran.');
              closeModal();
            },
            onError: function(result: any) {
              toast.error('Pembayaran gagal diproses oleh sistem Bank.');
              setIsProcessing(false);
            },
            onClose: function() {
              toast.error('Anda menutup halaman sebelum menyelesaikan pembayaran.');
              setIsProcessing(false);
            }
          });
          return; 
        } else {
          throw new Error('Midtrans Script belum dimuat sepenuhnya. Periksa Client Key.');
        }

      } catch (err: any) {
        setIsProcessing(false);
        toast.error('Gagal memproses Top Up: ' + err.message);
      }
      return;
    }

    // ----------------------------------------------------
    // LOGIKA KHUSUS PENARIKAN & TRANSFER INTERNAL (REAL)
    // ----------------------------------------------------
    const isWithdrawal = actionType === 'withdraw_aff' || actionType === 'withdraw_shop';
    if (isWithdrawal) {
      if (!accountNumber || accountNumber.length < 5) return toast.error('Nomor Rekening/HP tidak valid.');
      if (!accountName || accountName.length < 3) return toast.error('Nama pemilik rekening tidak valid.');
    }
    
    setIsProcessing(true);
    
    try {
      let newBalances = { ...balances } as WalletBalances;
      const currentAff = newBalances.affiliate_balance || 0;
      const currentShop = newBalances.shop_balance || 0;
      
      if (actionType === 'withdraw_aff') newBalances.affiliate_balance = currentAff - amount;
      else if (actionType === 'withdraw_shop') newBalances.shop_balance = currentShop - amount;
      else if (actionType === 'transfer_to_shop') { newBalances.affiliate_balance = currentAff - amount; newBalances.shop_balance = currentShop + amount; }
      else if (actionType === 'transfer_to_aff') { newBalances.shop_balance = currentShop - amount; newBalances.affiliate_balance = currentAff + amount; }

      const txType = isWithdrawal ? 'Penarikan' : 'Transfer';
      const source = (actionType?.includes('aff') && actionType !== 'transfer_to_aff') || actionType === 'transfer_to_shop' ? 'Affiliate' : 'Shop';
      const orderId = isWithdrawal ? `WD-${Date.now().toString().slice(-6)}` : `TRF-${Date.now().toString().slice(-6)}`;

      // Update Saldo (Real)
      const { error: errBal } = await supabase.from('wallets').update({
        affiliate_balance: newBalances.affiliate_balance, shop_balance: newBalances.shop_balance, updated_at: new Date().toISOString()
      }).eq('id', balances.id);
      
      if (errBal) throw new Error('Database menolak pembaruan saldo: ' + errBal.message);

      // Insert Riwayat Wallet (Real)
      const txPayload = {
        user_id: userId, title: modalInfo.title, order_id: orderId, type: txType, source: source, amount: amount,
        destination_detail: isWithdrawal ? `${provider} - ${accountNumber} (${accountName})` : 'Transfer Internal'
      };
      
      const { error: errTx } = await supabase.from('wallet_transactions').insert([txPayload]);
      if (errTx) throw new Error('Gagal mencatat transaksi: ' + errTx.message);

      // INTEGRASI MIDTRANS IRIS (PAYOUTS) HANYA UNTUK PENARIKAN
      if (isWithdrawal) {
        const { data: wdData, error: errWd } = await supabase.from('withdrawals').insert([{
          user_id: userId, amount: amount, provider_type: destType, provider_name: provider, account_number: accountNumber, account_name: accountName, status: 'pending'
        }]).select().single();
        
        if (errWd) throw new Error('Gagal mengajukan data penarikan: ' + errWd.message);

        try {
          const payoutRes = await fetch('/api/midtrans/payout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference_id: wdData.id, beneficiary_name: accountName, beneficiary_account: accountNumber, beneficiary_bank: getMidtransBankCode(provider), amount: amount, notes: `Penarikan Oneklik.id`})
          });

          if (!payoutRes.ok) {
             console.warn('API Payout tidak merespons sukses, status withdrawal tetap pending di database.');
          }
        } catch (fetchErr) {
          console.error('Koneksi ke endpoint Payout gagal.', fetchErr);
        }
      }

      setBalances(newBalances);
      setTransactions(prev => [{ ...txPayload, id: Math.random().toString(), created_at: new Date().toISOString() } as Transaction, ...prev]);

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
    switch (actionType) {
      case 'topup': return { title: 'Top Up Saldo', color: 'text-indigo-600', bg: 'bg-indigo-100', btn: 'bg-indigo-600 hover:bg-indigo-700', max: 50000000 };
      case 'withdraw_aff': return { title: 'Tarik Saldo Affiliate', color: 'text-purple-600', bg: 'bg-purple-100', btn: 'bg-purple-600 hover:bg-purple-700', max: balances?.affiliate_balance || 0 };
      case 'withdraw_shop': return { title: 'Tarik Saldo Shop', color: 'text-blue-600', bg: 'bg-blue-100', btn: 'bg-blue-600 hover:bg-blue-700', max: balances?.shop_balance || 0 };
      case 'transfer_to_shop': return { title: 'Transfer ke Saldo Shop', color: 'text-emerald-600', bg: 'bg-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700', max: balances?.affiliate_balance || 0 };
      case 'transfer_to_aff': return { title: 'Transfer ke Saldo Affiliate', color: 'text-amber-600', bg: 'bg-amber-100', btn: 'bg-amber-600 hover:bg-amber-700', max: balances?.shop_balance || 0 };
      default: return { title: '', color: '', bg: '', btn: '', max: 0 };
    }
  };

  const modalInfo = getModalInfo();
  const isWithdrawalAction = actionType === 'withdraw_aff' || actionType === 'withdraw_shop';
  const isTopupAction = actionType === 'topup';

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex font-sans text-slate-800 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <Toaster position="top-center" toastOptions={{ className: 'backdrop-blur-xl bg-white/90 border border-white/50 shadow-2xl font-semibold text-slate-800' }} />
      
      {/* GLOWING BLOBS FOR PLATINUM GLASSMORPHISM */}
      <div className="absolute top-0 right-[20%] w-[500px] h-[500px] bg-blue-400/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-400/25 rounded-full blur-[100px] pointer-events-none" />

      {/* ================= MODAL TRANSACTION ================= */}
      <AnimatePresence>
        {actionType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[440px] bg-white/80 backdrop-blur-3xl backdrop-saturate-200 border border-white shadow-[0_40px_80px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header Modal */}
              <div className="px-7 py-6 border-b border-white/60 bg-white/40 flex justify-between items-center backdrop-blur-md z-20 sticky top-0">
                <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">{modalInfo.title}</h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors shadow-sm">
                  <X size={18} />
                </button>
              </div>

              {/* Body Modal */}
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

                    {/* PILIHAN DESTINASI TOP UP */}
                    {isTopupAction && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
                          <p className="text-xs font-bold text-slate-500 mb-2 ml-1">Top Up Ke Saldo:</p>
                          <div className="flex bg-white/50 p-1 rounded-2xl shadow-inner border border-white/60">
                            <button onClick={() => setTopupDest('Shop')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${topupDest === 'Shop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🛍️ Shop</button>
                            <button onClick={() => setTopupDest('Affiliate')} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${topupDest === 'Affiliate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>👥 Affiliate</button>
                          </div>
                       </motion.div>
                    )}

                    {/* PILIHAN DESTINASI PENARIKAN */}
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
                    
                    {/* INFO TRANSFER INTERNAL */}
                    {!isWithdrawalAction && !isTopupAction && (
                      <div className="mb-8 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-3">
                        <HelpCircleIcon size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                          Dana akan ditransfer secara instan ke saldo tujuan dan dapat langsung digunakan tanpa biaya admin.
                        </p>
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
                      <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }}>
                        <CheckCircle size={48} strokeWidth={2.5} />
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Transaksi Berhasil!</h3>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed px-4">
                      {isWithdrawalAction 
                         ? `Dana ${formatRupiah(parseInt(amountStr))} sedang diproses ke ${provider} Anda.` 
                         : isTopupAction 
                         ? `Top Up sebesar ${formatRupiah(parseInt(amountStr))} berhasil ditambahkan.` 
                         : `Transfer internal sebesar ${formatRupiah(parseInt(amountStr))} berhasil dilakukan.`}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= SIDEBAR KIRI ================= */}
      <aside className={`w-[260px] ${glassPlatinum} border-r-0 border-r-slate-200/50 hidden lg:flex flex-col justify-between sticky top-0 h-screen z-20 m-4 rounded-[2rem]`}>
        <div className="pt-6">
          <div className="px-8 flex items-center gap-3 mb-10 cursor-pointer" onClick={() => toast('Kembali ke Beranda')}>
            <div className="relative w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100">
               <Image src="/icon-oneklik.svg" alt="Oneklik Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-[22px] font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
              Oneklik.id
            </span>
          </div>

          <nav className="px-4 space-y-1.5">
            {[
              { label: 'Dashboard', icon: LayoutDashboard },
              { label: 'Order', icon: ShoppingBag },
              { label: 'Produk Digital', icon: Box },
              { label: 'Affiliate', icon: Users },
              { label: 'Wallet', icon: Wallet, active: true },
              { label: 'Top Up Saldo', icon: Plus, action: () => openModal('topup') },
              { label: 'Withdrawal', icon: ArrowUpRight, action: () => openModal('withdraw_aff') },
              { label: 'Riwayat Transaksi', icon: History, action: scrollToHistory },
              { label: 'Laporan', icon: FileText },
              { label: 'Pengaturan', icon: Settings },
            ].map((item, idx) => (
              <button key={idx} onClick={item.action} className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl font-semibold text-[14px] transition-all ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]' 
                  : 'text-slate-500 hover:bg-white/60 hover:text-blue-600'
              }`}>
                <item.icon size={20} strokeWidth={item.active ? 2.5 : 2} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <div className="bg-gradient-to-br from-indigo-500 via-blue-600 to-blue-500 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden mb-4 cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 mb-3">
              <span className="text-xl">👑</span>
            </div>
            <h4 className="font-bold text-sm mb-1">Upgrade Premium</h4>
            <p className="text-[11px] text-blue-100 mb-4 leading-relaxed">Dapatkan fitur & komisi eksklusif.</p>
            <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm">
              Upgrade <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= KONTEN UTAMA ================= */}
      <main className="flex-1 min-w-0 p-4 lg:p-8 relative z-10 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto space-y-8 pb-10">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Wallet</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Kelola saldo affiliate dan shop Anda dengan mudah.</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => openModal('topup')} className={`${glassButton} px-5 py-2.5 bg-indigo-50 border-indigo-100 rounded-2xl text-sm font-bold text-indigo-700 flex items-center gap-2 hover:bg-indigo-100 hover:border-indigo-200 transition-all`}>
                <Plus size={18} strokeWidth={3} /> Top Up Saldo
              </button>
              <button className={`${glassButton} w-11 h-11 rounded-2xl flex items-center justify-center text-slate-600 relative hover:scale-105`}>
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-4 h-4 bg-purple-500 border-2 border-white rounded-full text-[8px] font-bold text-white flex items-center justify-center">3</span>
              </button>
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
                  <p className="text-xl font-bold">{loading ? '...' : formatRupiah(balances?.affiliate_commission || 0)}</p>
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
                  <p className="text-xl font-bold">{loading ? '...' : formatRupiah(balances?.shop_income || 0)}</p>
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
              <button onClick={() => toast('Membuka menu aksi lengkap')} className="text-sm font-semibold text-blue-600 flex items-center hover:text-blue-700">Semua Aksi <ChevronRight size={16}/></button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {[
                { icon: Download, label: 'Top Up Saldo', color: 'text-indigo-600', bg: 'bg-indigo-100/50 border-indigo-200/50', action: () => openModal('topup') },
                { icon: ArrowUpRight, label: 'Tarik Saldo Affiliate', color: 'text-purple-600', bg: 'bg-purple-100/50 border-purple-200/50', action: () => openModal('withdraw_aff') },
                { icon: ShoppingBag, label: 'Tarik Saldo Shop', color: 'text-blue-600', bg: 'bg-blue-100/50 border-blue-200/50', action: () => openModal('withdraw_shop') },
                { icon: ArrowRightLeft, label: 'Transfer ke Saldo Shop', color: 'text-emerald-600', bg: 'bg-emerald-100/50 border-emerald-200/50', action: () => openModal('transfer_to_shop') },
                { icon: Users, label: 'Transfer ke Saldo Affiliate', color: 'text-amber-600', bg: 'bg-amber-100/50 border-amber-200/50', action: () => openModal('transfer_to_aff') },
                { icon: FileText, label: 'Riwayat Transaksi', color: 'text-slate-600', bg: 'bg-slate-200/50 border-slate-300/50', action: scrollToHistory },
              ].map((item, idx) => (
                <div key={idx} onClick={item.action} className="flex flex-col items-center text-center gap-3 cursor-pointer group">
                  <div className={`w-[64px] h-[64px] md:w-[72px] md:h-[72px] rounded-[1.5rem] flex items-center justify-center shadow-sm border backdrop-blur-md ${item.bg} group-active:scale-95 group-hover:shadow-md transition-all duration-300 relative overflow-hidden`}>
                     <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent"></div>
                     <item.icon size={26} className={`${item.color} relative z-10 drop-shadow-sm`} />
                  </div>
                  <span className="text-[12px] font-bold text-slate-700 leading-snug px-1">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* TRANSAKSI TERAKHIR (TABEL) */}
          <section ref={historyRef} className={`${glassPlatinum} rounded-[2.5rem] overflow-hidden scroll-mt-24`}>
            <div className="p-8 border-b border-slate-200/50 flex justify-between items-center bg-white/30">
              <h3 className="text-xl font-extrabold text-slate-900">Transaksi Terakhir</h3>
              <button onClick={() => toast('Halaman riwayat lengkap')} className="text-sm font-semibold text-blue-600 flex items-center hover:text-blue-700">Lihat Semua <ChevronRight size={16}/></button>
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
                    <tr key={tx.id} className="hover:bg-white/70 transition-colors border-b border-slate-200/40 last:border-0 group cursor-pointer" onClick={() => toast(`Detail ID: ${tx.order_id}`)}>
                      <td className="py-4 px-6 flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-sm border shrink-0 ${
                          tx.source === 'Affiliate' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {tx.type === 'Penarikan' ? <ArrowUpRight size={20} /> : tx.type === 'Transfer' ? <ArrowRightLeft size={20} /> : tx.title.includes('Top Up') ? <Download size={20} /> : tx.source === 'Affiliate' ? <Users size={20} /> : <ShoppingBag size={20} />}
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
                        <button className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors ml-auto opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); toast('Menu Opsi Transaksi'); }}>
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
                <button className="text-[13px] font-bold text-white flex items-center gap-2 hover:gap-3 transition-all bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 w-max">
                  Pelajari Selengkapnya <ArrowUpRight size={16}/>
                </button>
              </div>
            </div>

            <div className="w-full lg:w-auto flex flex-col gap-5 relative z-10 bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
               {[
                 { icon: Lock, title: 'Enkripsi Data Tingkat Tinggi', desc: 'Melindungi data dan informasi Anda' },
                 { icon: CheckCircle, title: 'Verifikasi 2 Langkah', desc: 'Lapisan keamanan tambahan untuk akun Anda' },
                 { icon: ShieldCheck, title: 'Sistem Keamanan Berlapis', desc: 'Monitoring 24/7 untuk keamanan transaksi' }
               ].map((item, idx) => (
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

          <p className="text-center text-[13px] font-medium text-slate-400 pt-6">
            © 2026 Oneklik.id. Semua hak cipta dilindungi.
          </p>
        </div>
      </main>
    </div>
  );
}