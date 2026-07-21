import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { userId, pagePath } = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Catat ke tabel analytics_events (jika masih digunakan)
    if (userId) {
      await supabase.from('analytics_events').insert({
        user_id: userId,
        event_type: 'profile_view',
      });
    }

    // Catat ke tabel page_views (untuk dashboard admin)
    if (pagePath) {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('page_views')
        .select('id, view_count')
        .eq('page_path', pagePath)
        .eq('date', today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('page_views')
          .update({ view_count: existing.view_count + 1 })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('page_views')
          .insert({ page_path: pagePath, view_count: 1, date: today });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    return NextResponse.json({ error: 'Gagal mencatat view' }, { status: 500 });
  }
}