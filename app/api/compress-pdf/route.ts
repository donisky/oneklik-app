import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const level = formData.get('level') as string || 'recommended'; // default recommended

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(bytes);

    // Simpan ulang dengan optimasi berdasarkan level
    let options: any = { addDefaultPage: false };
    
    if (level === 'extreme') {
      // Kompresi Ekstrem: Aktifkan object stream, buang semua metadata
      options.useObjectStreams = true;
      // pdf-lib tidak bisa re-encode gambar. Kita hanya bisa buang metadata.
      // Untuk simulasi, kita akan menghapus metadata jika ada.
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setCreator('');
      pdfDoc.setProducer('');
    } else if (level === 'recommended') {
      // Kompresi Rekomendasi: Aktifkan object stream, pertahankan beberapa metadata dasar
      options.useObjectStreams = true;
    } else { // less
      // Kompresi Rendah: Matikan object stream, pertahankan kualitas asli
      options.useObjectStreams = false;
    }

    const compressedBytes = await pdfDoc.save(options);

    return new NextResponse(compressedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed_${file.name}"`,
      },
    });

  } catch (error) {
    console.error('Compression error:', error);
    return NextResponse.json({ error: 'Gagal mengkompres PDF' }, { status: 500 });
  }
}