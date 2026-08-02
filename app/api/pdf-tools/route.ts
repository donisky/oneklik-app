import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ============================================
// 1. KONFIGURASI API KEYS
// ============================================
const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1 || '',
  process.env.ILOVEPDF_KEY_2 || '',
  process.env.ILOVEPDF_KEY_3 || '',
  process.env.ILOVEPDF_KEY_4 || '',
  process.env.ILOVEPDF_KEY_5 || '',
].filter(key => key !== '');

let ilpIndex = 0;

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++;
  return key;
}

// ============================================
// 2. FUNGSI PROSES (REST API Manual - Stabil)
// ============================================
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextILPKey();
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
    // --- 1. GET START (Mendapatkan Task ID & Server URL) ---
    const startRes = await fetch('https://api.ilovepdf.com/v1/start', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      // 403 = Forbidden (Key salah / Akun belum diverifikasi)
      // 429 = Kuota habis
      if (startRes.status === 403 || startRes.status === 401) {
        throw new Error(`ILP_AUTH_ERROR: ${errText}`);
      }
      if (startRes.status === 429) {
        throw new Error('ILP_QUOTA_EXCEEDED');
      }
      throw new Error(`ILP_START_ERROR: ${errText}`);
    }

    const startData = await startRes.json();
    const { task, server } = startData;

    // --- 2. UPLOAD FILE ---
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadRes = await fetch(server, { method: 'POST', body: uploadForm });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`ILP_UPLOAD_ERROR: ${errText}`);
    }

    // --- 3. PROCESS FILE (Compress atau Convert) ---
    const processRes = await fetch('https://api.ilovepdf.com/v1/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      if (processRes.status === 403 || processRes.status === 401) {
        throw new Error(`ILP_AUTH_ERROR: ${errText}`);
      }
      if (processRes.status === 429) {
        throw new Error('ILP_QUOTA_EXCEEDED');
      }
      throw new Error(`ILP_PROCESS_ERROR: ${errText}`);
    }

    // --- 4. DOWNLOAD HASIL ---
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!downloadRes.ok) {
      const errText = await downloadRes.text();
      throw new Error(`ILP_DOWNLOAD_ERROR: ${errText}`);
    }

    const rawBytes = await downloadRes.arrayBuffer();
    return new Blob([Buffer.from(rawBytes) as any]);

  } catch (err: any) {
    // Propagasi error untuk Main Handler
    if (err.message.startsWith('ILP_AUTH_ERROR')) throw new Error(err.message);
    if (err.message === 'ILP_QUOTA_EXCEEDED') throw new Error('ILP_QUOTA_EXCEEDED');
    throw new Error(err.message);
  }
}

// ============================================
// 3. MAIN HANDLER (Round-Robin Multi-Key)
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
        // Jika key ini error karena kuota atau auth, lanjut ke key berikutnya
        if (err.message === 'ILP_QUOTA_EXCEEDED' || err.message.startsWith('ILP_AUTH_ERROR')) continue;
        // Jika error teknis, berhenti loop
        break;
      }
    }

    if (!resultBlob) {
      if (lastError?.message.startsWith('ILP_AUTH_ERROR')) {
        return NextResponse.json({ error: 'Akun iLovePDF belum diverifikasi. Silakan cek email Anda atau buat Public Key baru di dashboard iloveapi.com.' }, { status: 403 });
      }
      if (lastError?.message === 'ILP_QUOTA_EXCEEDED') {
        return NextResponse.json({ error: 'Semua kuota iLovePDF telah habis. Tambahkan key baru atau tunggu reset.' }, { status: 429 });
      }
      return NextResponse.json({ error: lastError?.message || 'Gagal memproses file.' }, { status: 500 });
    }

    const ext = action === 'compress' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${ext}`;
    return new NextResponse(resultBlob, { headers: { 'Content-Type': resultBlob.type, 'Content-Disposition': `attachment; filename="${fileName}"` } });

  } catch (error: any) {
    console.error('🔥 Master API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}