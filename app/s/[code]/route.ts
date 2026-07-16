import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code;
  if (!code) return NextResponse.redirect('/');

  const supabase = createRouteHandlerClient({ cookies });

  // Cek di tabel short_links
  const { data: linkData } = await supabase
    .from('short_links')
    .select('*')  // Ubah dari 'original_url' ke '*' agar dapat mengakses clicks
    .eq('short_code', code)
    .single();

  if (linkData) {
    // Tambahkan klik
    await supabase.from('short_links').update({ clicks: linkData.clicks + 1 }).eq('short_code', code);
    return NextResponse.redirect(linkData.original_url, 307);
  }

  // Cek di tabel file_uploads
  const { data: fileData } = await supabase
    .from('file_uploads')
    .select('*')  // Ubah dari 'file_url' ke '*' agar dapat mengakses clicks
    .eq('short_code', code)
    .single();

  if (fileData) {
    await supabase.from('file_uploads').update({ clicks: fileData.clicks + 1 }).eq('short_code', code);
    return NextResponse.redirect(fileData.file_url, 307);
  }

  // Jika tidak ditemukan, redirect ke beranda
  return NextResponse.redirect('/');
}