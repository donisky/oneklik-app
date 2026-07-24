import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Admin (bypass RLS untuk read & update clicks)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code;
  if (!code) {
    return NextResponse.redirect('/');
  }

  // 1. Cek di tabel short_links
  const { data: linkData, error: linkError } = await supabaseAdmin
    .from('short_links')
    .select('*')
    .eq('short_code', code)
    .maybeSingle();

  if (linkError) {
    console.error('❌ Error fetching short_link:', linkError);
    return NextResponse.redirect('/');
  }

  if (linkData) {
    // Update clicks
    await supabaseAdmin
      .from('short_links')
      .update({ clicks: (linkData.clicks || 0) + 1 })
      .eq('short_code', code);
    return NextResponse.redirect(linkData.original_url, 307);
  }

  // 2. Cek di tabel file_uploads
  const { data: fileData, error: fileError } = await supabaseAdmin
    .from('file_uploads')
    .select('*')
    .eq('short_code', code)
    .maybeSingle();

  if (fileError) {
    console.error('❌ Error fetching file_upload:', fileError);
    return NextResponse.redirect('/');
  }

  if (fileData) {
    // Update clicks
    await supabaseAdmin
      .from('file_uploads')
      .update({ clicks: (fileData.clicks || 0) + 1 })
      .eq('short_code', code);
    return NextResponse.redirect(fileData.file_url, 307);
  }

  // 3. Jika tidak ditemukan sama sekali
  return NextResponse.redirect('/');
}