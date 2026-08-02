import { NextRequest, NextResponse } from 'next/server';
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
// 2. FUNGSI PROSES (SDK iLovePDF)
// ============================================
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextILPKey();
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED'); // Jika key kosong, anggap kuota habis

  try {
    const ilovepdf = new (ILovePDFApi as any)(apiKey);
    const task = ilovepdf.newTask(action === 'compress' ? 'compress' : 'convert');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await task.addFile(fileBuffer as any, file.name);

    if (action === 'compress') {
      await task.process();
    } else {
      await task.process(outputFormat);
    }

    const resultUint8 = await task.download();
    return new Blob([Buffer.from(resultUint8 as any)]);

  } catch (err: any) {
    // === PERBAIKAN LOGIKA ERROR ===
    const msg = (err.message || '').toLowerCase();

    // 1. Jika error 403 atau 401 -> Artinya akun belum diverifikasi atau API Key salah.
    // Ini bukan kuota habis, jadi kita lempar error spesifik agar sistem bisa mencoba key berikutnya.
    if (msg.includes('403') || msg.includes('401')) {
      throw new Error('ILP_AUTH_ERROR: Akun iLovePDF belum diverifikasi atau API Key salah.');
    }

    // 2. Jika error 429 -> Benar-benar kuota habis
    if (msg.includes('429')) {
      throw new Error('ILP_QUOTA_EXCEEDED');
    }

    // 3. Error teknis lainnya (misal: 500, 404 dari SDK)
    throw new Error(msg || 'ILP_PROCESS_ERROR');
  }
}

// ============================================
// 3. MAIN HANDLER (Round-Robin)
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

    // Loop semua key yang tersedia
    for (let attempt = 0; attempt < ILOVEPDF_KEYS.length; attempt++) {
      try {
        resultBlob = await processILovePDF(file, action, outputFormat);
        console.log(`✅ Berhasil menggunakan iLovePDF Key ke-${(attempt % ILOVEPDF_KEYS.length) + 1}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.log(`❌ Key ke-${(attempt % ILOVEPDF_KEYS.length) + 1} gagal: ${err.message}`);

        // Jika error adalah QUOTA atau AUTH (verifikasi/key salah), lanjut ke key berikutnya
        if (err.message === 'ILP_QUOTA_EXCEEDED' || err.message.startsWith('ILP_AUTH_ERROR')) {
          continue;
        }
        // Jika error teknis lainnya, hentikan loop dan laporkan
        break;
      }
    }

    if (!resultBlob) {
      // === PERBAIKAN: Berikan pesan yang tepat sesuai jenis error ===
      if (lastError) {
        // Jika semua key gagal karena autentikasi/verifikasi
        if (lastError.message.startsWith('ILP_AUTH_ERROR')) {
          return NextResponse.json({
            error: 'Akun iLovePDF belum terverifikasi atau API Key salah. Silakan login ke dashboard iloveapi.com, klik link verifikasi di email, lalu coba lagi.'
          }, { status: 403 });
        }
        // Jika semua key gagal karena kuota
        if (lastError.message === 'ILP_QUOTA_EXCEEDED') {
          return NextResponse.json({
            error: 'Semua kuota iLovePDF telah habis. Tambahkan key baru atau tunggu reset bulanan.'
          }, { status: 429 });
        }
      }
      // Fallback error umum
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