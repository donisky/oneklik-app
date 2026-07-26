import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowLeft, Star } from 'lucide-react';

export default async function PublicShopPage({ params }: { params: { username: string } }) {
  const supabase = createServerComponentClient({ cookies });
  const username = params.username;

  // 1. Ambil data user berdasarkan username
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, full_name, username, avatar_url')
    .eq('username', username)
    .maybeSingle();

  if (!user || userError) {
    notFound();
  }

  // 2. Ambil produk toko yang aktif (hanya yang status 'aktif')
  const { data: products, error: productsError } = await supabase
    .from('shop_products')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'aktif') // Hanya tampilkan produk aktif di halaman publik
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('Error fetching shop products:', productsError);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        
        {/* Back to Bio Link */}
        <Link href={`/${username}`} className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-6 font-medium">
          <ArrowLeft size={16} /> Kembali ke Bio
        </Link>

        {/* Header Profil Toko */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-3 overflow-hidden">
            {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : user.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{user.full_name || 'Pengguna'}</h1>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <p className="text-xs text-slate-400 mt-2">🛍️ Toko Digital</p>
        </div>

        {/* Grid Produk */}
        <h2 className="text-lg font-bold text-slate-800 mb-4">Produk Tersedia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products && products.length > 0 ? (
            products.map((prod) => (
              <div key={prod.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {prod.image_url ? (
                    <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={32} className="text-slate-300" />
                  )}
                </div>
                <h3 className="font-semibold text-slate-800 text-sm truncate">{prod.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 h-8">{prod.description || 'Produk digital'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-blue-600">{prod.price}</span>
                  <a href={prod.product_link || '#'} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Beli
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-slate-400 text-sm">
              <Package size={48} className="mx-auto mb-2 text-slate-200" />
              Pengguna ini belum memiliki produk yang tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}