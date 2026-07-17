import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
// Jika Anda menggunakan Resend untuk kirim email:
// import { resend } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });

    // Koneksi Supabase (Service Role - bypass RLS)
    const supabase = createRouteHandlerClient({ cookies }, { 
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY 
    });

    // Cek apakah email sudah terdaftar
    const { data: existing } = await supabase
      .from('affiliates')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ isNew: false, ...existing });
    }

    // Generate referral code unik
    let referralCode = randomBytes(4).toString('hex'); // contoh: "a1b2c3d4"
    let isUnique = false;
    while (!isUnique) {
      const { data: check } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      if (!check) isUnique = true;
      else referralCode = randomBytes(4).toString('hex');
    }

    // Insert ke database
    const { data, error } = await supabase
      .from('affiliates')
      .insert({ email, referral_code: referralCode })
      .select()
      .single();

    if (error) throw error;

    // (Opsional) Kirim email pemberitahuan via Resend
    // await resend.emails.send({ ... });

    return NextResponse.json({ isNew: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}