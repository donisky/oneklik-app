import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse-fork';
import mammoth from 'mammoth';

export const runtime = 'nodejs';

const parseCVText = (text: string) => {
  const data: any = {};
  
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length > 0) {
    const nameParts = lines[0].trim().split(' ');
    if (nameParts.length >= 2) {
      data.personal = {
        firstName: nameParts.slice(0, -1).join(' '),
        lastName: nameParts[nameParts.length - 1],
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        photo: ''
      };
    } else {
      data.personal = { firstName: lines[0].trim(), lastName: '', title: '', email: '', phone: '', location: '', linkedin: '', photo: '' };
    }
  } else {
    data.personal = { firstName: '', lastName: '', title: '', email: '', phone: '', location: '', linkedin: '', photo: '' };
  }

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) data.personal!.email = emailMatch[0];

  const phoneMatch = text.match(/(\+62|62|0)[0-9]{8,13}/);
  if (phoneMatch) data.personal!.phone = phoneMatch[0];

  const expSection = text.split(/Pengalaman Kerja|Work Experience|Experience/i)[1]?.split(/Pendidikan|Education|Keahlian|Skills/i)[0] || '';
  if (expSection) {
    const expItems = expSection.split(/\n(?=\w)/).filter(s => s.trim().length > 5);
    data.experience = expItems.slice(0, 3).map((item: string) => {
      const lines = item.split('\n').filter(l => l.trim());
      return {
        company: lines[1] || '',
        role: lines[0] || '',
        startDate: '',
        endDate: '',
        description: lines.slice(2).join(' ')
      };
    });
  }

  const eduSection = text.split(/Pendidikan|Education/i)[1]?.split(/Pengalaman Kerja|Work Experience|Keahlian|Skills/i)[0] || '';
  if (eduSection) {
    const eduItems = eduSection.split(/\n(?=\w)/).filter(s => s.trim().length > 5);
    data.education = eduItems.slice(0, 2).map((item: string) => {
      const lines = item.split('\n').filter(l => l.trim());
      return {
        school: lines[1] || lines[0] || '',
        degree: lines[0] || '',
        field: '',
        startDate: '',
        endDate: ''
      };
    });
  }

  return data;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });
    }

    let text = '';
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: 'Format tidak didukung' }, { status: 400 });
    }

    // PARSING DATA CV
    const parsedData = parseCVText(text);

    // KEMBALIKAN TEKS MENTAH DAN DATA YANG SUDAH DIPARSE
    return NextResponse.json({ 
      rawText: text, 
      parsedData: parsedData 
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json({ error: 'Gagal memproses file' }, { status: 500 });
  }
}