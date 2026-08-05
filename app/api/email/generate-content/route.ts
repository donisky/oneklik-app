import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PILARS = ['produktivitas', 'cv', 'pdf', 'marketing', 'premium'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pilar = body.pilar || PILARS[new Date().getDay() % PILARS.length];

    // 1. Ambil riwayat 10 sub-topik terakhir untuk pilar ini
    const { data: history } = await supabase
      .from('email_campaign_logs')
      .select('sub_topik')
      .eq('pilar', pilar)
      .order('sent_at', { ascending: false })
      .limit(10);

    const historyTopics = history?.map((h) => h.sub_topik).join(', ') || 'Belum ada';

    // 2. Panggil Groq
    const prompt = `
Anda adalah senior copywriter dan marketing strategist untuk platform digital "Oneklik.id".
Tugas Anda: membuat 1 email promosi (CTA) setiap hari dalam Bahasa Indonesia yang sangat natural, hangat, dan humanis.

Output harus dalam format JSON:
{
  "subject": "Judul email yang catchy (maks 50 karakter)",
  "body": "Isi email dalam HTML (tanpa <html>/<body>), terdiri dari 4-5 paragraf pendek, dengan satu Call-to-Action (CTA) di akhir."
}

Panduan Penulisan:
1. Gunakan gaya "teman yang sedang memberi saran".
2. Buka dengan sebuah *story* kecil atau pertanyaan yang relate dengan kehidupan digital pengguna.
3. Jangan pernah mengulang kata "klik di sini".
4. Fokus pada manfaat daripada fitur teknis.
5. CTA terintegrasi alami, contoh: "Coba fitur ini sekarang di dashboard Oneklik Anda".

Pilar konten hari ini: ${pilar}
Sub-topik yang sudah dikirim 30 hari terakhir (JANGAN gunakan ini):
${historyTopics}

Buatlah topik baru yang segar dan menarik, lalu tulis emailnya.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.85,
      response_format: { type: 'json_object' },
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(rawContent);

    return NextResponse.json({ pilar, ...parsed });
  } catch (error) {
    console.error('Groq generation error:', error);
    return NextResponse.json({ error: 'Gagal generate konten' }, { status: 500 });
  }
}