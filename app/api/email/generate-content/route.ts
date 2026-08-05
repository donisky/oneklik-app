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
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const pilar = body.pilar || PILARS[new Date().getDay() % PILARS.length];
    console.log(`[AI] Generating content for pillar: ${pilar}`);

    // 1. Ambil riwayat dari Supabase (dengan error handling yang kuat)
    let historyTopics = 'Belum ada riwayat';
    try {
      const { data: history, error } = await supabase
        .from('email_campaign_logs')
        .select('sub_topik')
        .eq('pilar', pilar)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) {
        console.warn('[AI] Supabase history fetch warning:', error.message);
      } else if (history && history.length > 0) {
        historyTopics = history.map((h) => h.sub_topik).join(', ');
      }
    } catch (dbErr) {
      console.warn('[AI] Database connection issue, proceeding without history:', dbErr);
      // Jangan gagal; biarkan AI berjalan tanpa history
    }

    // 2. Prompt Groq
    const prompt = `
Anda adalah senior copywriter untuk platform digital "Oneklik.id".
Tugas Anda: buat 1 email promosi (CTA) hari ini dalam Bahasa Indonesia yang natural, hangat, dan humanis.

Output dalam JSON:
{
  "subject": "Judul maksimal 50 karakter",
  "body": "Isi email dalam HTML (tanpa <html>/<body>), terdiri dari 4 paragraf pendek, dengan satu Call-to-Action (CTA) di akhir."
}

Panduan:
1. Gaya tulisan seperti "teman yang memberi saran", jangan kaku.
2. Buka dengan pertanyaan atau cerita kecil yang relate dengan pengguna.
3. Jangan gunakan kata "klik di sini", buat CTA menyatu secara alami.
4. Fokus pada nilai manfaat pengguna, bukan fitur teknis.

Pilar hari ini: ${pilar}
Sub-topik yang sudah dikirim 30 hari terakhir (JANGAN gunakan ini):
${historyTopics}

Buat topik yang benar-benar baru dan segar, lalu tulis emailnya.
`;

    // 3. Panggil Groq dengan model yang lebih stabil (temperature diturunkan ke 0.7 agar lebih disiplin JSON)
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7, 
      response_format: { type: 'json_object' },
      max_tokens: 500, // batasi agar tidak terlalu panjang
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
    console.log('[AI] Raw Groq response:', rawContent.substring(0, 200) + '...');

    // 4. Parse JSON dengan aman
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (jsonError) {
      console.error('[AI] Failed to parse Groq JSON:', rawContent);
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 });
    }

    if (!parsed.subject || !parsed.body) {
      return NextResponse.json({ error: 'AI response missing subject or body' }, { status: 502 });
    }

    return NextResponse.json({ pilar, ...parsed });
  } catch (error: any) {
    console.error('[AI] CRITICAL GENERATION ERROR:', error.message);
    return NextResponse.json({ error: error.message || 'Gagal generate konten' }, { status: 500 });
  }
}