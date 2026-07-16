import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

function generateShortCode() {
  return Math.random().toString(36).substring(2, 10);
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const design = JSON.parse(formData.get('design') as string || '{}');
  const isPremium = formData.get('isPremium') === 'true';

  if (!file) return NextResponse.json({ error: 'File wajib diupload' }, { status: 400 });

  // Upload file
  const fileExt = file.name.split('.').pop();
  const fileName = `user-${session.user.id}/${Date.now()}.${fileExt}`;
  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(fileName, file, { upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  // Generate short code
  let shortCode = generateShortCode();
  let isUnique = false;
  while (!isUnique) {
    const { data: existing } = await supabase
      .from('file_uploads')
      .select('id')
      .eq('short_code', shortCode)
      .maybeSingle();
    if (!existing) isUnique = true;
    else shortCode = generateShortCode();
  }

  const { error: insertError } = await supabase.from('file_uploads').insert({
    user_id: session.user.id,
    original_filename: file.name,
    file_url: publicUrl,
    short_code: shortCode,
    is_premium: isPremium,
    qr_design: design || { fgColor: '#000000', bgColor: '#ffffff', logo: null },
  });

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/s/${shortCode}`;
  return NextResponse.json({ shortUrl, shortCode, fileUrl: publicUrl, design });
}