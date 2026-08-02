import { NextRequest, NextResponse } from 'next/server';
// Import SDK secara default
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
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
    // === PERBAIKAN ERROR 1: Inisialisasi SDK tanpa secretKey ===
    // Menggunakan 'as any' pada konstruktor untuk melewati validasi argumen TypeScript
    const ilovepdf = new (ILovePDFApi as any)(apiKey);

    // Buat task
    const task = ilovepdf.newTask(action === 'compress' ? 'compress' : 'convert');

    // === PERBAIKAN ERROR 2: Kirim Buffer tanpa error TypeScript ===
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await task.addFile(fileBuffer as any, file.name);

    // Proses task
    if (action === 'compress') {
      await task.process();
    } else {
      await task.process(outputFormat);
    }

    // Download hasil
    const resultUint8 = await task.download();
    
    // Kembalikan sebagai Blob
    return new Blob([Buffer.from(resultUint8 as any)]);

  } catch (err: any) {
    // Tangani error kuota / invalid key
    if (err.message?.includes('429') || err.message?.includes('403') || err.message?.includes('401')) {
      throw new Error('ILP_QUOTA_EXCEEDED');
    }
    throw new Error(err.message || 'ILP_PROCESS_ERROR');
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

        if (err.message === 'ILP_QUOTA_EXCEEDED') continue;
        break;
      }
    }

    if (!resultBlob) {
      if (lastError && lastError.message === 'ILP_QUOTA_EXCEEDED') {
        return NextResponse.json({ 
          error: 'Semua kuota iLovePDF telah habis. Tambahkan key baru atau tunggu reset bulanan.' 
        }, { status: 429 });
      }
      return NextResponse.json({ error: lastError?.message || 'Semua key gagal' }, { status: 500 });
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