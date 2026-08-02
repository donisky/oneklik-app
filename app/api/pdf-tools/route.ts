import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CLOUDCONVERT_API_KEY = process.env.CLOUDCONVERT_KEY_1 || '';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;
    const quality = formData.get('quality') as string || 'medium';

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    if (!CLOUDCONVERT_API_KEY) return NextResponse.json({ error: 'API Key CloudConvert tidak ditemukan.' }, { status: 500 });

    // ================================================================
    // PERBAIKAN PENTING: Gunakan operation: 'compress' (bukan convert)
    // ================================================================
    const jobPayload: any = {
      tasks: {
        'upload-file': {
          operation: 'import/upload',
          filename: file.name
        },
        'compress-file': {
          operation: 'compress', // Operasi kompresi resmi CloudConvert
          input: ['upload-file'],
          profile: quality // high, medium, low
        }
      }
    };

    // === CETAK PAYLOAD KE VERCEL LOGS (WAJIB DICEK!) ===
    console.log('📤 PAYLOAD YANG DIKIRIM KE CLOUDCONVERT:', JSON.stringify(jobPayload, null, 2));

    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload),
    });

    if (jobRes.status === 429) return NextResponse.json({ error: 'Kuota CloudConvert hari ini habis.' }, { status: 429 });
    if (!jobRes.ok) {
      const errText = await jobRes.text();
      console.error('CloudConvert Job Error:', jobRes.status, errText);
      throw new Error(`CC_JOB_ERROR: ${jobRes.status} - ${errText}`);
    }

    const jobData = await jobRes.json();
    const uploadTask = jobData.data.tasks.find((t: any) => t.name === 'upload-file');
    const compressTask = jobData.data.tasks.find((t: any) => t.name === 'compress-file');
    if (!uploadTask || !compressTask) throw new Error('Task tidak ditemukan.');

    // S3 Upload
    const uploadFormPayload = uploadTask.result?.form;
    if (!uploadFormPayload || !uploadFormPayload.url) throw new Error('URL upload tidak ditemukan.');

    const uploadUrl = uploadFormPayload.url;
    const uploadParams = uploadFormPayload.parameters || {};

    const uploadForm = new FormData();
    Object.entries(uploadParams).forEach(([key, value]) => uploadForm.append(key, value as string));
    uploadForm.append('file', file);

    const uploadRes = await fetch(uploadUrl, { method: 'POST', body: uploadForm });
    if (!uploadRes.ok) throw new Error(`CC_UPLOAD_ERROR: ${uploadRes.status} - ${await uploadRes.text()}`);

    // Polling Hasil Compress
    let attempts = 0;
    let resultUrl: string | null = null;
    while (!resultUrl && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${compressTask.id}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.data.status === 'finished') {
        resultUrl = statusData.data.result.files[0].url;
        break;
      } else if (statusData.data.status === 'error') {
        const errorMessage = statusData.data.message || statusData.data.error || 'Unknown CloudConvert error';
        console.error('🔥 CloudConvert Compress Error:', errorMessage);
        throw new Error(`CC_PROCESS_ERROR: ${errorMessage}`);
      }
      attempts++;
    }
    if (!resultUrl) throw new Error('CC_TIMEOUT');

    const resultRes = await fetch(resultUrl);
    if (!resultRes.ok) throw new Error('CC_DOWNLOAD_ERROR');
    const resultBlob = await resultRes.blob();
    const fileName = `${file.name.replace(/\.[^.]+$/, '')}_compressed.pdf`;

    return new NextResponse(resultBlob, {
      headers: { 'Content-Type': resultBlob.type, 'Content-Disposition': `attachment; filename="${fileName}"` },
    });

  } catch (error: any) {
    console.error('🔥 CloudConvert Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}