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

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url, customSlug, design, isPremium } = await req.json();
  if (!url) {
    return NextResponse.json({ error: 'URL wajib diisi' }, { status: 400 });
  }

  // --- PERBAIKAN TYPE SCRIPT DI SINI ---
  let shortCode: string; // Deklarasi tipe eksplisit agar TypeScript tahu ini pasti terisi

  if (customSlug) {
    // 1. Jika user premium dan memberikan custom slug
    const { data: existing } = await supabase
      .from('short_links')
      .select('id')
      .eq('short_code', customSlug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Custom slug sudah digunakan' }, { status: 400 });
    }
    
    shortCode = customSlug; // Nilai dipastikan terisi di sini
  } else {
    // 2. Jika bukan premium (atau tanpa custom slug), generate kode acak unik
    let isUnique = false;
    let generatedCode = '';

    while (!isUnique) {
      generatedCode = generateShortCode();
      const { data: existing } = await supabase
        .from('short_links')
        .select('id')
        .eq('short_code', generatedCode)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      }
    }
    shortCode = generatedCode; // Nilai dipastikan terisi di sini
  }
  // -----------------------------------------------------

  // Simpan ke database
  const { error } = await supabase.from('short_links').insert({
    user_id: session.user.id,
    original_url: url,
    short_code: shortCode,
    custom_slug: customSlug || null,
    is_premium: isPremium || false,
    qr_design: design || { fgColor: '#000000', bgColor: '#ffffff', logo: null },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${shortCode}`;
  return NextResponse.json({ shortUrl, shortCode, design });
}