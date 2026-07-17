import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies }, {
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  // Hitung total afiliasi
  const { count: totalAffiliates } = await supabase
    .from('affiliates')
    .select('*', { count: 'exact', head: true });

  // Hitung total komisi bulan ini (gunakan date_trunc untuk PostgreSQL)
  const { data: monthlyCommissions } = await supabase
    .from('affiliate_conversions')
    .select('commission')
    .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const totalCommissionThisMonth = monthlyCommissions?.reduce((sum, c) => sum + Number(c.commission), 0) || 0;

  return NextResponse.json({
    totalAffiliates: totalAffiliates || 0,
    totalCommissionThisMonth
  });
}