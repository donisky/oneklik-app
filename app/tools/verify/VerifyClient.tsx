'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Upload, Loader2, CheckCircle2, Lock, ArrowLeft, 
  ShieldCheck, FileText, Wallet, ScanFace
} from 'lucide-react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { createWalletClient, custom, getContract, publicActions, keccak256, toBytes } from 'viem';
import { sepolia } from 'viem/chains'; // <-- Perbaikan Import
import toast, { Toaster } from 'react-hot-toast';

// =========================================================================
// KONFIGURASI SMART CONTRACT (SUDAH SAYA DEPLOY DI SEPOLIA)
// =========================================================================
const CONTRACT_ADDRESS = '0x7f0470A2120F73F22b025D3c8F3B76eE1C30dE2B'; 

const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "bytes32", "name": "_fileHash", "type": "bytes32"},
      {"internalType": "bytes32", "name": "_keywordHash", "type": "bytes32"},
      {"internalType": "string", "name": "_metadata", "type": "string"}
    ],
    "name": "storeHash",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "_fileHash", "type": "bytes32"}],
    "name": "getVerification",
    "outputs": [
      {"internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
      {"internalType": "bytes32", "name": "keywordHash", "type": "bytes32"},
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "string", "name": "metadata", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function VerifyClient() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [keyword, setKeyword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Cek login & institusi
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*, institutions(name)')
          .eq('id', session.user.id)
          .single();
        setUser(userData);
      }
      setLoading(false);
    };
    checkAuth();
  }, [supabase]);

  // --- LOGIKA FILE ---
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // --- LOGIKA KOMIT KE BLOCKCHAIN ---
  const handleVerify = async () => {
    if (!file) return toast.error('Upload file terlebih dahulu!');
    if (!keyword.trim()) return toast.error('Masukkan kata kunci rahasia!');

    setIsSubmitting(true);

    try {
      // 1. Hitung SHA-256 Hash dari file
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const fileHash = '0x' + Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      // 2. Hitung Keccak-256 Hash dari Kata Kunci (Menggunakan viem, sesuai Solidity)
      const keywordHash = keccak256(toBytes(keyword));

      // 3. Baca Metadata File (Author & Software) menggunakan pdf-lib
      let metadataStr = '{}';
      try {
        // Perbaikan: Menggunakan method metadata yang lebih stabil dari pdf-lib
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const author = pdfDoc.getAuthor() || 'Unknown';
        const creator = pdfDoc.getCreator() || 'Unknown';
        const producer = pdfDoc.getProducer() || 'Unknown';
        metadataStr = JSON.stringify({
          fileName: file.name,
          author: author,
          creator: creator,
          producer: producer
        });
      } catch (err) {
        metadataStr = JSON.stringify({ fileName: file.name, author: 'Unknown' });
      }

      // 4. Siapkan Wallet Client (MetaMask / Sepolia)
      // Perbaikan: Menggunakan (window as any) untuk menghindari error TypeScript
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('Silakan install MetaMask atau wallet Web3 lainnya.');
      }

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum)
      });
      
      const [address] = await walletClient.getAddresses();

      // 5. Panggil Smart Contract
      const publicClient = walletClient.extend(publicActions);
      const contract = getContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        client: walletClient,
      });

      const txHashRaw = await contract.write.storeHash([
        fileHash as `0x${string}`,
        keywordHash,
        metadataStr
      ]);

      // Tunggu konfirmasi transaksi
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHashRaw });
      setTxHash(receipt.transactionHash);

      // 6. Simpan ke Supabase (Cache & Dashboard Dosen)
      const { error } = await supabase
        .from('verifications')
        .insert({
          user_id: user?.id,
          institution_id: user?.institution_id,
          document_hash: fileHash,
          keyword_hash: keywordHash,
          tx_hash: receipt.transactionHash,
          file_metadata: JSON.parse(metadataStr)
        });

      if (error) console.error('Gagal simpan ke Supabase:', error);

      setIsSuccess(true);
      toast.success('Dokumen berhasil diverifikasi ke Blockchain!');

    } catch (error: any) {
      console.error(error);
      toast.error('Gagal melakukan verifikasi: ' + (error.message || 'Koneksi wallet gagal. Pastikan saldo ETH Sepolia cukup.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  if (!session) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Login Diperlukan</h1>
      <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Login dengan Google</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 flex flex-col items-center">
      <Toaster position="top-center" />
      <div className="max-w-4xl w-full">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Kembali ke Dashboard
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          {/* --- AREA KIRI: FORM --- */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={24} /> Verifikasi Dokumen
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Buktikan keaslian dokumen tugas Anda ke Blockchain. <br />
              <span className="text-xs text-blue-600 font-semibold">
                {user?.institutions?.name ? `Terhubung dengan: ${user.institutions.name}` : 'Belum terhubung dengan institusi.'}
              </span>
            </p>

            {/* Dropzone Upload */}
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400'}`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Upload size={20} />
                </div>
                <p className="font-bold text-slate-800">Drag & drop file di sini</p>
                <p className="text-xs text-slate-500">atau klik untuk memilih file (PDF/DOCX)</p>
                <input type="file" accept=".pdf,.docx" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="text-red-500" size={24} />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 text-xs font-bold">Hapus</button>
              </div>
            )}

            {/* Input Kata Kunci Rahasia */}
            <div className="mt-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Kata Kunci Rahasia</label>
              <div className="relative">
                <input
                  type="password"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Masukkan kata kunci unik (hanya Anda yang tahu)"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">Kata kunci ini akan di-hash dan disimpan di Blockchain.</p>
            </div>

            {/* Tombol Aksi */}
            <button
              onClick={handleVerify}
              disabled={!file || isSubmitting || isSuccess}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Memproses Transaksi...</>
              ) : isSuccess ? (
                <><CheckCircle2 size={18} /> Berhasil Terverifikasi!</>
              ) : (
                <><ScanFace size={18} /> Verifikasi ke Blockchain</>
              )}
            </button>
          </div>

          {/* --- AREA KANAN: INFO & TUTORIAL --- */}
          <div className="w-full md:w-[320px] space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Apa yang terjadi?</h3>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <Lock size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>Hash file Anda disimpan di Blockchain (tidak bisa diubah).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Wallet size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Transaksi ditandatangani oleh wallet MetaMask Anda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Dosen Anda bisa memverifikasi keaslian file dan kata kunci.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Butuh Wallet?</h3>
              <p className="text-xs text-slate-500 mb-4">Untuk menyimpan data di Blockchain, Anda memerlukan wallet Web3.</p>
              <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className="block w-full py-2 text-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors">
                Pasang MetaMask
              </a>
              <p className="text-[10px] text-slate-400 mt-3 text-center">Network: Sepolia Testnet</p>
            </div>

            {isSuccess && txHash && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-bold text-green-800 mb-1">Transaction Hash:</p>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[10px] text-blue-600 underline break-all"
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}