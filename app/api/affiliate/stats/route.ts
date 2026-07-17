import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const supabase = createRouteHandlerClient({ cookies }, {
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  // Ambil data afiliasi
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('referral_code')
    .eq('email', email)
    .single();

  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });

  const code = affiliate.referral_code;

  // Hitung total klik
  const { count: totalClicks } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('referral_code', code);

  // Hitung total konversi & komisi
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('amount, commission')
    .eq('referral_code', code);

  const totalConversions = conversions?.length || 0;
  const totalCommission = conversions?.reduce((sum, c) => sum + Number(c.commission), 0) || 0;
  const conversionRate = totalClicks && totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  return NextResponse.json({
    referralCode: code,
    referralLink: `https://oneklik.my.id/r/${code}`,
    totalClicks: totalClicks || 0,
    totalConversions,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    totalCommission
  });
}