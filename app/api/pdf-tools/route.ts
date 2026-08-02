import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export const runtime = 'nodejs';
export const maxDuration = 120; // Adobe membutuhkan waktu lebih lama

// ============================================
// 1. KONFIGURASI
// ============================================
const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1 || '',
  process.env.ILOVEPDF_KEY_2 || '',
  process.env.ILOVEPDF_KEY_3 || '',
  process.env.ILOVEPDF_KEY_4 || '',
  process.env.ILOVEPDF_KEY_5 || '',
].filter(key => key !== '');

const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID || '';
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET || '';

let ilpIndex = 0;

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++;
  return key;
}

// ============================================
// 2. iLovePDF
// ============================================
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextILPKey();
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED');

  try {
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
    const { task, server } = await startRes.json();

    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadRes = await fetch(server, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error('ILP_UPLOAD_ERROR');

    const processRes = await fetch(`https://api.ilovepdf.com/v1/process`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task,
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

    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!downloadRes.ok) throw new Error('ILP_DOWNLOAD_ERROR');

    const rawBytes = await downloadRes.arrayBuffer();
    return new Blob([Buffer.from(rawBytes) as any]);
    
  } catch (err: any) {
    if (err.message === 'ILP_QUOTA_EXCEEDED') throw new Error('ILP_QUOTA_EXCEEDED');
    console.warn('iLovePDF error:', err.message);
    throw new Error('ILP_QUOTA_EXCEEDED');
  }
}

// ============================================
// 3. Adobe (via REST API)
// ============================================
async function processAdobe(file: File, action: string, outputFormat: string): Promise<Blob> {
  if (!ADOBE_CLIENT_ID || !ADOBE_CLIENT_SECRET) {
    throw new Error('ADOBE_NOT_CONFIGURED');
  }

  try {
    // 1. Dapatkan Access Token
    const tokenRes = await fetch('https://ims-na1.adobelogin.com/ims/token/v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': ADOBE_CLIENT_ID,
        'client_secret': ADOBE_CLIENT_SECRET,
        'scope': 'dcp.services'
      })
    });
    if (!tokenRes.ok) {
      if (tokenRes.status === 429) throw new Error('ADOBE_QUOTA_EXCEEDED');
      throw new Error('ADOBE_TOKEN_ERROR');
    }
    const { access_token } = await tokenRes.json();

    // 2. Upload file ke Adobe
    const fileBuffer = await file.arrayBuffer();
    const uploadRes = await fetch('https://dcp-uploads-na1.adobe.io/v1/media', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'x-api-key': ADOBE_CLIENT_ID,
        'Content-Type': file.type,
      },
      body: fileBuffer,
    });
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`ADOBE_UPLOAD_ERROR: ${errText}`);
    }
    const { assetId } = await uploadRes.json();

    // 3. Buat Job
    const jobPayload: any = {
      operation: 'pdf_services',
      input: { assetId }
    };
    if (action === 'compress') {
      jobPayload.output = { format: 'pdf' };
    } else {
      jobPayload.output = { format: outputFormat };
    }

    const jobRes = await fetch('https://dcp-na1.adobe.io/v1/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'x-api-key': ADOBE_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobPayload),
    });
    if (!jobRes.ok) {
      const errText = await jobRes.text();
      throw new Error(`ADOBE_JOB_ERROR: ${errText}`);
    }
    const { jobId } = await jobRes.json();

    // 4. Polling status job
    let resultAssetId: string | null = null;
    for (let i = 0; i < 40; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusRes = await fetch(`https://dcp-na1.adobe.io/v1/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'x-api-key': ADOBE_CLIENT_ID,
        },
      });
      const statusData = await statusRes.json();
      if (statusData.jobStatus === 'DONE') {
        resultAssetId = statusData.output.assetId;
        break;
      } else if (statusData.jobStatus === 'FAILED') {
        throw new Error('ADOBE_PROCESS_ERROR');
      }
    }
    if (!resultAssetId) throw new Error('ADOBE_TIMEOUT');

    // 5. Download hasil
    const downloadRes = await fetch(`https://dcp-na1.adobe.io/v1/assets/${resultAssetId}/binary`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'x-api-key': ADOBE_CLIENT_ID,
      },
    });
    if (!downloadRes.ok) throw new Error('ADOBE_DOWNLOAD_ERROR');

    return await downloadRes.blob();
  } catch (err: any) {
    if (err.message?.includes('429') || err.message?.includes('403')) {
      throw new Error('ADOBE_QUOTA_EXCEEDED');
    }
    throw new Error(err.message || 'ADOBE_PROCESS_ERROR');
  }
}

// ============================================
// 4. Fallback pdf-lib
// ============================================
async function fallbackPDFLib(file: File, action: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pdfBytes = await pdfDoc.save({
    useObjectStreams: false,
    addDefaultPage: false,
  });
  // === PERBAIKAN ERROR: Cast pdfBytes menjadi any ===
  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

// ============================================
// 5. Main Handler
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

    // Urutan: ILP → Adobe → pdf-lib
    const providers = [
      { name: 'ILP', func: () => processILovePDF(file, action, outputFormat) },
      { name: 'Adobe', func: () => processAdobe(file, action, outputFormat) },
      { name: 'pdf-lib', func: () => fallbackPDFLib(file, action) },
    ];

    for (const provider of providers) {
      try {
        resultBlob = await provider.func();
        console.log(`✅ Berhasil menggunakan ${provider.name}`);
        break;
      } catch (err: any) {
        console.log(`❌ ${provider.name} gagal: ${err.message}`);
        // Lanjut ke provider berikutnya
        continue;
      }
    }

    if (!resultBlob) {
      return NextResponse.json({ error: 'Semua provider gagal' }, { status: 500 });
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