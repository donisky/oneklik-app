import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ============================================
// 1. KONFIGURASI & CACHE TOKEN
// ============================================
const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1 || '',
  process.env.ILOVEPDF_KEY_2 || '',
  process.env.ILOVEPDF_KEY_3 || '',
  process.env.ILOVEPDF_KEY_4 || '',
  process.env.ILOVEPDF_KEY_5 || '',
].filter(key => key !== '');

let ilpIndex = 0;

// Cache token untuk menghindari request auth berulang kali
let tokenCache: { token: string; expiresAt: number } | null = null;

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++;
  return key;
}

// ============================================
// 2. FUNGSI UNTUK MENDAPATKAN SIGNED TOKEN (AUTH)
// ============================================
async function getILovePDFToken(publicKey: string): Promise<string> {
  // Cek cache token (dengan asumsi token berlaku 1 jam)
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const authRes = await fetch('https://api.ilovepdf.com/v1/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: publicKey }),
  });

  if (!authRes.ok) {
    const errText = await authRes.text();
    if (authRes.status === 403 || authRes.status === 401) {
      throw new Error(`ILP_AUTH_ERROR: Public Key tidak valid. ${errText}`);
    }
    throw new Error(`ILP_AUTH_FAILED: ${authRes.status} - ${errText}`);
  }

  const authData = await authRes.json();
  const token = authData.token;

  // Simpan ke cache (kedaluwarsa 1 jam, atau sesuai expires_in jika ada di respons)
  tokenCache = { token, expiresAt: Date.now() + 60 * 60 * 1000 };
  return token;
}

// ============================================
// 3. FUNGSI PROSES UTAMA (REST API Workflow)
// ============================================
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const publicKey = getNextILPKey();
  if (!publicKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
    // LANGKAH 1: Dapatkan Signed Token
    const token = await getILovePDFToken(publicKey);

    // LANGKAH 2: Mulai Task
    const startRes = await fetch('https://api.ilovepdf.com/v1/start', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      if (startRes.status === 401 || startRes.status === 403) throw new Error('ILP_AUTH_ERROR');
      throw new Error(`ILP_START_ERROR: ${errText}`);
    }

    const { task, server } = await startRes.json();

    // LANGKAH 3: Upload file ke server yang diberikan
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadRes = await fetch(server, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error(`ILP_UPLOAD_ERROR: ${await uploadRes.text()}`);

    // LANGKAH 4: Proses file (Compress / Convert)
    const processRes = await fetch('https://api.ilovepdf.com/v1/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: task,
        tool: action === 'compress' ? 'compress' : 'convert',
        output_format: outputFormat,
      }),
    });

    if (!processRes.ok) {
      const errText = await processRes.text();
      if (processRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
      if (processRes.status === 401 || processRes.status === 403) throw new Error('ILP_AUTH_ERROR');
      throw new Error(`ILP_PROCESS_ERROR: ${errText}`);
    }

    // LANGKAH 5: Download hasil
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!downloadRes.ok) throw new Error(`ILP_DOWNLOAD_ERROR: ${await downloadRes.text()}`);

    const rawBytes = await downloadRes.arrayBuffer();
    return new Blob([Buffer.from(rawBytes) as any]);

  } catch (err: any) {
    // Reset token cache jika terjadi error autentikasi
    if (err.message === 'ILP_AUTH_ERROR' || err.message.startsWith('ILP_AUTH_ERROR')) {
      tokenCache = null;
    }
    throw err;
  }
}

// ============================================
// 4. MAIN HANDLER (Round-Robin Multi-Key)
// ============================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;
    const outputFormat = formData.get('outputFormat') as string || 'pdf';

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

    let resultBlob: Blob | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt < ILOVEPDF_KEYS.length; attempt++) {
      try {
        resultBlob = await processILovePDF(file, action, outputFormat);
        console.log(`✅ Berhasil pakai ILP Key ke-${attempt + 1}`);
        break;
      } catch (err: any) {
        lastError = err;
        // Jika error kuota atau auth, lanjut ke key berikutnya
        if (err.message === 'ILP_QUOTA_EXCEEDED' || err.message.startsWith('ILP_AUTH_ERROR')) continue;
        break;
      }
    }

    if (!resultBlob) {
      if (lastError?.message.startsWith('ILP_AUTH_ERROR')) {
        return NextResponse.json({ error: 'Public Key iLovePDF tidak valid. Silakan buat Public Key baru di dashboard.' }, { status: 403 });
      }
      if (lastError?.message === 'ILP_QUOTA_EXCEEDED') {
        return NextResponse.json({ error: 'Semua kuota iLovePDF telah habis. Tambahkan key baru atau tunggu reset.' }, { status: 429 });
      }
      return NextResponse.json({ error: lastError?.message || 'Gagal memproses file.' }, { status: 500 });
    }

    const ext = action === 'compress' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${ext}`;
    return new NextResponse(resultBlob, {
      headers: { 'Content-Type': resultBlob.type, 'Content-Disposition': `attachment; filename="${fileName}"` },
    });

  } catch (error: any) {
    console.error('🔥 Master API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}