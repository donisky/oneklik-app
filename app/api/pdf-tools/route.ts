import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ============================================
// 1. KONFIGURASI API KEYS (Dapat diisi hingga 5 key)
// ============================================
const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1 || '',
  process.env.ILOVEPDF_KEY_2 || '',
  process.env.ILOVEPDF_KEY_3 || '',
  process.env.ILOVEPDF_KEY_4 || '',
  process.env.ILOVEPDF_KEY_5 || '',
].filter(key => key !== '');

// ============================================
// 2. STATE ROUND-ROBIN (Global di memori server)
// ============================================
let ilpIndex = 0;

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++;
  return key;
}

// ============================================
// 3. FUNGSI PROSES iLovePDF
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
      const errText = await startRes.text();
      console.error(`iLovePDF Start Error [${startRes.status}]: ${errText}`);

      if (startRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
      if (startRes.status === 403 || startRes.status === 400) {
        throw new Error(`ILP_KEY_ERROR: Akun iLovePDF belum diverifikasi atau API Key salah. (${errText})`);
      }
      throw new Error(`ILP_START_ERROR: ${startRes.status} - ${errText}`);
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
      const errText = await processRes.text();
      console.error(`iLovePDF Process Error [${processRes.status}]: ${errText}`);
      if (processRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
      if (processRes.status === 403 || processRes.status === 400) {
        throw new Error(`ILP_KEY_ERROR: Akun iLovePDF belum diverifikasi atau API Key salah. (${errText})`);
      }
      throw new Error(`ILP_PROCESS_ERROR: ${errText}`);
    }

    // 4. Download hasil
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!downloadRes.ok) throw new Error('ILP_DOWNLOAD_ERROR');

    const rawBytes = await downloadRes.arrayBuffer();
    return new Blob([Buffer.from(rawBytes) as any]);
    
  } catch (err: any) {
    // Jika error kuota, lempar ke atas agar sistem coba key berikutnya
    if (err.message === 'ILP_QUOTA_EXCEEDED') throw new Error('ILP_QUOTA_EXCEEDED');
    // Jika error key/verifikasi, langsung lempar ke pengguna (tidak fallback)
    throw err;
  }
}

// ============================================
// 4. MAIN HANDLER (Master API Route - Hanya iLovePDF)
// ============================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;
    const outputFormat = formData.get('outputFormat') as string || 'pdf';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    let resultBlob: Blob | null = null;
    let lastError: any = null;

    // Loop mencoba semua key yang tersedia
    for (let attempt = 0; attempt < ILOVEPDF_KEYS.length; attempt++) {
      try {
        resultBlob = await processILovePDF(file, action, outputFormat);
        console.log(`✅ Berhasil menggunakan iLovePDF Key ke-${(attempt % ILOVEPDF_KEYS.length) + 1}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.log(`❌ Key ke-${(attempt % ILOVEPDF_KEYS.length) + 1} gagal: ${err.message}`);

        // Jika error kuota, lanjut ke key berikutnya
        if (err.message === 'ILP_QUOTA_EXCEEDED') {
          continue;
        }
        // Jika error lain (key salah, verifikasi gagal), hentikan loop dan laporkan error
        break;
      }
    }

    // Jika tidak ada key yang berhasil
    if (!resultBlob) {
      if (lastError) {
        // Jika error adalah kuota untuk semua key
        if (lastError.message === 'ILP_QUOTA_EXCEEDED') {
          return NextResponse.json({ 
            error: 'Maaf, semua kuota iLovePDF telah habis. Tambahkan key baru atau tunggu reset bulanan.' 
          }, { status: 429 });
        }
        // Jika error lain, kembalikan pesan asli
        return NextResponse.json({ error: lastError.message }, { status: 500 });
      }
      return NextResponse.json({ error: 'Semua iLovePDF Key gagal tanpa alasan jelas.' }, { status: 500 });
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