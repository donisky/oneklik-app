import { NextRequest, NextResponse } from 'next/server';

// ============================================
// PERBAIKAN: Runtime Node.js & maxDuration (untuk file besar)
// ============================================
export const runtime = 'nodejs';
export const maxDuration = 60;
// ============================================
// 1. KONFIGURASI API KEYS (DARI ENVIRONMENT VARIABLES)
// ============================================

// CloudConvert – array dari env (bisa diisi beberapa key)
const CLOUDCONVERT_KEYS = [
  process.env.CLOUDCONVERT_KEY_1,
  process.env.CLOUDCONVERT_KEY_2,
  process.env.CLOUDCONVERT_KEY_3,
].filter((key): key is string => !!key); // filter yang kosong/undefined

// iLovePDF – array dari env
const ILOVEPDF_KEYS = [
  process.env.ILOVEPDF_KEY_1,
  process.env.ILOVEPDF_KEY_2,
  process.env.ILOVEPDF_KEY_3,
].filter((key): key is string => !!key);

// Adobe – Client ID & Secret dari env
const ADOBE_CLIENT_ID = process.env.ADOBE_CLIENT_ID || '';
const ADOBE_CLIENT_SECRET = process.env.ADOBE_CLIENT_SECRET || '';

// ============================================
// 2. STATE GLOBAL ROUND-ROBIN (Untuk multi-key)
// ============================================
let ccIndex = 0;
let ilpIndex = 0;

function getNextCCKey(): string {
  // jika array kosong, return empty string (nanti akan gagal)
  if (CLOUDCONVERT_KEYS.length === 0) return '';
  const key = CLOUDCONVERT_KEYS[ccIndex % CLOUDCONVERT_KEYS.length];
  ccIndex++;
  return key;
}

function getNextILPKey(): string {
  if (ILOVEPDF_KEYS.length === 0) return '';
  const key = ILOVEPDF_KEYS[ilpIndex % ILOVEPDF_KEYS.length];
  ilpIndex++;
  return key;
}

// ============================================
// 3. FUNGSI PROSES UNTUK MASING-MASING PROVIDER
// ============================================

// --- PROSES: CloudConvert ---
async function processCloudConvert(file: File, action: string, quality: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextCCKey();
  if (!apiKey) throw new Error('CC_QUOTA_EXCEEDED'); // tidak ada key tersedia

  // Upload ke CloudConvert
  const uploadRes = await fetch('https://api.cloudconvert.com/v2/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name }),
  });
  const { data: uploadData } = await uploadRes.json();
  const { url, form } = uploadData;

  const uploadForm = new FormData();
  Object.entries(form).forEach(([key, value]) => uploadForm.append(key, value as string));
  uploadForm.append('file', file);
  await fetch(url, { method: 'POST', body: uploadForm });

  // Buat Job
  const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tasks: {
        main: {
          operation: action === 'compress' ? 'compress' : 'convert',
          input: 'upload',
          engine: 'ghostscript',
          profile: quality,
          output_format: outputFormat,
        }
      }
    }),
  });

  if (jobRes.status === 429) throw new Error('CC_QUOTA_EXCEEDED');
  if (!jobRes.ok) throw new Error('CC_ERROR');

  const jobData = await jobRes.json();
  const taskId = jobData.data.tasks.find((t: any) => t.name === 'main').id;

  // Polling Hasil
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const statusData = await statusRes.json();
    
    if (statusData.data.status === 'finished') {
      const resultUrl = statusData.data.result.files[0].url;
      const resultRes = await fetch(resultUrl);
      return await resultRes.blob();
    } else if (statusData.data.status === 'error') {
      throw new Error('CC_PROCESS_ERROR');
    }
    attempts++;
  }
  throw new Error('CC_TIMEOUT');
}

// --- PROSES: iLovePDF ---
async function processILovePDF(file: File, action: string, outputFormat: string): Promise<Blob> {
  const apiKey = getNextILPKey();
  if (!apiKey) throw new Error('ILP_QUOTA_EXCEEDED'); // Tidak ada key tersisa

  try {
    // 1. Mulai Task di iLovePDF
    const startRes = await fetch('https://api.ilovepdf.com/v1/start', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!startRes.ok) {
      // Baca pesan error asli dari iLovePDF agar kita tahu persis masalahnya
      const errorText = await startRes.text();
      console.error('iLovePDF Start Error:', startRes.status, errorText);

      // Jika status 429, 403, atau 400 -> anggap sebagai kuota habis / key invalid
      if (startRes.status === 429 || startRes.status === 403 || startRes.status === 400) {
        throw new Error('ILP_QUOTA_EXCEEDED');
      }
      throw new Error(`ILP_START_ERROR: ${startRes.status} - ${errorText}`);
    }

    const startData = await startRes.json();
    const { task, server } = startData;

    // 2. Upload file
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadRes = await fetch(server, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error('ILP_UPLOAD_ERROR');

    // 3. Proses file
    const processRes = await fetch(`https://api.ilovepdf.com/v1/process`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, tool: action === 'compress' ? 'compress' : 'convert', output_format: outputFormat }),
    });
    if (!processRes.ok) {
      const errText = await processRes.text();
      if (processRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
      throw new Error(`ILP_PROCESS_ERROR: ${processRes.status} - ${errText}`);
    }

    // 4. Download hasil
    const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!downloadRes.ok) throw new Error('ILP_DOWNLOAD_ERROR');

    return await downloadRes.blob();

  } catch (err: any) {
    // Jika error adalah QUOTA, lemparkan ke atas agar sistem beralih ke provider berikutnya
    if (err.message === 'ILP_QUOTA_EXCEEDED') {
      throw new Error('ILP_QUOTA_EXCEEDED');
    }
    // Untuk error teknis lainnya, kita tetap lempar agar sistem tidak mati, tapi coba provider berikutnya
    console.error('iLovePDF unexpected error:', err.message);
    throw new Error('ILP_QUOTA_EXCEEDED'); // Paksa fallback ke provider berikutnya
  }
}

// --- PROSES: Adobe (Acrobat) ---
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

    if (tokenRes.status === 429) throw new Error('ADOBE_QUOTA_EXCEEDED');
    if (!tokenRes.ok) throw new Error('ADOBE_TOKEN_ERROR');

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Upload file ke Adobe
    const fileBuffer = await file.arrayBuffer();
    const uploadRes = await fetch('https://dcp-uploads-na1.adobe.io/v1/media', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': ADOBE_CLIENT_ID,
        'Content-Type': file.type,
      },
      body: fileBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`ADOBE_UPLOAD_ERROR: ${errText}`);
    }

    const uploadData = await uploadRes.json();
    const assetId = uploadData.assetId;

    // 3. Buat Job
    const jobType = action === 'compress' ? 'compress' : 'convert';
    let jobPayload: any = {
      operation: 'pdf_services',
      input: { assetId: assetId }
    };

    if (jobType === 'compress') {
      jobPayload.output = { format: 'pdf' };
    } else {
      jobPayload.output = { format: outputFormat };
    }

    const jobRes = await fetch('https://dcp-na1.adobe.io/v1/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': ADOBE_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobPayload),
    });

    if (!jobRes.ok) {
      const errText = await jobRes.text();
      throw new Error(`ADOBE_JOB_ERROR: ${errText}`);
    }

    const jobData = await jobRes.json();
    const jobId = jobData.jobId;

    // 4. Polling Status
    let resultAssetId: string | null = null;
    let attempts = 0;
    while (!resultAssetId && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const statusRes = await fetch(`https://dcp-na1.adobe.io/v1/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'x-api-key': ADOBE_CLIENT_ID,
        },
      });
      const statusData = await statusRes.json();
      
      if (statusData.jobStatus === 'DONE') {
        resultAssetId = statusData.output.assetId;
      } else if (statusData.jobStatus === 'FAILED') {
        throw new Error('ADOBE_PROCESS_ERROR');
      }
      attempts++;
    }

    if (!resultAssetId) throw new Error('ADOBE_TIMEOUT');

    // 5. Download Hasil
    const downloadRes = await fetch(`https://dcp-na1.adobe.io/v1/assets/${resultAssetId}/binary`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': ADOBE_CLIENT_ID,
      },
    });

    if (!downloadRes.ok) throw new Error('ADOBE_DOWNLOAD_ERROR');

    return await downloadRes.blob();

  } catch (err: any) {
    if (err.message.includes('429')) {
      throw new Error('ADOBE_QUOTA_EXCEEDED');
    }
    throw new Error(err.message);
  }
}

// ============================================
// 4. MAIN HANDLER (MASTER API ROUTE)
// ============================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string; // 'compress' atau 'convert'
    const quality = formData.get('quality') as string || 'medium';
    const outputFormat = formData.get('outputFormat') as string || 'pdf';

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    let resultBlob: Blob | null = null;
    let lastError: any = null;

    // --- URUTAN PROVIDER: CloudConvert -> iLovePDF -> Adobe -> iLovePDF (Fallback) ---
    const providers: { name: string; func: () => Promise<Blob> }[] = [
      { name: 'CloudConvert', func: () => processCloudConvert(file, action, quality, outputFormat) },
      { name: 'ILovePDF', func: () => processILovePDF(file, action, outputFormat) },
      { name: 'Adobe', func: () => processAdobe(file, action, outputFormat) },
      { name: 'ILovePDF (Fallback)', func: () => processILovePDF(file, action, outputFormat) },
    ];

    for (const provider of providers) {
      try {
        const result = await provider.func();
        if (result && typeof result === 'object' && 'type' in result) {
          resultBlob = result as Blob;
          console.log(`✅ Berhasil memproses menggunakan ${provider.name}`);
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.log(`❌ ${provider.name} gagal: ${err.message}`);
        
        // Jika error adalah QUOTA atau Adobe belum dikonfigurasi, lanjut ke provider berikutnya
        if (err.message === 'CC_QUOTA_EXCEEDED' ||
            err.message === 'ILP_QUOTA_EXCEEDED' ||
            err.message === 'ADOBE_QUOTA_EXCEEDED' ||
            err.message === 'ADOBE_NOT_CONFIGURED') {
          continue;
        }
        // Untuk error teknis lain, kita tetap lanjut ke provider berikutnya
        continue;
      }
    }

    if (!resultBlob) {
      const finalError = lastError?.message || 'Semua provider gagal memproses file.';
      if (lastError?.message?.includes('QUOTA')) {
        return NextResponse.json({ 
          error: 'Maaf, semua kuota API harian/bulanan telah habis. Silakan coba lagi besok.' 
        }, { status: 429 });
      }
      return NextResponse.json({ error: finalError }, { status: 500 });
    }

    // --- Berhasil, kembalikan file ke Frontend ---
    const fileExt = outputFormat === 'pdf' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${fileExt}`;
    
    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': resultBlob.type,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('🔥 Master API Global Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}