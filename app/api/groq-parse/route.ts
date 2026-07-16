import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    // --- PROTECTION: CEK SESSION & PREMIUM ---
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_premium')
      .eq('id', session.user.id)
      .single();

    if (!userData?.is_premium) {
      return NextResponse.json({ 
        error: 'Fitur AI hanya untuk pengguna Premium. Silakan upgrade akun Anda.' 
      }, { status: 403 });
    }
    // ----------------------------------------------------

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Teks kosong' }, { status: 400 });
    }

    const systemPrompt = `
      Anda adalah AI asisten CV. 
      Tugas Anda adalah membaca teks dari sebuah CV dan mengubahnya menjadi JSON dengan struktur ketat ini:
      {
        "personal": { "firstName": "", "lastName": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": "" },
        "summary": "",
        "experience": [ { "company": "", "role": "", "startDate": "", "endDate": "", "description": "" } ],
        "education": [ { "school": "", "degree": "", "field": "", "startDate": "", "endDate": "" } ],
        "skills": [],
        "languages": [ { "language": "", "level": "" } ],
        "hobbies": []
      }
      Kembalikan hanya JSON (tanpa markdown atau penjelasan). Jika data tidak ada, isi dengan string kosong [].
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Berikut adalah teks CV mentah:\n\n${text}` }
      ],
      model: "llama-3.3-70b-versatile", 
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const jsonString = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(jsonString);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('Groq Error:', error);
    return NextResponse.json({ error: 'Gagal memproses CV dengan AI' }, { status: 500 });
  }
}