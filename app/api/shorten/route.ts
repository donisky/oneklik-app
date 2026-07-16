import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Generator kode acak 8 karakter (huruf & angka)
function generateShortCode() {
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url, mode } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL wajib diisi' }, { status: 400 });

  let shortCode = generateShortCode();
  let isUnique = false;

  // Loop sampai dapat kode unik (mencegah duplicate key error)
  while (!isUnique) {
    const { data: existing } = await supabase
      .from(mode === 'file' ? 'file_uploads' : 'short_links')
      .select('id')
      .eq('short_code', shortCode)
      .maybeSingle();

    if (!existing) isUnique = true;
    else shortCode = generateShortCode();
  }

  // Simpan ke database sesuai mode
  if (mode === 'file') {
    // (Untuk file, kita panggil API terpisah, jadi ini hanya untuk link)
  } else {
    const { error } = await supabase.from('short_links').insert({
      user_id: session.user.id,
      original_url: url,
      short_code: shortCode,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${shortCode}`;
  return NextResponse.json({ shortUrl, shortCode });
}