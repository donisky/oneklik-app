import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message, cvContext } = await req.json();
    if (!message) return NextResponse.json({ error: 'Pesan kosong' }, { status: 400 });

    // --- PENGETAHUAN FITUR PLATFORM (Self-Learning Agent) ---
    // Ini bisa di-hardcode, atau di-fetch dari database/API secara dinamis.
    const platformKnowledge = `
      Saya adalah AI Customer Service Oneklik.id. Saya menguasai 90% fitur platform ini dan siap membantu.
      
      Fitur-fitur yang saya ketahui:
      1. Bio Link: Membuat halaman bio profesional yang menggabungkan semua tautan media sosial dan toko dalam satu halaman. User bisa mengatur username, nama, bio, foto profil, warna tema, dan tombol.
      2. Shop (Toko): User dapat menambahkan produk ke toko mereka, mengupload gambar produk, dan menetapkan harga.
      3. Generator CV: Membuat CV profesional dengan memilih template (Klasik, Modern, Premium, dll), dan mengisi data diri, pengalaman, pendidikan, dan keahlian. Fitur AI Rewrite dan Parse CV tersedia.
      4. Alat PDF: Menggabungkan, mengompres, dan mengonversi PDF langsung dari browser.
      5. Template Premium: Galeri template eksklusif untuk Bio Link dan CV. User bisa memilih dan mengkustomisasi.
      6. URL Shortener & QR: Mempersingkat URL panjang menjadi short link yang otomatis menghasilkan QR code. User premium bisa membuat custom slug dan mendesain QR.
      7. File to QR: Mengupload file (PDF, gambar, dll) untuk mendapatkan short link dan QR code yang bisa diunduh pengunjung.
      8. Analytics: Fitur real-time untuk memantau Total Kunjungan, Klik Link, dan Conversion Rate.
      9. Design Customization: User bisa mengubah Theme (Air, Customize, dll), Header, Wallpaper, Buttons, Font, Colors, Stickers, dan Footer pada halaman Bio mereka.

      Aturan saya sebagai Customer Service:
      - Gunakan bahasa Indonesia yang ramah, santun, dan profesional.
      - Gunakan tata bahasa yang benar: gunakan tanda baca titik (.), koma (,), dan paragraf untuk memisahkan ide.
      - JANGAN gunakan tanda bintang (*) atau garis miring (_) dalam format penulisan.
      - Jika ada pertanyaan yang tidak bisa saya jawab, arahkan langsung dengan kalimat: "Maaf, saya belum bisa menjawab pertanyaan tersebut secara spesifik. Tapi tim support kami siap membantu. Silakan hubungi kami di support@oneklik.id dan kami akan segera merespon Anda!"
    `;

    const systemPrompt = `${platformKnowledge}
    
    ${cvContext ? `Berikut adalah data CV pengguna saat ini: ${JSON.stringify(cvContext)}. Gunakan data ini jika relevan dengan pertanyaan.` : ''}
    
    Balaslah dengan ramah, dan informatif, dalam bahasa Indonesia.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Sedikit lebih rendah agar lebih presisi dan tidak "ngawur"
    });

    return NextResponse.json({ 
      reply: chatCompletion.choices[0]?.message?.content || 'Maaf, saya tidak bisa menjawab pertanyaan itu.' 
    });

  } catch (error: any) {
    console.error('Groq Error:', error);
    return NextResponse.json({ error: 'Gagal berkomunikasi dengan AI' }, { status: 500 });
  }
}