import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4

    // Teks utama - tanpa parameter warna (default hitam)
    page.drawText(`Dokumen "${file.name}" berhasil diproses oleh Oneklik.id`, {
      x: 50,
      y: 750,
      size: 20,
    });

    // Tipe konversi - tanpa parameter warna
    page.drawText(`Tipe konversi: ${type}`, {
      x: 50,
      y: 700,
      size: 16,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="converted_${file.name.replace(/\.[^.]+$/, '')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: 'Gagal mengonversi dokumen' }, { status: 500 });
  }
}