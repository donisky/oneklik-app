import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, context } = await req.json();
    if (!text) return NextResponse.json({ error: 'Teks kosong' }, { status: 400 });

    // Hapus foto Base64
    const { photo, ...safePersonal } = context.personal || {};
    const safeContext = { ...context, personal: safePersonal };

    // --- PERKUAT INSTRUKSI AGAR TIDAK MEMBERI PILIHAN ---
    const systemPrompt = `Anda adalah mesin rewrite CV profesional. 
    Anda hanya menulis ulang teks. 
    Anda TIDAK boleh memberikan pilihan alternatif. 
    Anda TIDAK boleh menambahkan kalimat pengantar seperti "Berikut adalah versi..." atau "Atau, jika ingin...". 
    Anda HANYA mengembalikan satu paragraf hasil rewrite. 
    Jangan gunakan markdown atau format apapun. Hanya teks biasa. 
    Gunakan bahasa Indonesia yang baku, profesional, dan berorientasi pencapaian.
    
    Konteks pengguna: ${JSON.stringify(safeContext)}`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Teks yang harus ditulis ulang: "${text}"` }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    });

    // Ambil hasil, jika masih ada kalimat pengantar, kita bersihkan secara manual
    let rewritten = chatCompletion.choices[0]?.message?.content || text;
    
    // Filter manual jika AI masih bandel (hapus kalimat "Berikut adalah..." dan "Atau...")
    rewritten = rewritten.replace(/^Berikut adalah.*?:/gi, '').trim();
    rewritten = rewritten.replace(/^Atau,.*?:/gi, '').trim();
    
    return NextResponse.json({ rewritten });

  } catch (error: any) {
    console.error('Groq Rewrite Error:', error);
    return NextResponse.json({ error: 'Gagal rewriting' }, { status: 500 });
  }
}