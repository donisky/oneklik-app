import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { userId, pagePath } = await req.json();
    console.log('[track-view] Received:', { userId, pagePath });

    if (!pagePath) {
      console.warn('[track-view] No pagePath provided');
      return NextResponse.json({ error: 'pagePath is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // === 1. Insert/Update page_views dengan aman (gunakan upsert + maybeSingle) ===
    const today = new Date().toISOString().split('T')[0];
    
    // Coba ambil data yang sudah ada
    const { data: existing, error: fetchError } = await supabase
      .from('page_views')
      .select('id, view_count')
      .eq('page_path', pagePath)
      .eq('date', today)
      .maybeSingle(); // Ganti .single() menjadi .maybeSingle()

    if (fetchError) {
      console.error('[track-view] Fetch error:', fetchError);
      return NextResponse.json({ error: 'Database fetch error' }, { status: 500 });
    }

    if (existing) {
      // Update increment
      const { error: updateError } = await supabase
        .from('page_views')
        .update({ view_count: existing.view_count + 1 })
        .eq('id', existing.id);

      if (updateError) {
        console.error('[track-view] Update error:', updateError);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }
      console.log('[track-view] Incremented view for', pagePath, 'on', today);
    } else {
      // Insert baru
      const { error: insertError } = await supabase
        .from('page_views')
        .insert({ page_path: pagePath, view_count: 1, date: today, user_id: userId || null });

      if (insertError) {
        console.error('[track-view] Insert error:', insertError);
        return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
      }
      console.log('[track-view] Inserted new view for', pagePath, 'on', today);
    }

    // === 2. (Opsional) Juga simpan ke analytics_events jika masih dipakai ===
    if (userId) {
      const { error: analyticsError } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_type: 'profile_view',
          page_path: pagePath,
        });

      if (analyticsError) {
        console.warn('[track-view] Failed to insert analytics event:', analyticsError);
        // Jangan return error, hanya log warning karena tidak fatal
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[track-view] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}