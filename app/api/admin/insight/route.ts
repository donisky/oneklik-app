import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST() {
  try {
    // Di sini Anda bisa query database untuk data trafik real. Untuk contoh, kita pakai data dummy.
    const dummyAnalyticsData = `
      Trafik Minggu Ini:
      - Bio Link: 450 views
      - Short Link: 320 views
      - Blog (Panduan CV): 120 views (Rendah)
      - Blog (File to QR): 80 views (Sangat Rendah)
    `;

    const prompt = `Anda adalah konsultan SEO dan content strategist untuk platform Oneklik.id. 
    Berikut adalah data performa konten terbaru:
    ${dummyAnalyticsData}
    
    Berikan 3 saran spesifik, actionable, dan dalam bahasa Indonesia yang profesional untuk meningkatkan performa konten blog dan alat di platform ini. Fokus pada optimasi SEO, penambahan konten, dan promosi internal.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });

    const suggestion = chatCompletion.choices[0]?.message?.content || 'Tidak ada saran yang dihasilkan.';

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Groq Insight Error:', error);
    return NextResponse.json({ error: 'Gagal generate insight' }, { status: 500 });
  }
}