import { NextRequest, NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';

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

    // Inisialisasi SDK
    const cloudConvert = new CloudConvert(CLOUDCONVERT_API_KEY);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Buat Job
    let jobPayload: any = { tasks: {} };

    if (action === 'compress') {
      jobPayload.tasks = {
        'import-file': { operation: 'import/upload', filename: file.name },
        'compress-file': { operation: 'convert', input: 'import-file', engine: 'ghostscript', profile: quality, output_format: 'pdf' },
        'export-file': { operation: 'export/url', input: 'compress-file', inline: false }
      };
    } else {
      let engine = 'ghostscript';
      if (['docx', 'xlsx', 'pptx'].includes(outputFormat)) engine = 'office';
      jobPayload.tasks = {
        'import-file': { operation: 'import/upload', filename: file.name },
        'convert-file': { operation: 'convert', input: 'import-file', engine, output_format: outputFormat },
        'export-file': { operation: 'export/url', input: 'convert-file', inline: false }
      };
    }

    // Eksekusi pembuatan job
    let job = await cloudConvert.jobs.create(jobPayload);

    // Cari Task Import
    const importTask = job.tasks.find((t: any) => t.operation === 'import/upload' && t.name === 'import-file');
    if (!importTask) throw new Error('Tidak dapat menemukan task import/upload.');

    // Upload file
    await cloudConvert.tasks.upload(importTask, fileBuffer, file.name);

    // Tunggu Job Selesai
    job = await cloudConvert.jobs.wait(job.id);

    // === CEK ERROR TASK LAINNYA ===
    // Jika ada task yang error, kita akan mengetahuinya di sini
    const errorTask = job.tasks.find((t: any) => t.status === 'error');
    if (errorTask) {
      console.error('🔥 CloudConvert Error Task:', errorTask);
      throw new Error(`Task ${errorTask.name} gagal: ${errorTask.message || errorTask.code}`);
    }

    // Cari Export Task
    const exportTask = job.tasks.find((t: any) => t.operation === 'export/url');
    
    if (!exportTask) throw new Error('Tidak dapat menemukan task export/url.');
    if (exportTask.status !== 'finished') {
      throw new Error(`Export task tidak selesai. Status: ${exportTask.status}`);
    }
    
    if (!exportTask.result || !exportTask.result.files || exportTask.result.files.length === 0) {
      throw new Error('Export task gagal atau tidak mengembalikan file.');
    }

    const resultUrl = exportTask.result.files[0].url;
    if (!resultUrl) throw new Error('URL hasil export tidak ditemukan.');

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
    console.error('🔥 CloudConvert SDK Error:', error.message);
    // Jika error 429 (Quota habis)
    if (error.message?.includes('429')) {
      return NextResponse.json({ error: 'Kuota CloudConvert hari ini habis.' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}