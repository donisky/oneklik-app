import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

// Fungsi helper untuk membuat slug acak
function generateRandomSlug(length = 6) {
  return randomBytes(length).toString('hex').slice(0, length);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, isPremium, customSlug, design } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL wajib diisi' }, { status: 400 });
    }

    // Validasi URL (opsional, bisa ditambahkan library valid-url atau regex)
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL tidak valid' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies }, {
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY // Supaya bypass RLS
    });

    // Ambil user yang sedang login (untuk pelacakan ownership)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Tentukan slug
    let slug: string;
    if (isPremium && customSlug && customSlug.trim() !== '') {
      slug = customSlug.trim();
      
      // Cek apakah custom slug sudah dipakai
      const { data: existing } = await supabase
        .from('short_links')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({ error: 'Custom slug sudah digunakan, silakan pilih yang lain.' }, { status: 400 });
      }
    } else {
      // Generate random slug
      let isUnique = false;
      while (!isUnique) {
        slug = generateRandomSlug(6);
        const { data: check } = await supabase
          .from('short_links')
          .select('slug')
          .eq('slug', slug)
          .maybeSingle();
        if (!check) isUnique = true;
      }
    }

    // Simpan ke database
    // Asumsi: Anda memiliki tabel 'short_links'. Jika belum, buat di Supabase SQL Editor.
    // Kolom yang disarankan: id (uuid), slug (text unique), original_url (text), user_id (uuid), metadata (jsonb), created_at (timestamptz)
    const { data, error } = await supabase
      .from('short_links')
      .insert({
        slug: slug,
        original_url: url,
        user_id: userId,
        // Simpan desain QR ke kolom metadata (jsonb) agar bisa dipakai nanti di halaman redirect /s/[slug]
        metadata: isPremium && design ? { 
          fg_color: design.fgColor || '#0B2E24', 
          bg_color: design.bgColor || '#FFFFFF' 
        } : null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Gagal menyimpan link ke database' }, { status: 500 });
    }

    // Bangun URL pendek
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://oneklik.my.id';
    const shortUrl = `${baseUrl}/s/${slug}`;

    return NextResponse.json({
      shortUrl: shortUrl,
      shortCode: slug,
      design: data.metadata
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}