import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Inisialisasi Groq dengan pengecekan API Key
const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.error('GROQ_API_KEY tidak ditemukan di environment variables!');
}

const groq = new Groq({ apiKey: groqApiKey || 'dummy-key' });

export async function POST(req: Request) {
  try {
    // 1. Baca data JSON yang dikirim dari Frontend (Dashboard Admin)
    const body = await req.json();
    const { totalPosts, visitors, chartData, recentPosts } = body;

    // 2. Bangun konteks data untuk AI (Gunakan data real jika ada, fallback ke dummy jika kosong)
    let analyticsContext = '';
    
    if (visitors !== undefined && totalPosts !== undefined) {
      // --- Data Real dari Dashboard ---
      const topArticles = recentPosts?.map((p: string, i: number) => `   ${i+1}. ${p}`).join('\n') || '   Belum ada artikel.';
      
      analyticsContext = `
        Statistik Utama Oneklik.id:
        - Total Pengunjung Minggu Ini: ${visitors.toLocaleString()} orang
        - Total Artikel Blog: ${totalPosts} artikel
        - Artikel Terbaru yang dipublikasikan: 
${topArticles}
      `;
    } else {
      // --- Fallback Data Dummy (Jika frontend belum mengirim data) ---
      analyticsContext = `
        Statistik Utama Oneklik.id (Data Dummy):
        - Bio Link: 450 views
        - Short Link: 320 views
        - Blog (Panduan CV): 120 views
        - Blog (File to QR): 80 views
      `;
    }

    // 3. Susun Prompt ke Groq
    const prompt = `Anda adalah konsultan SEO dan content strategist untuk platform Oneklik.id (platform Bio Link, Short Link, QR Code, dan CV Generator).
    
    Berikut adalah data performa konten terbaru dari platform:
    ${analyticsContext}
    
    Berikan 3 saran spesifik, actionable (langsung bisa dieksekusi), dan dalam bahasa Indonesia yang profesional untuk meningkatkan performa konten blog dan alat di platform ini. Fokus pada optimasi SEO, penambahan konten baru, dan promosi internal antar fitur.`;

    // 4. Panggil API Groq
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