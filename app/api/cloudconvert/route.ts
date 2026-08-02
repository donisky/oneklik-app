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

    // ============================================================
    // LANGKAH 1: Dapatkan URL Upload dari endpoint /v2/upload
    // ============================================================
    const uploadReq = await fetch('https://api.cloudconvert.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
      }),
    });

    if (!uploadReq.ok) {
      const errText = await uploadReq.text();
      throw new Error(`CC_UPLOAD_REQ_ERROR: ${uploadReq.status} - ${errText}`);
    }

    const uploadData = await uploadReq.json();
    const { id: uploadId, url: uploadUrl, form } = uploadData.data;

    // ============================================================
    // LANGKAH 2: Upload file ke URL yang diberikan
    // ============================================================
    const uploadForm = new FormData();
    Object.entries(form).forEach(([key, value]) => uploadForm.append(key, value as string));
    uploadForm.append('file', file);

    const uploadFileRes = await fetch(uploadUrl, {
      method: 'POST',
      body: uploadForm,
    });

    if (!uploadFileRes.ok) {
      const errText = await uploadFileRes.text();
      throw new Error(`CC_UPLOAD_FILE_ERROR: ${uploadFileRes.status} - ${errText}`);
    }

    // ============================================================
    // LANGKAH 3: Buat Job Compress / Convert
    // ============================================================
    let convertTask: any = {
      operation: 'convert',
      input: { id: uploadId }, // Gunakan ID upload yang sudah didapat
      output_format: action === 'compress' ? 'pdf' : outputFormat,
    };

    if (action === 'compress') {
      convertTask.engine = 'ghostscript';
      convertTask.profile = quality; // high, medium, low
    } else {
      if (['docx', 'xlsx', 'pptx'].includes(outputFormat)) {
        convertTask.engine = 'office';
      } else {
        convertTask.engine = 'ghostscript';
      }
    }

    const jobPayload = {
      tasks: {
        'convert-file': convertTask,
      },
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
    const convertTaskRes = jobData.data.tasks.find((t: any) => t.name === 'convert-file');

    if (!convertTaskRes) {
      throw new Error('Task convert tidak ditemukan di respons CloudConvert.');
    }

    // ============================================================
    // LANGKAH 4: Polling hasil job
    // ============================================================
    let resultUrl: string | null = null;
    let attempts = 0;
    while (!resultUrl && attempts < 40) {
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
      attempts++;
    }

    if (!resultUrl) throw new Error('CC_TIMEOUT');

    // ============================================================
    // LANGKAH 5: Download hasil
    // ============================================================
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