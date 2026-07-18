import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

// Ganti createRouteHandlerClient dengan Admin Client (melewati RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    // Cek apakah email sudah terdaftar (menggunakan admin client)
    const { data: existing } = await supabaseAdmin
      .from('affiliates')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ isNew: false, ...existing });
    }

    // Generate referral code unik
    let referralCode = randomBytes(4).toString('hex');
    let isUnique = false;
    while (!isUnique) {
      const { data: check } = await supabaseAdmin
        .from('affiliates')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      if (!check) isUnique = true;
      else referralCode = randomBytes(4).toString('hex');
    }

    // Insert ke database (RLS tidak akan memblokir karena kita pakai Service Role Key)
    const { data, error } = await supabaseAdmin
      .from('affiliates')
      .insert({ email, referral_code: referralCode })
      .select()
      .single();

    if (error) {
      console.error('❌ Gagal insert affiliate:', error);
      throw error;
    }

    return NextResponse.json({ isNew: true, ...data });

  } catch (error: any) {
    console.error('❌ Register error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 });
  }
}