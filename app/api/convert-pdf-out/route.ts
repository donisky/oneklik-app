import { NextRequest, NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
const XLSX = require('xlsx');
import { PDFDocument } from 'pdf-lib';
const pdfParse = require('pdf-parse-fork');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const targetType = formData.get('type') as string;

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });

    // 1. Baca & Ekstrak Teks dari PDF
    const buffer = Buffer.from(await file.arrayBuffer());
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch (err) {
      console.error('❌ Gagal parsing PDF:', err);
      return NextResponse.json({ error: 'File PDF mungkin rusak' }, { status: 400 });
    }
    const extractedText = pdfData.text;

    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    // 2. Proses sesuai target
        if (targetType === 'word') {
      // 1. Bersihkan teks: pisahkan paragraf berdasarkan baris kosong ganda
      const rawParagraphs = extractedText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      
      // 2. Bangun struktur dokumen Word
      let children: any[] = [
        new Paragraph({
          children: [new TextRun({ text: "Konversi dari PDF oleh Oneklik.id", size: 24, bold: true })],
          spacing: { after: 300 } // Jarak setelah judul
        }),
        new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 200 } })
      ];
      
      // 3. Tambahkan paragraf hasil ekstraksi dengan format yang rapi
      rawParagraphs.forEach((para) => {
        // Ganti baris baru tunggal di dalam paragraf dengan spasi agar jadi satu kalimat utuh
        const cleanPara = para.replace(/\n/g, ' ').trim();
        if (cleanPara) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: cleanPara, size: 12 })],
              spacing: { after: 200, line: 360 } // Line spacing 1.5 biar tidak sesak
            })
          );
        }
      });

      // 4. Buat dokumen Word dengan struktur yang sudah dibentuk
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });

      fileBuffer = await Packer.toBuffer(doc);
      fileName = 'oneklik_convert.docx';
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } 
    else if (targetType === 'excel') {
      const wb = XLSX.utils.book_new();
      const lines = extractedText.split('\n').filter(p => p.trim());
      const data = lines.map(line => [line]);
      const ws = XLSX.utils.aoa_to_sheet([['Konversi PDF oleh Oneklik.id'], ['']].concat(data));
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      fileName = 'oneklik_convert.xlsx';
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } 
    else if (targetType === 'pptx') {
      // PPT masih dinonaktifkan
      return NextResponse.json({ 
        error: 'Fitur PDF ke PPT sedang dalam perbaikan.' 
      }, { status: 501 });
    } 
    else if (targetType === 'pdfa') {
      const pdfDoc = await PDFDocument.load(buffer);
      pdfDoc.setTitle('Konversi PDF/A');
      pdfDoc.setCreator('Oneklik.id');
      const bytes = await pdfDoc.save();
      fileBuffer = Buffer.from(bytes);
      fileName = 'oneklik_convert.pdfa.pdf';
      mimeType = 'application/pdf';
    } 
    else {
      return NextResponse.json({ error: 'Tipe konversi tidak dikenali' }, { status: 400 });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('🔥 ERROR UTAMA DI API:', error);
    return NextResponse.json({ 
      error: error.message || 'Gagal mengonversi dokumen' 
    }, { status: 500 });
  }
}