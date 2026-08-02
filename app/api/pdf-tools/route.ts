import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ============================================
// 1. BACA KONFIGURASI DARI ENVIRONMENT (Bisa hingga 5 Key)
// ============================================
const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1 || '',
  process.env.ILOVEPDF_KEY_2 || '',
  process.env.ILOVEPDF_KEY_3 || '',
  process.env.ILOVEPDF_KEY_4 || '',
  process.env.ILOVEPDF_KEY_5 || '',
].filter(key => key !== '');

// ============================================
// 2. STATE ROUND-ROBIN UNTUK ILP
// ============================================
let ilpIndex = 0;

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++; // Akan terus bergeser, sehingga jika Key 1 habis, sistem akan coba Key 2, dst.
  return key;
}

// ============================================
// 3. FUNGSI PROSES: iLovePDF (Manual Fetch - 100% Stabil)
// ============================================
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextILPKey();
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
    // 1. Mulai Task
    const startRes = await fetch('https://api.ilovepdf.com/v1/start', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!startRes.ok) {
      if (startRes.status === 400 || startRes.status === 403 || startRes.status === 429) {
        throw new Error('ILP_QUOTA_EXCEEDED');
      }
      throw new Error(`ILP_START_ERROR: ${startRes.status}`);
    }

    const startData = await startRes.json();
    const { task, server } = startData;

    // 2. Upload file
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadRes = await fetch(server, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error('ILP_UPLOAD_ERROR');

    // 3. Proses file (compress / convert)
    const processRes = await fetch(`https://api.ilovepdf.com/v1/process`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: task,
        tool: action === 'compress' ? 'compress' : 'convert',
        output_format: outputFormat,
      }),
    });
    if (!processRes.ok) {
      if (processRes.status === 400 || processRes.status === 403 || processRes.status === 429) {
        throw new Error('ILP_QUOTA_EXCEEDED');
      }
      throw new Error(`ILP_PROCESS_ERROR: ${processRes.status}`);
    }

    // 4. Download hasil
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!downloadRes.ok) throw new Error('ILP_DOWNLOAD_ERROR');

    const rawBytes = await downloadRes.arrayBuffer();
    return new Blob([rawBytes]);
    
  } catch (err: any) {
    // PENTING: Jika error kuota/key invalid, kita lempar ke atas agar sistem ganti key
    if (err.message === 'ILP_QUOTA_EXCEEDED') throw new Error('ILP_QUOTA_EXCEEDED');
    console.warn('iLovePDF unexpected error:', err.message);
    throw new Error('ILP_QUOTA_EXCEEDED'); // Paksa fallback ke key berikutnya
  }
}

// ============================================
// 4. MAIN HANDLER (Master API Route - Hanya iLovePDF Round-Robin)
// ============================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string; // 'compress' atau 'convert'
    const outputFormat = formData.get('outputFormat') as string || 'pdf';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    let resultBlob: Blob | null = null;
    let lastError: any = null;

    // LOOPING MENCARI KEY YANG BERHASIL (Round-Robin)
    // Akan mencoba Key 1, Key 2, Key 3, dst.
    for (let attempt = 0; attempt < ILOVEPDF_KEYS.length + 1; attempt++) {
      try {
        resultBlob = await processILovePDF(file, action, outputFormat);
        console.log(`✅ Berhasil menggunakan iLovePDF Key ke-${(ilpIndex - 1) % ILOVEPDF_KEYS.length + 1}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.log(`❌ Key ke-${(ilpIndex - 1) % ILOVEPDF_KEYS.length + 1} gagal, mencoba key berikutnya...`);
        // Jika error bukan quota (misal error teknis), kita berhenti dan laporkan error
        if (err.message !== 'ILP_QUOTA_EXCEEDED' && !err.message.includes('403') && !err.message.includes('429')) {
           break; 
        }
        // Jika quota habis, loop akan lanjut ke key berikutnya
        continue;
      }
    }

    if (!resultBlob) {
      return NextResponse.json({ error: lastError?.message || 'Semua iLovePDF Key telah habis kuotanya.' }, { status: 429 });
    }

    const ext = action === 'compress' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${ext}`;

    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': resultBlob.type,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('🔥 Master API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}