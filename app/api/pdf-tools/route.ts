import { NextRequest, NextResponse } from 'next/server';

// ============================================
// 1. KONFIGURASI API KEYS (Isi dengan key Anda)
// ============================================

// CloudConvert (bisa multiple keys)
const CLOUDCONVERT_KEYS = [
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMjIzZjEyMjhiODY2MDk1Y2Y2OGNmNGQ3M2IzYTg4Nzk1Y2MxNTY0NDQ1NzRhNDA4Y2M3NWNhNDJhN2NiZGQwNTEzMTE1YTY3YTVjMTI0OWUiLCJpYXQiOjE3ODU1OTUyMDYuNzU2MzU1LCJuYmYiOjE3ODU1OTUyMDYuNzU2MzU2LCJleHAiOjQ5NDEyNjg4MDYuNzUxMDE2LCJzdWIiOiI3NjQ4NzMyNiIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSJdfQ.ormp7bpmzs7MoOLSmKg3tBPlSqhVnUCPRU-S5KUX7w_hm2nI2sgtfAMRVEnyGUJVfv1qxyxvbYtZukBlH1L3Sab6rEivtkbMLhHGc1GrxiQb7CM19rFEXub7jYsttuhR3_4YYgOnCcIY8I4JvqDjfqzAkLt9ZPMIw9FLpBiG7cYeEZRoqfh2Vo4XepVDUOZTWlj8NTttmRp73xA-NBUFNcw14sPHQNx5WVUvXip6rhhzf3k0AwkuK5KiaYXTPpoBAxn1e_QpvyK6JXCogXKgeZfCFaoS9Ci4SNOxdX8OyDmo10_cCL8-tGWU7_AdLlVCfuJ_vMybOXh1_jqKa5CUSW4gv4mNR8uYtujZDR5V5rm5WLQknMQ7mrAl7fxcge4egLfD1Ok9x60z-r14Rd05Eh1jm_t2wsB7-nyjKJE2aLvyHC86KKtozjJf_hRKbjhY9ieWnrkbhPe6u_I18Gg5FCb5_IDiKpWJlX9VlTZ6cKsQN7E2wi0397nHn_FXE7N1kTSjcNpdvTLmb7K93x1aM3J8yjlaz-i-JwZFeq4zu0DIB5cPB7kUKojABzwoMnfzW4e7QzP9TQEJpeNIltJ6LAAnHdGzznFGCA-UDQoyReHWqq0dyUU6SPyUJu2DN8TECdBoZ4COTABG4bwQOA2Ju8km1HZYcJiExywLJlsf9qE',
  'KEY_CC_2',
  'KEY_CC_3',
];

// iLovePDF (bisa multiple keys)
const ILOVEPDF_KEYS = [
  'project_public_18d4e9be9d3705b49a9369c5c81b3b18_klXdP7978a4856f962c804e7a8041549c1dce',
  'project_public_7addb431ce48e2a31bf1af7e644e8981_qDUcsdcfce0dadcbdc3c9c66bb781e374f094',
  'KEY_ILP_3',
];

// Adobe PDF Services (Client ID & Secret - Placeholder)
const ADOBE_CLIENT_ID = '1efd7e8d2aed4362924030a335040914';
const ADOBE_CLIENT_SECRET = 'p8e-FSp1WV_SKtGrrmz2F5C179PvPeEO3t3V';

// ============================================
// 2. STATE GLOBAL ROUND-ROBIN (Untuk multi-key)
// ============================================
let ccIndex = 0;
let ilpIndex = 0;

function getNextCCKey() {
  const key = CLOUDCONVERT_KEYS[ccIndex % CLOUDCONVERT_KEYS.length];
  ccIndex++;
  return key;
}

function getNextILPKey() {
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

  // 1. Mulai Task di iLovePDF
  const startRes = await fetch('https://api.ilovepdf.com/v1/start', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (startRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
  if (!startRes.ok) throw new Error('ILP_START_ERROR');
  
  const startData = await startRes.json();
  const { task, server } = startData;

  // 2. Upload file ke URL yang diberikan
  const uploadForm = new FormData();
  uploadForm.append('file', file);
  const uploadRes = await fetch(server, {
    method: 'POST',
    body: uploadForm,
  });
  if (!uploadRes.ok) throw new Error('ILP_UPLOAD_ERROR');

  // 3. Proses file (compress / convert)
  const processRes = await fetch(`https://api.ilovepdf.com/v1/process`, {
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
  if (processRes.status === 429) throw new Error('ILP_QUOTA_EXCEEDED');
  if (!processRes.ok) throw new Error('ILP_PROCESS_ERROR');

  // 4. Download hasil
  const downloadRes = await fetch(`https://api.ilovepdf.com/v1/download/${task}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!downloadRes.ok) throw new Error('ILP_DOWNLOAD_ERROR');

  return await downloadRes.blob();
}

// --- PROSES: Adobe (Acrobat) - Support Compress & Convert ---
async function processAdobe(file: File, action: string, outputFormat: string): Promise<Blob> {
  try {
    // 1. Dapatkan Access Token (OAuth2 Client Credentials)
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

    // 2. Upload file ke Adobe Media Storage
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
    const assetId = uploadData.assetId; // ID asset yang akan diproses

    // 3. Buat Job Kompresi / Konversi
    const jobType = action === 'compress' ? 'compress' : 'convert';
    let jobPayload: any = {
      operation: 'pdf_services',
      input: { assetId: assetId }
    };

    if (jobType === 'compress') {
      jobPayload.output = { format: 'pdf' };
      // Opsi kompresi: high, medium, low (Adobe mendukung)
    } else {
      // Convert ke format lain (docx, jpg, etc)
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

    // 4. Polling Status Job
    let resultAssetId: string | null = null;
    let attempts = 0;
    while (!resultAssetId && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Adobe butuh waktu sedikit lebih lama

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
    // Lempar error agar sistem bisa beralih ke iLovePDF (Fallback)
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

    // --- URUTAN PROVIDER SESUAI PERMINTAAN: ---
    // 1. CloudConvert  -> 2. iLovePDF  -> 3. Adobe  -> 4. iLovePDF (lagi)
    // PERBAIKAN: Tambahkan tipe eksplisit Promise<Blob> agar TypeScript tidak menganggap ada void
    const providers: { name: string; func: () => Promise<Blob> }[] = [
      { name: 'CloudConvert', func: () => processCloudConvert(file, action, quality, outputFormat) },
      { name: 'ILovePDF', func: () => processILovePDF(file, action, outputFormat) },
      { name: 'Adobe', func: () => processAdobe(file, action, outputFormat) },
      { name: 'ILovePDF (Fallback)', func: () => processILovePDF(file, action, outputFormat) },
    ];

    // Loop mencoba setiap provider
    for (const provider of providers) {
      try {
        const result = await provider.func();
        // VALIDASI TIPE: Pastikan hasilnya benar-benar Blob
        if (result && typeof result === 'object' && 'type' in result) {
          resultBlob = result as Blob;
          console.log(`✅ Berhasil memproses menggunakan ${provider.name}`);
          break; // Berhasil! Keluar dari loop
        }
      } catch (err: any) {
        lastError = err;
        console.log(`❌ ${provider.name} gagal: ${err.message}`);
        
        // Jika error adalah QUOTA atau Adobe belum dikonfigurasi, lanjut ke provider berikutnya
        if (err.message === 'CC_QUOTA_EXCEEDED' ||
            err.message === 'ILP_QUOTA_EXCEEDED' ||
            err.message === 'ADOBE_NOT_CONFIGURED') {
          continue;
        }
        // Jika error teknis lainnya (bukan quota), tetap lanjut coba provider lain
        continue;
      }
    }

    // Jika semua provider gagal
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