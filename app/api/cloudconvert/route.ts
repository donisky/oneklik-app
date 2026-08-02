import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_KEY_1 || '';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string; // 'compress' atau 'convert'
    const quality = formData.get('quality') as string || 'medium'; // untuk compress
    const outputFormat = formData.get('outputFormat') as string || 'pdf'; // untuk convert

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!CLOUDCONVERT_API_KEY) {
      return NextResponse.json({ error: 'API Key CloudConvert tidak ditemukan.' }, { status: 500 });
    }

    // Buat payload tugas
    let taskPayload: any = {
      operation: 'convert', // Selalu gunakan 'convert'
      input: 'upload',
      filename: file.name,
      output_format: action === 'compress' ? 'pdf' : outputFormat,
    };

    // Jika kompresi, tambahkan profile dan engine ghostscript
    if (action === 'compress') {
      taskPayload.engine = 'ghostscript';
      taskPayload.profile = quality; // 'high', 'medium', 'low'
    } else {
      // Untuk konversi, kita bisa tentukan engine yang sesuai (misal office untuk docx)
      if (['docx', 'xlsx', 'pptx'].includes(outputFormat)) {
        taskPayload.engine = 'office';
      } else {
        taskPayload.engine = 'ghostscript';
      }
    }

    // Buat job
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          main: taskPayload,
        },
      }),
    });

    if (jobRes.status === 429) {
      return NextResponse.json({ error: 'Kuota CloudConvert hari ini habis.' }, { status: 429 });
    }
    if (!jobRes.ok) {
      const errText = await jobRes.text();
      throw new Error(`CC_JOB_ERROR: ${jobRes.status} - ${errText}`);
    }

    const jobData = await jobRes.json();
    const task = jobData.data.tasks.find((t: any) => t.name === 'main');
    const taskId = task.id;
    const uploadUrl = task.result?.url || task.upload_url;

    if (!uploadUrl) {
      throw new Error('CloudConvert tidak memberikan URL upload.');
    }

    // Upload file
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    const uploadFileRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm });
    if (!uploadFileRes.ok) {
      const errText = await uploadFileRes.text();
      throw new Error(`CC_FILE_UPLOAD_ERROR: ${uploadFileRes.status} - ${errText}`);
    }

    // Polling hasil
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

    // Download hasil
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