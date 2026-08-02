import { NextRequest, NextResponse } from 'next/server';
// Import default SDK
import ILovePDFApi from '@ilovepdf/ilovepdf-nodejs';

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
// 2. FUNGSI PROSES menggunakan SDK
// ============================================
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextILPKey();
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
    // PERBAIKAN: Bypass error secretKey dengan casting ke any
    const ilovepdf = new (ILovePDFApi as any)(apiKey);

    // Buat task (compress / convert)
    const task = ilovepdf.newTask(action === 'compress' ? 'compress' : 'convert');

    // Upload file (perbaiki error Buffer)
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await task.addFile(fileBuffer as any, file.name);

    // Proses file
    if (action === 'compress') {
      await task.process();
    } else {
      await task.process(outputFormat);
    }

    // Download hasil
    const resultUint8 = await task.download();
    return new Blob([Buffer.from(resultUint8 as any)]);

  } catch (err: any) {
    // Log error asli dari SDK agar kita bisa melihat detailnya di Vercel Logs
    console.error('🔥 ERROR ILOVEPDF SDK:', err);

    // Coba ambil status code dari error response
    const status = err?.response?.status || err?.status || 0;
    const errorMsg = err?.response?.data || err?.message || 'Unknown SDK error';

    // 1. Jika kuota habis (429)
    if (status === 429) throw new Error('ILP_QUOTA_EXCEEDED');

    // 2. Jika autentikasi gagal (403 / 401)
    if (status === 403 || status === 401) {
      throw new Error(`ILP_AUTH_ERROR: ${JSON.stringify(errorMsg)}`);
    }

    // 3. Jika endpoint tidak ditemukan (404) atau error lain (500)
    // Kita lemparkan ke atas agar sistem mencoba Key berikutnya
    console.warn(`⚠️ ILP Key gagal dengan error: ${status} - ${errorMsg}`);
    throw new Error('ILP_QUOTA_EXCEEDED'); // Paksa fallback ke key berikutnya
  }
}

// ============================================
// 3. MAIN HANDLER (Round-Robin multi-key)
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

    // Loop mencoba semua key iLovePDF
    for (let attempt = 0; attempt < ILOVEPDF_KEYS.length; attempt++) {
      try {
        resultBlob = await processILovePDF(file, action, outputFormat);
        console.log(`✅ Berhasil menggunakan iLovePDF Key ke-${(attempt % ILOVEPDF_KEYS.length) + 1}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.log(`❌ Key ke-${(attempt % ILOVEPDF_KEYS.length) + 1} gagal: ${err.message}`);

        // Lanjut ke key berikutnya jika error kuota atau autentikasi
        if (err.message === 'ILP_QUOTA_EXCEEDED' || err.message.startsWith('ILP_AUTH_ERROR')) {
          continue;
        }
        // Jika error teknis lainnya (misal: 404 dari SDK), hentikan loop dan laporkan
        break;
      }
    }

    if (!resultBlob) {
      if (lastError) {
        if (lastError.message.startsWith('ILP_AUTH_ERROR')) {
          return NextResponse.json({
            error: 'Akun iLovePDF belum terverifikasi atau API Key salah. Silakan login ke dashboard iloveapi.com, buat Public Key baru, lalu coba lagi.'
          }, { status: 403 });
        }
        if (lastError.message === 'ILP_QUOTA_EXCEEDED') {
          return NextResponse.json({
            error: 'Semua kuota iLovePDF telah habis. Tambahkan key baru atau tunggu reset bulanan.'
          }, { status: 429 });
        }
      }
      return NextResponse.json({ error: lastError?.message || 'Semua key gagal diproses.' }, { status: 500 });
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