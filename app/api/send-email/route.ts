import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, name, email, message, type } = await req.json();

    const emailContent = `
      <h2>Pesan Baru dari Oneklik.my.id</h2>
      <p><strong>Nama:</strong> ${name}</p>
      <p><strong>Email Pengirim:</strong> ${email}</p>
      <p><strong>Tipe Pesan:</strong> ${type === 'report' ? 'Laporan Masalah' : 'Kontak Umum'}</p>
      <hr />
      <p><strong>Pesan:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    const { data, error } = await resend.emails.send({
      from: `Oneklik.id <onboarding@resend.dev>`, // Ganti nanti dengan domain Anda setelah diverifikasi di Resend
      to: [to],
      subject: subject,
      reply_to: email,
      html: emailContent,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengirim email' }, { status: 500 });
  }
}