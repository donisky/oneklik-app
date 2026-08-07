import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Gunakan Service Role Key untuk bypass RLS dan mengambil semua user
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const filterPremium = searchParams.get('filterPremium') || 'all';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' });

    // Filter: search by name or email
    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filter: premium status
    if (filterPremium === 'premium') {
      query = query.eq('is_premium', true);
    } else if (filterPremium === 'free') {
      query = query.eq('is_premium', false);
    }

    // Sort
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: true });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}