import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1 || '',
  process.env.ILOVEPDF_KEY_2 || '',
  process.env.ILOVEPDF_KEY_3 || '',
  process.env.ILOVEPDF_KEY_4 || '',
  process.env.ILOVEPDF_KEY_5 || '',
].filter(key => key !== '');

let ilpIndex = 0;
let tokenCache: { token: string; expiresAt: number } | null = null;

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++;
  return key;
}

// ============================================
// FUNGSI AUTH DENGAN PENCEKAN ERROR LEBIH KETAT
// ============================================
async function getILovePDFToken(publicKey: string): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token;

  const authRes = await fetch('https://api.ilovepdf.com/v1/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_key: publicKey }),
  });

  // === PERBAIKAN: Baca text dulu, coba parse JSON ===
  const rawText = await authRes.text();
  
  if (!authRes.ok) {
    console.error('🔥 iLovePDF Auth Raw Response:', rawText);
    throw new Error(`ILP_AUTH_ERROR: ${authRes.status} - ${rawText.substring(0, 200)}`);
  }

  // Coba parse JSON
  let authData;
  try {
    authData = JSON.parse(rawText);
  } catch (e) {
    console.error('🔥 iLovePDF Auth Parse Error (Server returned non-JSON):', rawText);
    throw new Error('ILP_AUTH_ERROR: Server iLovePDF mengembalikan respons tidak valid.');
  }

  if (!authData.token) {
    throw new Error(`ILP_AUTH_ERROR: Respons auth tidak mengandung token. Data: ${JSON.stringify(authData)}`);
  }

  tokenCache = { token: authData.token, expiresAt: Date.now() + 60 * 60 * 1000 };
  return authData.token;
}

// ... (sisa fungsi processILovePDF dan POST handler tetap sama persis seperti kode sebelumnya)
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const publicKey = getNextILPKey();
  if (!publicKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
    const token = await getILovePDFToken(publicKey);

    const startRes = await fetch('https://api.ilovepdf.com/v1/start', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!startRes.ok) throw new Error(`ILP_START_ERROR: ${await startRes.text()}`);

    const { task, server } = await startRes.json();

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadRes = await fetch(server, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error(`ILP_UPLOAD_ERROR: ${await uploadRes.text()}`);

    const processRes = await fetch('https://api.ilovepdf.com/v1/process', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, tool: action === 'compress' ? 'compress' : 'convert', output_format: outputFormat }),
    });
    if (!processRes.ok) {
      const errText = await processRes.text();
      if (processRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
      throw new Error(`ILP_PROCESS_ERROR: ${errText}`);
    }

    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!downloadRes.ok) throw new Error(`ILP_DOWNLOAD_ERROR: ${await downloadRes.text()}`);

    const rawBytes = await downloadRes.arrayBuffer();
    return new Blob([Buffer.from(rawBytes) as any]);

  } catch (err: any) {
    if (err.message.startsWith('ILP_AUTH_ERROR')) {
      tokenCache = null;
    }
    throw err;
  }
}

export async function POST(req: NextRequest) {
  // ... (logika POST handler dari kode sebelumnya, tidak berubah)
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
        if (err.message === 'ILP_QUOTA_EXCEEDED' || err.message.startsWith('ILP_AUTH_ERROR')) continue;
        break;
      }
    }

    if (!resultBlob) {
      if (lastError?.message.startsWith('ILP_AUTH_ERROR')) {
        return NextResponse.json({ error: `Public Key iLovePDF tidak valid. Detail: ${lastError.message}` }, { status: 403 });
      }
      if (lastError?.message === 'ILP_QUOTA_EXCEEDED') {
        return NextResponse.json({ error: 'Semua kuota iLovePDF telah habis.' }, { status: 429 });
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