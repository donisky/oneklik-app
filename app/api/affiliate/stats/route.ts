import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const supabase = createRouteHandlerClient({ cookies });

  // 1. Ambil user_id berdasarkan email dari tabel users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  }

  // 2. Ambil profil afiliasi dari tabel affiliate_profiles
  const { data: affiliateProfile, error: profileError } = await supabase
    .from('affiliate_profiles')
    .select('referral_code, referral_link, total_clicks, total_conversions, total_commission, pending_commission, paid_commission')
    .eq('user_id', userData.id)
    .maybeSingle();

  if (profileError || !affiliateProfile) {
    return NextResponse.json({ error: 'Profil afiliasi tidak ditemukan' }, { status: 404 });
  }

  const code = affiliateProfile.referral_code;

  // 3. Hitung total klik berdasarkan referral_code
  const { count: totalClicks } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('referral_code', code);

  // 4. Hitung total konversi & komisi
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('amount, commission')
    .eq('referral_code', code);

  const totalConversions = conversions?.length || 0;
  const totalCommission = conversions?.reduce((sum, c) => sum + Number(c.commission), 0) || 0;
  const conversionRate = totalClicks && totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  return NextResponse.json({
    referralCode: code,
    referralLink: affiliateProfile.referral_link || `https://oneklik.my.id/r/${code}`,
    totalClicks: totalClicks || 0,
    totalConversions,
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    totalCommission,
    pendingCommission: affiliateProfile.pending_commission || 0,
    paidCommission: affiliateProfile.paid_commission || 0,
  });
}