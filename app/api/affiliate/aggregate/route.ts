import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Admin (sama seperti di webhook)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Ekspor ini AGAR dipaksa Dynamic (mencegah error build)
export const dynamic = 'force-dynamic';

export async function GET() {
  // Hitung total afiliasi
  const { count: totalAffiliates } = await supabaseAdmin
    .from('affiliates')
    .select('*', { count: 'exact', head: true });

  // Hitung total komisi bulan ini
  const { data: monthlyCommissions } = await supabaseAdmin
    .from('affiliate_conversions')
    .select('commission')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const totalCommissionThisMonth = monthlyCommissions?.reduce((sum, c) => sum + Number(c.commission), 0) || 0;

  return NextResponse.json({
    totalAffiliates: totalAffiliates || 0,
    totalCommissionThisMonth: totalCommissionThisMonth
  });
}