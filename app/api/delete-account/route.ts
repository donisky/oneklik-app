import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    console.log('Request userId:', userId); // Debugging

    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 });
    }

    // --- PERBAIKAN DI SINI ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing ENV variables:', { supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
      return NextResponse.json({ error: 'Server configuration error. Missing Admin Key.' }, { status: 500 });
    }

    // Gunakan Service Role Key (BUKAN Anon Key)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    // --- ----------------- ---

    // 1. Hapus data user dari tabel public 'users'
    const { error: publicError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (publicError) {
      console.error('Error deleting from public.users:', publicError);
    }

    // 2. Hapus user dari tabel auth.users (Hanya bisa dengan Service Role Key)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting from auth.users:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil dihapus permanen' });

  } catch (error: any) {
    console.error('🔥 Delete account error:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan server' }, { status: 500 });
  }
}