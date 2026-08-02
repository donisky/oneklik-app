import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Ambil Key dari Environment Variable
const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_KEY_1 || '';

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

    if (!CLOUDCONVERT_API_KEY) {
      return NextResponse.json({ error: 'API Key CloudConvert tidak ditemukan di environment.' }, { status: 500 });
    }

    // 1. Buat JOB (Compress/Convert) langsung dengan input: 'upload'
    // CloudConvert akan memberikan URL upload secara dinamis di task ini!
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        tasks: {
          main: {
            operation: action === 'compress' ? 'compress' : 'convert',
            input: 'upload',
            filename: file.name,
            engine: 'ghostscript',
            profile: quality,
            output_format: outputFormat,
          }
        }
      }),
    });

    if (jobRes.status === 429) {
      return NextResponse.json({ error: 'Kuota CloudConvert hari ini telah habis.' }, { status: 429 });
    }
    if (!jobRes.ok) {
      const errText = await jobRes.text();
      throw new Error(`CC_JOB_ERROR: ${jobRes.status} - ${errText}`);
    }

    const jobData = await jobRes.json();
    // Ambil task 'main' yang baru saja dibuat
    const task = jobData.data.tasks.find((t: any) => t.name === 'main');
    const taskId = task.id;
    const uploadUrl = task.result?.url || task.upload_url; // URL upload yang diberikan CloudConvert

    if (!uploadUrl) {
      throw new Error('CloudConvert tidak memberikan URL upload.');
    }

    // 2. Upload file asli ke URL yang diberikan CloudConvert
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadFileRes = await fetch(uploadUrl, { 
      method: 'POST', 
      body: uploadForm 
    });
    
    if (!uploadFileRes.ok) {
      const errText = await uploadFileRes.text();
      throw new Error(`CC_FILE_UPLOAD_ERROR: ${uploadFileRes.status} - ${errText}`);
    }

    // 3. Polling Hasil (Tunggu sampai selesai)
    let resultUrl: string | null = null;
    let attempts = 0;
    while (!resultUrl && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.data.status === 'finished') {
        resultUrl = statusData.data.result.files[0].url;
        break;
      } else if (statusData.data.status === 'error') {
        throw new Error('CC_PROCESS_ERROR');
      }
      attempts++;
    }

    if (!resultUrl) throw new Error('CC_TIMEOUT');

    // 4. Download hasil & kembalikan ke Frontend
    const resultRes = await fetch(resultUrl);
    if (!resultRes.ok) throw new Error('CC_DOWNLOAD_ERROR');

    const resultBlob = await resultRes.blob();
    const fileExt = outputFormat === 'pdf' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${fileExt}`;

    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': resultBlob.type,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('🔥 CloudConvert API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}