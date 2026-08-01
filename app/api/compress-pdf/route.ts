// app/api/compress-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

const CLOUDCONVERT_API_KEY = 'MASUKKAN_API_KEY_ANDA_DISINI'; // Dapatkan di dashboard cloudconvert.com

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const quality = formData.get('quality') as string || 'medium'; // 'low', 'medium', 'high'

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // 1. Dapatkan URL Upload dari CloudConvert
    const uploadRes = await fetch('https://api.cloudconvert.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
      }),
    });

    const uploadData = await uploadRes.json();
    const { url, form } = uploadData.data;

    // 2. Upload file asli ke CloudConvert
    const uploadForm = new FormData();
    Object.entries(form).forEach(([key, value]) => uploadForm.append(key, value as string));
    uploadForm.append('file', file);

    await fetch(url, {
      method: 'POST',
      body: uploadForm,
    });

    // 3. Konfigurasi Kompresi PDF (Persis iLovePDF)
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks: {
          'compress': {
            operation: 'compress',
            input: 'upload',
            engine: 'ghostscript', // Ghostscript Engine (Sama dengan iLovePDF)
            profile: quality, // 'low' = 25 dpi, 'medium' = 72 dpi, 'high' = 150 dpi
            output_format: 'pdf',
          },
        },
      }),
    });

    const jobData = await jobRes.json();
    const taskId = jobData.data.tasks.find((t: any) => t.name === 'compress').id;

    // 4. Tunggu & Download Hasil
    let resultUrl: string | null = null;
    let attempts = 0;
    while (!resultUrl && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Polling tiap 1 detik
      
      const statusRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${CLOUDCONVERT_API_KEY}` },
      });
      const statusData = await statusRes.json();
      
      if (statusData.data.status === 'finished') {
        resultUrl = statusData.data.result.files[0].url;
      } else if (statusData.data.status === 'error') {
        throw new Error('Gagal mengompres');
      }
      attempts++;
    }

    if (!resultUrl) throw new Error('Timeout kompresi');

    // 5. Ambil file hasil dari CloudConvert
    const resultRes = await fetch(resultUrl);
    const resultBlob = await resultRes.blob();

    // 6. Kembalikan ke Browser
    return new NextResponse(resultBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${file.name.replace('.pdf', '')}_compressed.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}