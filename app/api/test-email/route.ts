import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Oneklik.id <noreply@oneklik.my.id>',
      to: ['doni12430@gmail.com'], // Ganti dengan email Anda
      subject: '🔍 TEST: Apakah Resend berfungsi?',
      html: '<h1>Halo!</h1><p>Jika Anda melihat email ini, Resend bekerja dengan benar.</p>',
    });

    if (error) {
      console.error('Resend test error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}