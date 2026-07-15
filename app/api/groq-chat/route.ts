import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, cvContext } = await req.json();
    if (!message) return NextResponse.json({ error: 'Pesan kosong' }, { status: 400 });

    const systemPrompt = `Anda adalah Asisten AI Oneklik.id.
    Anda membantu pengguna mengelola alat digital mereka (Bio Link, PDF, CV, Templates).
    
    ${cvContext ? `Berikut adalah data CV pengguna saat ini: ${JSON.stringify(cvContext)}. Gunakan data ini jika relevan.` : 'Pengguna belum memiliki data CV saat ini. Bantu mereka dengan pertanyaan umum seputar aplikasi atau panduan penggunaan.'}
    
    Balaslah dengan ramah, informatif, dan dalam bahasa Indonesia.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      // GANTI MODEL DI SINI
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    return NextResponse.json({ 
      reply: chatCompletion.choices[0]?.message?.content || 'Maaf, saya tidak bisa menjawab pertanyaan itu.' 
    });

  } catch (error: any) {
    console.error('Groq Error:', error);
    return NextResponse.json({ error: 'Gagal berkomunikasi dengan AI' }, { status: 500 });
  }
}