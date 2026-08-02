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

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    if (!CLOUDCONVERT_API_KEY) return NextResponse.json({ error: 'API Key CloudConvert tidak ditemukan.' }, { status: 500 });

    // ================================================================
    // STRUKTUR PAYLOAD PALING STANDAR DARI CLOUDCONVERT
    // ================================================================
    let convertTask: any = {
      operation: 'convert',         // Hanya gunakan 'convert'
      input: 'upload-file',         // Wajib string tunggal, BUKAN array
      output_format: action === 'compress' ? 'pdf' : outputFormat,
    };

    // Tentukan Engine
    if (action === 'compress') {
      convertTask.engine = 'ghostscript';
      convertTask.profile = quality; // 'high', 'medium', 'low'
    } else if (action === 'convert') {
      if (['jpg', 'jpeg', 'png'].includes(outputFormat)) {
        convertTask.engine = 'ghostscript';
      } else if (['docx', 'xlsx', 'pptx'].includes(outputFormat)) {
        convertTask.engine = 'office';
      } else {
        convertTask.engine = 'ghostscript';
      }
    }

    const jobPayload = {
      tasks: {
        'upload-file': { operation: 'import/upload', filename: file.name },
        'convert-file': convertTask
      }
    };

    // Kirim ke CloudConvert
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload),
    });

    if (jobRes.status === 429) return NextResponse.json({ error: 'Kuota CloudConvert hari ini habis.' }, { status: 429 });
    if (!jobRes.ok) {
      const errText = await jobRes.text();
      throw new Error(`CC_JOB_ERROR: ${jobRes.status} - ${errText}`);
    }

    const jobData = await jobRes.json();
    const uploadTask = jobData.data.tasks.find((t: any) => t.name === 'upload-file');
    const convertTaskRes = jobData.data.tasks.find((t: any) => t.name === 'convert-file');
    if (!uploadTask || !convertTaskRes) throw new Error('Task tidak ditemukan.');

    // Upload S3 dengan parameter form
    const uploadFormPayload = uploadTask.result?.form;
    if (!uploadFormPayload || !uploadFormPayload.url) throw new Error('URL upload tidak ditemukan.');

    const uploadUrl = uploadFormPayload.url;
    const uploadParams = uploadFormPayload.parameters || {};

    const uploadForm = new FormData();
    Object.entries(uploadParams).forEach(([key, value]) => uploadForm.append(key, value as string));
    uploadForm.append('file', file);

    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error(`CC_UPLOAD_ERROR: ${uploadRes.status} - ${await uploadRes.text()}`);

    // Polling Hasil Compress/Convert
    let attempts = 0;
    let resultUrl: string | null = null;
    while (!resultUrl && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${convertTaskRes.id}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.data.status === 'finished') {
        resultUrl = statusData.data.result.files[0].url;
        break;
      } else if (statusData.data.status === 'error') {
        const errorMessage = statusData.data.message || statusData.data.error || 'Unknown CloudConvert error';
        throw new Error(`CC_PROCESS_ERROR: ${errorMessage}`);
      }
      attempts++;
    }
    if (!resultUrl) throw new Error('CC_TIMEOUT');

    const resultRes = await fetch(resultUrl);
    if (!resultRes.ok) throw new Error('CC_DOWNLOAD_ERROR');
    const resultBlob = await resultRes.blob();
    const ext = action === 'compress' ? 'pdf' : outputFormat;
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${action}.${ext}`;

    return new NextResponse(resultBlob, {
      headers: { 'Content-Type': resultBlob.type, 'Content-Disposition': `attachment; filename="${fileName}"` },
    });

  } catch (error: any) {
    console.error('🔥 CloudConvert Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}