import { NextResponse } from 'next/server';
import { groq } from '@/lib/groq/client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PILARS = ['produktivitas', 'cv', 'pdf', 'marketing', 'premium'];

// Template fallback jika AI gagal
const FALLBACK_CONTENT = {
  subject: '✨ Temukan Cara Baru Meningkatkan Produktivitas Digitalmu',
  body: `<p>Halo, <strong>Pengguna Oneklik.id</strong> 👋</p>
<p>Kamu tahu nggak, kalau mengelola semua kebutuhan digital dalam satu platform bisa menghemat waktu hingga 50%?</p>
<p>Dengan <strong>Oneklik.id</strong>, kamu bisa membuat CV ATS-friendly, mengompres PDF, dan membuat QR code hanya dalam beberapa klik. Semua fitur ini sudah siap digunakan, <strong>tanpa batas dan tanpa watermark</strong>.</p>
<p>Yuk, coba fitur baru kami sekarang dan rasakan sendiri kemudahannya!</p>
<p style="text-align: center; margin-top: 24px;">
  <a href="https://oneklik.my.id/dashboard" style="display: inline-block; background: #2563EB; color: #fff; padding: 12px 32px; border-radius: 999px; text-decoration: none; font-weight: bold;">Jelajahi Dashboard Sekarang →</a>
</p>`
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const pilar = body.pilar || PILARS[new Date().getDay() % PILARS.length];
    console.log(`[AI] Generating content for pillar: ${pilar}`);

    // 1. Ambil riwayat dari Supabase (dengan error handling)
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
    }

    // 2. Prompt yang lebih ketat
    const prompt = `
Anda adalah senior copywriter untuk platform digital "Oneklik.id".

Tugas Anda: TULIS 1 EMAIL PROMOSI (CTA) DALAM BAHASA INDONESIA YANG NATURAL DAN HUMANIS.

PENTING: Kembalikan HANYA JSON, TANPA KOMENTAR, TANPA TEKS LAIN.
Output harus berupa JSON valid ini:
{"subject": "Judul (maks 50 karakter)", "body": "Isi email dalam HTML (tanpa tag html/body, gunakan paragraf <p>, minimal 3 paragraf dengan satu CTA di akhir)"}

Panduan gaya: teman yang memberi saran, tidak formal, tidak agresif, fokus pada manfaat.
Pilar: ${pilar}
Sub-topik yang sudah dipakai (JANGAN PAKAI): ${historyTopics}
Buat topik baru, lalu kirim JSON.
`;

    // 3. Panggil Groq dengan temperature lebih rendah dan batasan token
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || '';
    console.log('[AI] Raw Groq response (first 200 chars):', rawContent.substring(0, 200));

    // 4. Coba parse JSON dengan aman, dan fallback jika gagal
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (jsonError) {
      console.warn('[AI] JSON parsing failed, attempting regex extraction...');
      // Coba ekstrak JSON menggunakan regex
      const jsonMatch = rawContent.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (regexError) {
          console.error('[AI] Regex extraction also failed');
        }
      }
      // Jika semua gagal, gunakan fallback
      if (!parsed || !parsed.subject || !parsed.body) {
        console.error('[AI] All parsing attempts failed. Using fallback content.');
        return NextResponse.json({ pilar, ...FALLBACK_CONTENT });
      }
    }

    // Validasi minimal
    if (!parsed.subject || !parsed.body) {
      console.warn('[AI] Response missing subject or body. Using fallback.');
      return NextResponse.json({ pilar, ...FALLBACK_CONTENT });
    }

    return NextResponse.json({ pilar, ...parsed });
  } catch (error: any) {
    console.error('[AI] CRITICAL GENERATION ERROR:', error.message);
    // Jangan gagalkan request, berikan fallback
    return NextResponse.json({ pilar, ...FALLBACK_CONTENT });
  }
}