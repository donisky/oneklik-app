import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, cvContext } = await req.json();
    if (!message) return NextResponse.json({ error: 'Pesan kosong' }, { status: 400 });

    // --- FITUR SELF-LEARNING: AMBIL DATA DARI DATABASE ---
    const supabase = createRouteHandlerClient({ cookies });
    
    // Ambil semua pengetahuan dari tabel ai_knowledge
    const { data: knowledgeData, error } = await supabase
      .from('ai_knowledge')
      .select('key, content');

    if (error) {
      console.error('Gagal mengambil pengetahuan AI:', error);
      // Fallback jika database error
    }

    // Ubah data array menjadi string prompt yang rapi
    let dynamicKnowledge = '';
    if (knowledgeData) {
      knowledgeData.forEach(item => {
        dynamicKnowledge += `${item.key}:\n${item.content}\n\n`;
      });
    }

    // Gabungkan dengan konteks awal
    const systemPrompt = `
      Saya adalah AI Customer Service Oneklik.id. Saya menguasai 90% fitur platform ini dan siap membantu.
      
      PENGETAHUAN PLATFORM SAYA (Diperbarui secara otomatis):
      ${dynamicKnowledge}
      
      ${cvContext ? `Berikut adalah data CV pengguna saat ini: ${JSON.stringify(cvContext)}. Gunakan data ini jika relevan dengan pertanyaan.` : ''}
      
      Balaslah dengan ramah, informatif, dan dalam bahasa Indonesia.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    return NextResponse.json({ 
      reply: chatCompletion.choices[0]?.message?.content || 'Maaf, saya tidak bisa menjawab pertanyaan itu.' 
    });

  } catch (error: any) {
    console.error('Groq Error:', error);
    return NextResponse.json({ error: 'Gagal berkomunikasi dengan AI' }, { status: 500 });
  }
}