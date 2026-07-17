import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { linkId, userId } = await req.json();

  // Catat klik link
  await supabase.from('analytics_events').insert({
    user_id: userId,
    link_id: linkId,
    event_type: 'link_click',
  });

  return NextResponse.json({ success: true });
}