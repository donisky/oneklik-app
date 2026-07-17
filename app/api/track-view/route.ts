import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { userId } = await req.json();

  // Catat kunjungan halaman
  await supabase.from('analytics_events').insert({
    user_id: userId,
    event_type: 'profile_view',
  });

  return NextResponse.json({ success: true });
}