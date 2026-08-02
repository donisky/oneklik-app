import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

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
      return NextResponse.json({ error: 'API Key CloudConvert tidak ditemukan.' }, { status: 500 });
    }

    // === 1. Buat Task Upload & Convert ===
    let convertTask: any = {
      operation: 'convert',
      input: ['upload-file'],
      output_format: action === 'compress' ? 'pdf' : outputFormat,
    };

    if (action === 'compress') {
      convertTask.engine = 'ghostscript';
      convertTask.profile = quality;
    } else {
      if (['docx', 'xlsx', 'pptx'].includes(outputFormat)) {
        convertTask.engine = 'office';
      } else {
        convertTask.engine = 'ghostscript';
      }
    }

    const jobPayload = {
      tasks: {
        'upload-file': {
          operation: 'import/upload',
          filename: file.name,
        },
        'convert-file': convertTask,
      }
    };

    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobPayload),
    });

    if (jobRes.status === 429) {
      return NextResponse.json({ error: 'Kuota CloudConvert hari ini habis.' }, { status: 429 });
    }
    if (!jobRes.ok) {
      const errText = await jobRes.text();
      throw new Error(`CC_JOB_ERROR: ${jobRes.status} - ${errText}`);
    }

    const jobData = await jobRes.json();
    const uploadTask = jobData.data.tasks.find((t: any) => t.name === 'upload-file');
    const convertTaskRes = jobData.data.tasks.find((t: any) => t.name === 'convert-file');

    if (!uploadTask || !convertTaskRes) {
      throw new Error('Task tidak ditemukan di respons CloudConvert.');
    }

    // === 2. Polling Task Upload untuk Mendapatkan URL Upload ===
    let uploadUrl: string | null = null;
    let uploadAttempts = 0;
    while (!uploadUrl && uploadAttempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${uploadTask.id}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      // Cek apakah task upload sudah selesai dan memiliki result.url
      if (statusData.data.status === 'finished' || statusData.data.status === 'processing') {
        if (statusData.data.result && statusData.data.result.url) {
          uploadUrl = statusData.data.result.url;
          break;
        }
      } else if (statusData.data.status === 'error') {
        throw new Error('CC_UPLOAD_TASK_ERROR');
      }
      uploadAttempts++;
    }

    if (!uploadUrl) {
      // Jika gagal, log detail respons untuk debugging
      console.error('Gagal mendapatkan upload URL. Respons task upload:', JSON.stringify(uploadTask));
      throw new Error('CloudConvert tidak memberikan URL upload setelah timeout.');
    }

    // === 3. Upload File ke URL yang Didapat ===
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadFileRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm });
    if (!uploadFileRes.ok) {
      const errText = await uploadFileRes.text();
      throw new Error(`CC_FILE_UPLOAD_ERROR: ${uploadFileRes.status} - ${errText}`);
    }

    // === 4. Polling Hasil Task Convert ===
    let resultUrl: string | null = null;
    let convertAttempts = 0;
    while (!resultUrl && convertAttempts < 40) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${convertTaskRes.id}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.data.status === 'finished') {
        resultUrl = statusData.data.result.files[0].url;
        break;
      } else if (statusData.data.status === 'error') {
        throw new Error('CC_PROCESS_ERROR');
      }
      convertAttempts++;
    }

    if (!resultUrl) throw new Error('CC_TIMEOUT');

    // === 5. Download Hasil ===
    const resultRes = await fetch(resultUrl);
    if (!resultRes.ok) throw new Error('CC_DOWNLOAD_ERROR');

    const resultBlob = await resultRes.blob();
    const ext = action === 'compress' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${ext}`;

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