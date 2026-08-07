import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan Service Role Key untuk bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Hitung total user
  const { count: totalUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Hitung user premium
  const { count: premiumUsers } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', true);

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
  });
}