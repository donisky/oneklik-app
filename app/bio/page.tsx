'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { templates } from '@/app/lib/templateData';
import {
  Plus, Trash2, Eye, ArrowLeft, Crown, LogOut,
  Bell, CheckCircle2, Share2, Copy, Paintbrush,
  Facebook, Twitter, Linkedin, MessageCircle, Send,
  Image as ImageIcon, Video, Sparkles, Store, Palette, BarChart3, X,
  Instagram, Youtube, Music2, Twitch, Menu, LayoutDashboard, Link2,
  Search, SlidersHorizontal, ChevronDown, Pencil, Download, RefreshCw,
  MapPin, Monitor, TrendingUp, Smartphone, Laptop, Info, Package,
  ShoppingBag, Wallet, ClipboardList, Star, Lightbulb, LayoutGrid,
} from 'lucide-react';

/* =========================================================================
   UTILITIES
   ========================================================================= */

function fmtDateShort(d: Date) {
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
}

function computeDailySeries(events: any[], days: number) {
  const today = new Date();
  const buckets: { date: string; label: string; views: number; clicks: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({ date: d.toISOString().slice(0, 10), label: fmtDateShort(d), views: 0, clicks: 0 });
  }
  events.forEach((e) => {
    const dateStr = (e.created_at || '').slice(0, 10);
    const bucket = buckets.find((b) => b.date === dateStr);
    if (!bucket) return;
    if (e.event_type === 'profile_view') bucket.views += 1;
    else if (e.event_type === 'link_click') bucket.clicks += 1;
  });
  return buckets;
}

function computeHeatmap(events: any[]) {
  const dayLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu'];
  const matrix = Array.from({ length: 7 }, () => Array(24).fill(0));
  events.forEach((e) => {
    if (!e.created_at) return;
    const d = new Date(e.created_at);
    const day = d.getDay();
    const idx = day === 0 ? 6 : day - 1;
    matrix[idx][d.getHours()] += 1;
  });
  return { dayLabels, matrix };
}

function exportAnalyticsCSV(events: any[], links: any[]) {
  const header = 'Tanggal,Tipe,Link\n';
  const rows = events
    .map((e) => {
      const linkTitle = e.link_id ? (links.find((l) => l.id === e.link_id)?.title || '') : '';
      return `${e.created_at},${e.event_type},${linkTitle}`;
    })
    .join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'laporan-analytics.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

/* =========================================================================
   MINI CHARTS
   ========================================================================= */

const MiniLineChart = ({ series }: { series: { label: string; views: number; clicks: number }[] }) => {
  const width = 640;
  const height = 220;
  const pad = 28;
  const maxVal = Math.max(1, ...series.map((s) => Math.max(s.views, s.clicks)));
  const stepX = series.length > 1 ? (width - pad * 2) / (series.length - 1) : 0;
  const toY = (v: number) => height - pad - (v / maxVal) * (height - pad * 2);
  const pathFor = (key: 'views' | 'clicks') =>
    series.map((s, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * stepX} ${toY(s[key])}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad} x2={width - pad} y1={pad + t * (height - pad * 2)} y2={pad + t * (height - pad * 2)} stroke="#eef2f7" strokeWidth={1} />
      ))}
      <path d={pathFor('views')} fill="none" stroke="#93c5fd" strokeWidth={2.5} strokeDasharray="5 4" />
      <path d={pathFor('clicks')} fill="none" stroke="#2563eb" strokeWidth={3} />
      {series.map((s, i) => (
        <circle key={i} cx={pad + i * stepX} cy={toY(s.clicks)} r={3.5} fill="#2563eb" />
      ))}
      {series.map((s, i) =>
        i % Math.ceil(series.length / 7 || 1) === 0 ? (
          <text key={i} x={pad + i * stepX} y={height - 6} fontSize="10" textAnchor="middle" fill="#94a3b8">
            {s.label}
          </text>
        ) : null
      )}
    </svg>
  );
};

const DonutChart = ({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string | number;
}) => {
  const total = segments.reduce((acc: number, s) => acc + s.value, 0);
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36 flex-shrink-0 -rotate-90">
        <circle cx={80} cy={80} r={r} fill="none" stroke="#f1f5f9" strokeWidth={18} />
        {total > 0 &&
          segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * c;
            const el = (
              <circle
                key={i}
                cx={80}
                cy={80}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={18}
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      <div className="flex-1 space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </div>
            <span className="font-semibold text-slate-700">
              {total > 0 ? ((s.value / total) * 100).toFixed(1) : '0'}% ({s.value})
            </span>
          </div>
        ))}
        {total === 0 && <p className="text-xs text-slate-400">Belum ada data.</p>}
      </div>
    </div>
  );
};

const ActivityHeatmap = ({ events }: { events: any[] }) => {
  const { dayLabels, matrix } = useMemo(() => computeHeatmap(events), [events]);
  const max = Math.max(1, ...matrix.flat());
  return (
    <div>
      <div className="space-y-1">
        {matrix.map((row, r) => (
          <div key={r} className="flex items-center gap-1">
            <span className="w-10 text-[10px] text-slate-400 flex-shrink-0">{dayLabels[r]}</span>
            <div className="flex gap-[3px] flex-1">
              {row.map((v, h) => {
                const intensity = v / max;
                const bg =
                  v === 0 ? '#f1f5f9' : `rgba(37, 99, 235, ${0.15 + intensity * 0.75})`;
                return <div key={h} className="flex-1 aspect-square rounded-sm" style={{ backgroundColor: bg }} title={`${dayLabels[r]} ${h}:00 — ${v} aktivitas`} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2 pl-11 text-[9px] text-slate-400">
        <span>00</span><span>04</span><span>08</span><span>12</span><span>16</span><span>20</span><span>24</span>
      </div>
      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
        Rendah <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 inline-block" /> <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: 'rgba(37,99,235,0.9)' }} /> Tinggi
      </div>
    </div>
  );
};

/* =========================================================================
   PREVIEWS
   ========================================================================= */

const BioPreview = ({ user, links }: { user: any; links: any[] }) => {
  const template = templates.find((t: any) => t.id === parseInt(user?.selected_template || '1', 10)) || templates[0];
  const design = user?.design_settings || {};
  const bgType = design.bg_type || 'template';
  const customBgUrl = design.bg_custom_url || '';
  let backgroundStyle: any = {};
  if (bgType === 'url' || bgType === 'upload') {
    backgroundStyle = { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  } else {
    backgroundStyle = template?.bgImage
      ? { backgroundImage: `url(${template.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: user?.theme_bg || template?.colors?.bg || '#f3f4f6' };
  }
  const buttonColor = user?.theme_primary || (template as any)?.colors?.primary || '#3b82f6';
  const textColor = user?.theme_secondary || template?.colors?.text || '#ffffff';
  const fontFamily = design.font === 'serif' ? 'serif' : design.font === 'mono' ? 'monospace' : 'sans-serif';
  const btnStyle = design.buttons || 'fill';
  const showStickers = design.stickers === 'decorate' || design.stickers === 'fun';

  const socialPlatforms = [
    { key: 'social_instagram', name: 'Instagram', icon: <Instagram size={16} /> },
    { key: 'social_tiktok', name: 'TikTok', icon: <Music2 size={16} /> },
    { key: 'social_youtube', name: 'YouTube', icon: <Youtube size={16} /> },
    { key: 'social_facebook', name: 'Facebook', icon: <Facebook size={16} /> },
    { key: 'social_twitter', name: 'Twitter/X', icon: <Twitter size={16} /> },
    { key: 'social_linkedin', name: 'LinkedIn', icon: <Linkedin size={16} /> },
    { key: 'social_whatsapp', name: 'WhatsApp', icon: <MessageCircle size={16} /> },
    { key: 'social_telegram', name: 'Telegram', icon: <Send size={16} /> },
    { key: 'social_twitch', name: 'Twitch', icon: <Twitch size={16} /> },
  ];
  const socialLinks = socialPlatforms.filter((p) => user?.[p.key]).map((p) => ({ name: p.name, icon: p.icon, url: user[p.key] }));

  const getButtonStyles = (baseColor: string, defaultText: string) => {
    if (btnStyle === 'outline') return { backgroundColor: 'transparent', color: baseColor, border: `2px solid ${baseColor}` };
    if (btnStyle === 'ghost') return { backgroundColor: 'transparent', color: baseColor };
    return { backgroundColor: baseColor, color: defaultText };
  };

  return (
    <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] rounded-[3.5rem] border-[8px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl shadow-slate-400/20 group">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 shadow-lg" />
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={backgroundStyle} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80" />
      <div className="absolute top-[20%] -left-1 w-1.5 h-8 bg-gray-700 rounded-l-full" />
      <div className="absolute top-[30%] -left-1 w-1.5 h-12 bg-gray-700 rounded-l-full" />
      <div className="absolute top-[20%] -right-1 w-1.5 h-12 bg-gray-700 rounded-r-full" />

      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center" style={{ fontFamily }}>
        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl border border-white/20 mb-3">
          {user?.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" /> : (user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?')}
        </div>
        <h3 className="font-bold text-xl text-white drop-shadow-md">{user?.full_name || 'Nama Kamu'}</h3>
        <p className="text-[10px] mb-5 text-white/70 drop-shadow">@{user?.username || 'username'}</p>

        <div className="w-full space-y-3 px-2">
          {links && links.map((link) => {
            const btnStyleObj = getButtonStyles(buttonColor, textColor);
            return (
              <motion.a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.4, ease: 'easeInOut' }} className="block w-full py-3 px-4 rounded-2xl font-semibold shadow-lg backdrop-blur-sm relative overflow-hidden" style={btnStyleObj}>
                {link.title}
              </motion.a>
            );
          })}
          {user?.shop_link && (
            <motion.a href={user.shop_link} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.4, ease: 'easeInOut' }} className="block w-full py-3 px-4 rounded-2xl font-semibold shadow-lg backdrop-blur-sm" style={getButtonStyles('#22c55e', '#ffffff')}>
              🛍️ Shop
            </motion.a>
          )}
        </div>

        {showStickers && <div className="absolute top-4 left-4 text-2xl animate-bounce">✨</div>}

        <div className="mt-auto pb-6 w-full px-4 border-t border-white/10 pt-4">
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-3 mb-1">
              {socialLinks.map((social, idx) => (
                <motion.a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.2, y: -2 }} className="text-white/60 hover:text-white transition-colors bg-white/10 backdrop-blur-sm p-2 rounded-full" title={social.name}>
                  {social.icon}
                </motion.a>
              ))}
            </div>
          )}
          <div className="mt-2">
            <motion.a href="https://oneklik.my.id" target="_blank" whileHover={{ scale: 1.05 }} className="text-[9px] text-white/40 hover:text-white/80 transition-colors block font-semibold tracking-wider">
              Powered by <span className="text-blue-300">Oneklik.id</span>
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopPreview = ({ user, products }: { user: any; products: any[] }) => {
  const top = products.slice(0, 3);
  return (
    <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] rounded-[3.5rem] border-[8px] border-[#1a1a1a] bg-black overflow-hidden shadow-2xl shadow-slate-400/20">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 shadow-lg" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-700" />
      <div className="relative z-10 h-full flex flex-col items-center pt-10 px-4 text-center overflow-y-auto">
        <div className="w-16 h-16 bg-white/15 backdrop-blur-xl rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl border border-white/20 mb-3 flex-shrink-0">
          {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" /> : (user?.full_name?.charAt(0).toUpperCase() || '?')}
        </div>
        <h3 className="font-bold text-lg text-white drop-shadow-md">{user?.full_name || 'Nama Kamu'}</h3>
        <p className="text-[10px] text-white/70 mb-4">@{user?.username || 'username'}</p>

        <div className="w-full bg-white rounded-2xl p-3 text-left shadow-xl">
          <p className="text-xs font-bold text-slate-700 mb-2">Produk Unggulan</p>
          <div className="space-y-2">
            {top.length > 0 ? top.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-300">
                  {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <Package size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-700 truncate">{p.title}</p>
                  <p className="text-[10px] text-slate-400">{p.price}</p>
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-slate-400">Belum ada produk ditambahkan.</p>
            )}
          </div>
          <button className="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-semibold">Lihat Semua Produk</button>
        </div>

        <div className="mt-auto pb-6 pt-4 text-[9px] text-white/50 font-semibold tracking-wider">Powered by Oneklik.id</div>
      </div>
    </div>
  );
};

/* =========================================================================
   SHARE DROPDOWN
   ========================================================================= */

const ShareDropdown = ({ url }: { url: string }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareLinks = [
    { name: 'WhatsApp', icon: <MessageCircle size={16} />, href: `https://wa.me/?text=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: <Facebook size={16} />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter/X', icon: <Twitter size={16} />, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}` },
    { name: 'LinkedIn', icon: <Linkedin size={16} />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: 'Telegram', icon: <Send size={16} />, href: `https://t.me/share/url?url=${encodeURIComponent(url)}` },
  ];
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link disalin!');
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">
        <Share2 size={16} /> Bagikan
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-2 space-y-1">
          {shareLinks.map((item, idx) => (
            <a key={idx} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>
              {item.icon} <span>{item.name}</span>
            </a>
          ))}
          <button onClick={handleCopy} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left">
            <Copy size={16} /> <span>{copied ? 'Disalin!' : 'Copy Link'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   NOTIFICATION MODAL
   ========================================================================= */

const NotificationModal = ({ isOpen, onClose, notifications, loading, tab, setTab }: any) => {
  if (!isOpen) return null;
  const filtered = notifications.filter((n: any) => (tab === 'All' ? true : n.type.toLowerCase() === tab.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
        <h2 className="text-lg font-bold text-center text-slate-800 mb-6">Notifikasi</h2>
        <div className="flex justify-center gap-2 mb-6">
          {['All', 'Updates', 'Opportunities', 'Insights'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center py-4 min-h-[200px]">
          {loading ? <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /> : filtered.length > 0 ? (
            <div className="w-full space-y-3">
              {filtered.map((notif: any) => (
                <div key={notif.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                  {notif.message && <p className="text-xs text-slate-500">{notif.message}</p>}
                  <span className="text-[10px] text-slate-400 mt-1 block">{new Date(notif.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Bell size={48} className="text-slate-200 mb-3" />
              <p className="font-medium text-slate-600">Belum ada notifikasi</p>
              <p className="text-xs text-slate-400">Pesan, fitur baru, dan insight akan muncul di sini.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default function BioPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'links' | 'design' | 'shop' | 'analytics'>('links');
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifTab, setNotifTab] = useState('All');

  const [products, setProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', link: '', image: null as File | null });
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRangeDays, setAnalyticsRangeDays] = useState<7 | 30>(7);

  const [uploadingBg, setUploadingBg] = useState(false);

  // --- STATE BARU UNTUK SHOP STATS & ORDERS ---
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [shopStats, setShopStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const [designSubTab, setDesignSubTab] = useState<'tampilan' | 'tema' | 'warna' | 'tipografi' | 'tombol' | 'lanjutan'>('tampilan');
  const [templateCategory, setTemplateCategory] = useState('Semua Kategori');
  const [templateShowCount, setTemplateShowCount] = useState(8);
  const [linkSearch, setLinkSearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');
  const [shopSort, setShopSort] = useState<'terbaru' | 'harga' | 'nama'>('terbaru');
  const [shopStatusTab, setShopStatusTab] = useState<'semua' | 'aktif' | 'habis' | 'arsip'>('semua');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  const supabase = createClientComponentClient();
  const router = useRouter();

  // --- FETCH DATA USER & LINKS ---
  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          let { data: userData, error } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
          if (error) { console.error('Error fetch user:', error); toast.error('Gagal memuat data user'); setLoading(false); return; }
          if (!userData) {
            const fallbackUsername = `user-${session.user.id.slice(0, 8)}`;
            const { data: newUser, error: insertError } = await supabase.from('users').insert({ id: session.user.id, full_name: '', username: fallbackUsername, selected_template: '1' }).select().maybeSingle();
            if (insertError) {
              const { data: retryUser } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
              if (retryUser) userData = retryUser;
              else { toast.error('Gagal membuat profil baru'); setLoading(false); return; }
            } else userData = newUser;
          }
          if (userData) {
            if (!userData.selected_template) userData.selected_template = '1';
            if (!userData.design_settings) userData.design_settings = {};
            setUser(userData);
          }
          const { data: linksData } = await supabase.from('links').select('*').eq('user_id', session.user.id).order('position');
          setLinks(linksData || []);
        }
      } catch (err) { console.error(err); toast.error('Terjadi kesalahan tak terduga'); } finally { setLoading(false); }
    };
    getData();
  }, [supabase]);

  // --- FETCH NOTIFICATIONS ---
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setNotifLoading(true);
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (error) console.error('Error fetching notifications:', error);
    else setNotifications(data || []);
    setNotifLoading(false);
  };

  // --- FETCH SHOP PRODUCTS ---
  const fetchProducts = async () => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase.from('shop_products').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  // --- FETCH ANALYTICS ---
  const fetchAnalytics = async () => {
    if (!session?.user?.id) return;
    setAnalyticsLoading(true);
    const { data, error } = await supabase.from('analytics_events').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    if (error) console.error('Error fetching analytics:', error);
    else setAnalyticsData(data || []);
    setAnalyticsLoading(false);
  };

  // --- FETCH ORDERS (BARU) ---
  const fetchOrders = async () => {
    if (!session?.user?.id) return;
    setOrdersLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', session.user.id)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });
      if (ordersError) throw ordersError;
      setOrders(ordersData || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // --- FETCH SHOP STATS (BARU) ---
  const fetchShopStats = async () => {
    if (!session?.user?.id) return;
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', session.user.id)
        .in('status', ['paid', 'delivered']);
      
      const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const totalOrders = (ordersData || []).length;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', session.user.id);
      
      let averageRating = 0;
      let totalReviews = 0;
      if (!reviewsError && reviewsData) {
        totalReviews = reviewsData.length;
        if (totalReviews > 0) {
          averageRating = reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews;
        }
      }

      setShopStats({
        totalRevenue,
        totalOrders,
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
      });
    } catch (err: any) {
      console.error('Error fetching shop stats:', err);
    }
  };

  // --- INISIALISASI DATA DENGAN EFEK ---
  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts();
      fetchAnalytics();
      fetchOrders();
      fetchShopStats();
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'shop') {
      fetchProducts();
      fetchOrders();
      fetchShopStats();
    }
  }, [activeTab]);

  /* ----------------------------- DERIVED DATA ----------------------------- */
  const totalViews = useMemo(() => analyticsData.filter((e) => e.event_type === 'profile_view').length, [analyticsData]);
  const totalClicks = useMemo(() => analyticsData.filter((e) => e.event_type === 'link_click').length, [analyticsData]);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
  const dailySeries = useMemo(() => computeDailySeries(analyticsData, analyticsRangeDays), [analyticsData, analyticsRangeDays]);

  const clicksByLink = useMemo(() => {
    const map: Record<string, number> = {};
    analyticsData.forEach((e) => { if (e.event_type === 'link_click' && e.link_id) map[e.link_id] = (map[e.link_id] || 0) + 1; });
    return map;
  }, [analyticsData]);

  const topLinks = useMemo(() => [...links].sort((a, b) => (clicksByLink[b.id] || 0) - (clicksByLink[a.id] || 0)), [links, clicksByLink]);

  const filteredLinks = useMemo(() => {
    if (!linkSearch.trim()) return links;
    const q = linkSearch.toLowerCase();
    return links.filter((l) => l.title?.toLowerCase().includes(q) || l.url?.toLowerCase().includes(q));
  }, [links, linkSearch]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (shopSearch.trim()) {
      const q = shopSearch.toLowerCase();
      list = list.filter((p) => p.title?.toLowerCase().includes(q));
    }
    if (shopSort === 'harga') list.sort((a, b) => parseFloat((a.price || '0').replace(/[^0-9.]/g, '')) - parseFloat((b.price || '0').replace(/[^0-9.]/g, '')));
    else if (shopSort === 'nama') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    return list;
  }, [products, shopSearch, shopSort]);

  const templateCategories = useMemo(() => {
    const set = new Set<string>(['Semua Kategori']);
    (templates || []).forEach((t: any) => t?.category && set.add(t.category));
    return Array.from(set);
  }, []);

  const filteredTemplates = useMemo(() => {
    if (templateCategory === 'Semua Kategori') return templates || [];
    return (templates || []).filter((t: any) => t.category === templateCategory);
  }, [templateCategory]);

  const quickThemeColors = ['#3b82f6', '#22c55e', '#f97316', '#ec4899', '#111827'];

  /* ------------------------------- HANDLERS ------------------------------- */
  const handleSaveProfile = async () => {
    if (!session?.user?.id || !user?.username) { toast.error('Username wajib diisi!'); return; }
    setSaving(true);
    try {
      const { data: existingUser } = await supabase.from('users').select('id').eq('username', user.username).neq('id', session.user.id).maybeSingle();
      if (existingUser) { toast.error('Username sudah digunakan!'); setSaving(false); return; }
      const { data: updatedRows, error } = await supabase.from('users').update({
        username: user.username, full_name: user.full_name, bio: user.bio || '', selected_template: user.selected_template,
        theme_bg: user.theme_bg, theme_primary: user.theme_primary, theme_secondary: user.theme_secondary,
        shop_link: user.shop_link || null, design_settings: user.design_settings || {}, avatar_url: user.avatar_url || null,
        social_instagram: user.social_instagram || null, social_tiktok: user.social_tiktok || null,
        social_youtube: user.social_youtube || null, social_facebook: user.social_facebook || null,
        social_twitter: user.social_twitter || null, social_linkedin: user.social_linkedin || null,
        social_whatsapp: user.social_whatsapp || null, social_telegram: user.social_telegram || null,
        social_twitch: user.social_twitch || null,
      }).eq('id', session.user.id).select();
      if (error) { toast.error('Gagal menyimpan: ' + error.message); return; }
      if (!updatedRows || updatedRows.length === 0) { toast.error('Data tidak tersimpan. Cek RLS policy UPDATE di Supabase.'); return; }
      setUser(updatedRows[0]);
      toast.success('Profil & Pengaturan berhasil disimpan!');
    } catch (err: any) { console.error(err); toast.error('Terjadi kesalahan tak terduga.'); } finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw new Error(uploadError.message || 'Gagal mengunggah file.');
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      setUser((prev: any) => ({ ...prev, avatar_url: publicUrl }));
      const { error: updateError } = await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', session.user.id);
      if (updateError) throw new Error(updateError.message || 'Gagal menyimpan URL avatar ke database.');
      toast.success('Foto profil berhasil diunggah!');
    } catch (error: any) { toast.error('Gagal mengunggah foto: ' + error.message); } finally { setUploadingAvatar(false); setIsAvatarMenuOpen(false); }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;
    setUploadingBg(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bg-${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw new Error(uploadError.message || 'Gagal mengunggah background.');
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      setUser((prev: any) => ({ ...prev, design_settings: { ...(prev.design_settings || {}), bg_type: 'upload', bg_custom_url: publicUrl } }));
      toast.success('Background berhasil diunggah!');
    } catch (error: any) { toast.error('Gagal upload background: ' + error.message); } finally { setUploadingBg(false); }
  };

  const handleRemoveAvatar = async () => {
    if (!session?.user?.id) return;
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) return;
    try {
      const { error } = await supabase.from('users').update({ avatar_url: null }).eq('id', session.user.id);
      if (error) throw new Error('Gagal menghapus foto: ' + error.message);
      setUser((prev: any) => ({ ...prev, avatar_url: null }));
      toast.success('Foto profil berhasil dihapus!');
    } catch (err: any) { toast.error(err.message); } finally { setIsAvatarMenuOpen(false); }
  };

  const handleAddLink = async () => {
    if (!newLinkTitle || !newLinkUrl) { toast.error('Judul dan URL wajib diisi!'); return; }
    const { data: inserted, error } = await supabase.from('links').insert({ user_id: session.user.id, title: newLinkTitle, url: newLinkUrl, position: links.length }).select().maybeSingle();
    if (error) { toast.error('Gagal menambah link: ' + error.message); return; }
    if (!inserted) { toast.error('Link tidak tersimpan. Cek RLS INSERT.'); return; }
    setLinks([...links, inserted]);
    setNewLinkTitle(''); setNewLinkUrl(''); setShowAddLink(false);
    toast.success('Link berhasil ditambahkan!');
  };

  const handleDeleteLink = async (id: number) => {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) { setLinks(links.filter((l) => l.id !== id)); toast.success('Link berhasil dihapus!'); } else toast.error('Gagal menghapus link: ' + error.message);
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/${user?.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    toast.success('Link URL berhasil disalin!');
  };

  const handleLogout = async () => { await supabase.auth.signOut(); toast('Logout berhasil!'); setTimeout(() => router.push('/'), 1000); };
  const handleLogin = async () => { await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/upgrade?next=${encodeURIComponent('/bio')}` } }); };

  const updateDesign = (key: string, value: any) => {
    setUser((prev: any) => ({ ...prev, design_settings: { ...(prev?.design_settings || {}), [key]: value } }));
  };

  const handleEnhance = () => {
    const themes = ['air', 'customize', 'dark', 'light'];
    const headers = ['classic', 'minimal', 'gradient'];
    const wallpapers = ['fill', 'gradient', 'image'];
    const buttons = ['fill', 'outline', 'ghost'];
    const fonts = ['sans', 'serif', 'mono'];
    const newDesign = { theme: themes[Math.floor(Math.random() * themes.length)], header: headers[Math.floor(Math.random() * headers.length)], wallpaper: wallpapers[Math.floor(Math.random() * wallpapers.length)], buttons: buttons[Math.floor(Math.random() * buttons.length)], font: fonts[Math.floor(Math.random() * fonts.length)], stickers: 'decorate', footer: 'default' };
    setUser((prev: any) => ({ ...prev, design_settings: { ...prev.design_settings, ...newDesign } }));
    toast.success('Desain telah disempurnakan!');
  };

  const handleResetDesign = () => {
    setUser((prev: any) => ({ ...prev, theme_primary: '#3b82f6', theme_secondary: '#ffffff', theme_bg: '#f3f4f6', design_settings: {} }));
    toast('Desain dikembalikan ke default. Klik "Simpan Perubahan" untuk menyimpan.');
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.price) { toast.error('Nama dan harga wajib diisi!'); return; }
    setUploadingProduct(true);
    try {
      let imageUrl = null;
      if (newProduct.image) {
        const fileExt = newProduct.image.name.split('.').pop();
        const fileName = `shop-${session.user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, newProduct.image, { upsert: true });
        if (uploadError) throw new Error('Gagal upload gambar');
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from('shop_products').insert({ user_id: session.user.id, title: newProduct.title, price: newProduct.price, description: newProduct.description, product_link: newProduct.link, image_url: imageUrl });
      if (error) throw new Error(error.message);
      toast.success('Produk berhasil ditambahkan!');
      setShowProductModal(false);
      setNewProduct({ title: '', price: '', description: '', link: '', image: null });
      fetchProducts();
    } catch (err: any) { toast.error(err.message); } finally { setUploadingProduct(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    const { error } = await supabase.from('shop_products').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus produk');
    else { toast.success('Produk dihapus'); fetchProducts(); }
  };

  const handleEditProduct = async () => {
    if (!editingProduct?.id) return;
    const { error } = await supabase.from('shop_products').update({
      title: editingProduct.title, price: editingProduct.price, description: editingProduct.description, product_link: editingProduct.product_link,
    }).eq('id', editingProduct.id);
    if (error) { toast.error('Gagal memperbarui produk: ' + error.message); return; }
    toast.success('Produk diperbarui!');
    setEditingProduct(null);
    fetchProducts();
  };

  /* --------------------------------- RENDER -------------------------------- */

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-600 bg-slate-50">Memuat dashboard...</div>;
  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h1 className="text-4xl font-extrabold text-blue-600 mb-4">Oneklik.id</h1>
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Login Diperlukan</h2>
      <button onClick={handleLogin} className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg transition-all">Login dengan Google</button>
    </div>
  );

  const initials = (user?.full_name ? user.full_name.charAt(0) : (session?.user?.email || '?').charAt(0)).toUpperCase();
  const bioUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${user?.username || ''}`;

  const NAV_ITEMS: { key: any; label: string; icon: any }[] = [
    { key: 'links', label: 'Link', icon: <Link2 className="w-4 h-4" /> },
    { key: 'shop', label: 'Shop', icon: <Store className="w-4 h-4" /> },
    { key: 'design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const DesignSubTabs = [
    { key: 'tampilan', label: 'Tampilan' },
    { key: 'tema', label: 'Tema' },
    { key: 'warna', label: 'Warna' },
    { key: 'tipografi', label: 'Tipografi' },
    { key: 'tombol', label: 'Tombol' },
    { key: 'lanjutan', label: 'Lanjutan' },
  ] as const;

  const DevicePicker = () => (
    <div className="flex gap-1 bg-slate-100 rounded-full p-1 mb-4 w-fit">
      <button onClick={() => setPreviewDevice('mobile')} className={cx('px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors', previewDevice === 'mobile' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500')}>
        <Smartphone size={13} /> Mobile
      </button>
      <button onClick={() => setPreviewDevice('desktop')} className={cx('px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors', previewDevice === 'desktop' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500')}>
        <Laptop size={13} /> Desktop
      </button>
    </div>
  );

  const FramedPreview = ({ children }: { children: React.ReactNode }) =>
    previewDevice === 'desktop' ? (
      <div className="bg-slate-800 rounded-t-xl p-3 pb-8 max-w-[300px] mx-auto">
        <div className="flex gap-1 mb-3"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="w-2 h-2 rounded-full bg-yellow-400" /><span className="w-2 h-2 rounded-full bg-green-400" /></div>
        <div className="scale-[0.82] origin-top">{children}</div>
      </div>
    ) : (
      children
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row overflow-hidden">
      <Toaster position="top-center" />

      {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}

      {/* ------------------------------- SIDEBAR ------------------------------- */}
      <aside className={cx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out',
        'lg:relative lg:translate-x-0 lg:w-[260px] lg:flex lg:flex-col lg:h-screen lg:flex-shrink-0',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">Oneklik<span className="text-blue-400">.id</span></Link>
          <div className="flex items-center gap-3">
            <button className="relative" onClick={() => { setIsNotificationOpen(true); fetchNotifications(); }}>
              <Bell className="w-5 h-5 text-slate-400 hover:text-slate-700 cursor-pointer" />
              {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />}
            </button>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-600 hover:bg-slate-50 p-1 rounded-lg transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"><span>MENU</span></div>
            <Link href="/dashboard"><div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:bg-slate-50 cursor-pointer"><LayoutDashboard className="w-4 h-4" /> Dashboard</div></Link>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                className={cx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left', activeTab === item.key ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50')}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1"><Crown size={14} className="text-amber-500" /> Upgrade ke PRO</p>
            <p className="text-[11px] text-slate-500 mb-2.5">Akses semua fitur premium dan tingkatkan pengalamanmu.</p>
            <Link href="/upgrade"><button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors">Upgrade Sekarang</button></Link>
          </div>
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{initials}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 truncate">{user?.full_name || 'Pengguna'}</p>
              <p className="text-[10px] text-slate-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors"><LogOut size={14} /> Keluar</button>
        </div>
      </aside>

      {/* ------------------------------ MAIN CONTENT ------------------------------ */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#F8FAFC] p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"><Menu size={24} /></button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'links' && 'Link Management'}
                    {activeTab === 'design' && 'Design Studio'}
                    {activeTab === 'shop' && 'Shop Management'}
                    {activeTab === 'analytics' && 'Analytics'}
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Free</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeTab === 'links' && 'Kelola semua link bio dan short link Anda dengan mudah.'}
                  {activeTab === 'design' && 'Sesuaikan tampilan bio link Anda agar lebih menarik dan profesional.'}
                  {activeTab === 'shop' && 'Kelola produk digital, pesanan, dan tingkatkan penjualan Anda.'}
                  {activeTab === 'analytics' && 'Pantau performa link Anda secara real-time.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {activeTab === 'links' && (
                <button onClick={() => setShowAddLink((v) => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-200 transition-all"><Plus size={16} /> Buat Link Baru</button>
              )}
              {activeTab === 'shop' && (
                <>
                  <button onClick={() => setShowOrderModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all"><ClipboardList size={14} /> Kelola Pesanan</button>
                  <button onClick={() => setShowProductModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-200 transition-all"><Plus size={16} /> Tambah Produk</button>
                </>
              )}
              {activeTab === 'analytics' && (
                <>
                  <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
                    <button onClick={() => setAnalyticsRangeDays(7)} className={cx('px-2.5 py-1 rounded-md text-xs font-medium', analyticsRangeDays === 7 ? 'bg-blue-50 text-blue-600' : 'text-slate-500')}>7 Hari</button>
                    <button onClick={() => setAnalyticsRangeDays(30)} className={cx('px-2.5 py-1 rounded-md text-xs font-medium', analyticsRangeDays === 30 ? 'bg-blue-50 text-blue-600' : 'text-slate-500')}>30 Hari</button>
                  </div>
                  <button onClick={() => exportAnalyticsCSV(analyticsData, links)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all"><Download size={14} /> Export Laporan</button>
                </>
              )}
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold shadow-sm transition-all">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>

          {/* --------------------------------- TAB: LINKS --------------------------------- */}
          {activeTab === 'links' && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-xl" />
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative">
                    <button onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)} className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md shadow-blue-200 hover:opacity-90 transition-opacity overflow-hidden focus:outline-none">
                      {user?.avatar_url ? <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : (user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?')}
                    </button>
                    {isAvatarMenuOpen && (
                      <div className="absolute z-[60] top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 space-y-0.5">
                        <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors">
                          <ImageIcon size={18} className="text-slate-500" /> Upload image or GIF
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        </label>
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-400 cursor-not-allowed" onClick={() => toast.error('Fitur ini hanya untuk pengguna Premium.')}>
                          <div className="flex items-center gap-3"><Video size={18} className="text-slate-300" /> Select video</div>
                          <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">Upgrade</span>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-slate-400 cursor-not-allowed" onClick={() => toast.error('Fitur ini hanya untuk pengguna Premium.')}>
                          <div className="flex items-center gap-3"><Sparkles size={18} className="text-slate-300" /> Generate with AI</div>
                          <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded">Upgrade</span>
                        </div>
                        <a href="https://www.canva.com/create/profile-pictures/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[8px] text-white font-bold">C</div> Design with Canva
                        </a>
                        {user?.avatar_url && (
                          <div onClick={handleRemoveAvatar} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 cursor-pointer text-sm text-red-600 transition-colors">
                            <Trash2 size={18} /> Hapus Foto
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                      <input type="text" value={user?.full_name || ''} onChange={(e) => setUser({ ...user, full_name: e.target.value })} className="w-full border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-lg font-bold text-slate-800 transition-all p-1 -ml-1 placeholder:text-slate-300" placeholder="Nama Kamu" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Username</label>
                      <div className="flex items-center gap-1 -ml-1">
                        <span className="text-sm text-slate-400 font-medium select-none">oneklik.my.id/</span>
                        <input type="text" value={user?.username || ''} onChange={(e) => setUser({ ...user, username: e.target.value })} className="flex-1 border-b-2 border-transparent hover:border-blue-300 focus:border-blue-500 bg-transparent outline-none text-base font-semibold text-slate-700 transition-all p-1 placeholder:text-slate-300" placeholder="username" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</label>
                  <textarea value={user?.bio || ''} onChange={(e) => setUser({ ...user, bio: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent resize-none placeholder:text-slate-300 transition-all" rows={2} placeholder="Ceritakan sedikit tentang dirimu..." />
                </div>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shop Link</label>
                  <input type="text" placeholder="https://shop.anda.com" value={user?.shop_link || ''} onChange={(e) => setUser((prev: any) => ({ ...prev, shop_link: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  <p className="text-[10px] text-slate-400 mt-1">Tambahkan link toko Anda (akan muncul sebagai tombol 🛍️ Shop di bio).</p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Link</p>
                  <p className="text-2xl font-bold text-slate-800">{links.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Klik</p>
                  <p className="text-2xl font-bold text-slate-800">{totalClicks}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Pengunjung</p>
                  <p className="text-2xl font-bold text-slate-800">{totalViews}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Rata-rata CTR</p>
                  <p className="text-2xl font-bold text-slate-800">{ctr}%</p>
                </div>
              </div>

              {showAddLink && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input type="text" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Judul (misal: Instagram)" />
                    <input type="text" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAddLink} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">Simpan Tautan</button>
                    <button onClick={() => setShowAddLink(false)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg text-sm transition-colors">Batal</button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={linkSearch} onChange={(e) => setLinkSearch(e.target.value)} placeholder="Cari link..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50"><SlidersHorizontal size={14} /> Filter</button>
                </div>

                {filteredLinks.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    <div className="hidden sm:grid grid-cols-[2fr_0.6fr_0.6fr_0.6fr_0.8fr_0.6fr] gap-2 px-4 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      <span>Link</span><span>Klik</span><span>CTR</span><span>Urutan</span><span>Dibuat</span><span className="text-right">Aksi</span>
                    </div>
                    {filteredLinks.map((link) => {
                      const clicks = clicksByLink[link.id] || 0;
                      const rowCtr = totalViews > 0 ? ((clicks / totalViews) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={link.id} className="grid grid-cols-2 sm:grid-cols-[2fr_0.6fr_0.6fr_0.6fr_0.8fr_0.6fr] gap-2 items-center px-4 py-3.5 hover:bg-slate-50 transition-colors">
                          <div className="col-span-2 sm:col-span-1 flex flex-col truncate">
                            <span className="font-medium text-slate-700 text-sm truncate">{link.title}</span>
                            <span className="text-[10px] text-slate-400 truncate">{link.url}</span>
                          </div>
                          <span className="text-sm text-slate-600">{clicks}</span>
                          <span className="text-sm text-slate-600">{rowCtr}%</span>
                          <span className="text-sm text-slate-600">#{(link.position ?? 0) + 1}</span>
                          <span className="text-xs text-slate-400">{link.created_at ? new Date(link.created_at).toLocaleDateString('id-ID') : '-'}</span>
                          <div className="flex justify-end">
                            <button onClick={() => handleDeleteLink(link.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-14">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Plus className="w-8 h-8" /></div>
                    <h4 className="text-base font-semibold text-slate-700">{linkSearch ? 'Tidak ada link yang cocok' : 'Tampilkan dirimu ke dunia'}</h4>
                    <p className="text-sm text-slate-400 mt-1">{linkSearch ? 'Coba kata kunci lain.' : 'Tambahkan tautan untuk memulai.'}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* --------------------------------- TAB: DESIGN --------------------------------- */}
          {activeTab === 'design' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4 mb-6">
                {DesignSubTabs.map((t) => (
                  <button key={t.key} onClick={() => setDesignSubTab(t.key)} className={cx('px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors', designSubTab === t.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                    {t.label}
                  </button>
                ))}
              </div>

              {designSubTab === 'tampilan' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-1">Background</p>
                    <p className="text-xs text-slate-400 mb-3">Pilih sumber background untuk halaman bio link Anda.</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'template', label: 'Template', desc: 'Gunakan template siap pakai', icon: <LayoutGrid size={18} /> },
                        { key: 'url', label: 'URL', desc: 'Gunakan gambar dari link URL', icon: <Link2 size={18} /> },
                        { key: 'upload', label: 'Upload', desc: 'Upload gambar dari perangkat Anda', icon: <ImageIcon size={18} /> },
                      ].map((opt) => (
                        <button key={opt.key} onClick={() => updateDesign('bg_type', opt.key)} className={cx('text-left p-3 rounded-xl border transition-colors', (user?.design_settings?.bg_type || 'template') === opt.key ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50')}>
                          <div className="text-slate-500 mb-1.5">{opt.icon}</div>
                          <p className="text-xs font-semibold text-slate-700">{opt.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>

                    {user?.design_settings?.bg_type === 'url' && (
                      <input type="text" placeholder="https://example.com/background.jpg" value={user?.design_settings?.bg_custom_url || ''} onChange={(e) => updateDesign('bg_custom_url', e.target.value)} className="w-full mt-3 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    )}
                    {user?.design_settings?.bg_type === 'upload' && (
                      <div className="relative mt-3">
                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleBackgroundUpload} disabled={uploadingBg} />
                        <div className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-center text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                          {uploadingBg ? 'Mengupload...' : 'Klik untuk upload Background Image'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-800">Pilih Template</p>
                      <div className="relative">
                        <select value={templateCategory} onChange={(e) => { setTemplateCategory(e.target.value); setTemplateShowCount(8); }} className="text-xs border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 appearance-none bg-white text-slate-600">
                          {templateCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">Pilih template yang sesuai dengan gaya Anda.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {filteredTemplates.slice(0, templateShowCount).map((t: any) => {
                        const active = String(user?.selected_template) === String(t.id);
                        const isPremium = t.isPremium || false;
                        const isLocked = isPremium && !user?.is_premium;

                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              if (isLocked) {
                                toast.error('Template Premium hanya bisa diakses oleh pengguna PRO. Upgrade sekarang!');
                                router.push('/upgrade');
                                return;
                              }
                              setUser((prev: any) => ({ ...prev, selected_template: String(t.id) }));
                            }}
                            className={cx(
                              'rounded-xl overflow-hidden border-2 text-left transition-all relative',
                              active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent',
                              isLocked ? 'cursor-not-allowed opacity-60 grayscale' : 'cursor-pointer'
                            )}
                          >
                            {/* --- OVERLAY LOCK UNTUK PREMIUM --- */}
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-xl">
                                <div className="bg-amber-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg text-[10px] font-bold mb-1">
                                  <Crown size={14} /> PRO
                                </div>
                                <span className="text-[9px] text-white/80">Klik untuk Upgrade</span>
                              </div>
                            )}

                            <div
                              className="relative aspect-[3/4] flex flex-col items-center justify-between p-3"
                              style={
                                t.bgImage
                                  ? { backgroundImage: `url(${t.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                  : { backgroundColor: t.colors?.bg || '#e2e8f0' }
                              }
                            >
                              {active && <span className="absolute top-1.5 right-1.5 bg-blue-500 text-white rounded-full p-0.5"><CheckCircle2 size={14} /></span>}
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-xs font-bold border border-white/30 mt-2">B</div>
                              <div className="w-full space-y-1 mb-1">
                                <div className="text-center text-white text-[10px] font-semibold drop-shadow">brodi</div>
                                <div className="rounded-md py-1 text-center text-[8px] font-semibold text-white" style={{ backgroundColor: t.colors?.primary || '#3b82f6' }}>Instagram</div>
                                <div className="rounded-md py-1 text-center text-[8px] font-semibold text-white bg-green-500">Shop</div>
                              </div>
                            </div>
                            <p className="text-[11px] font-medium text-slate-600 px-1 py-1.5 text-center truncate">{t.name || `Template ${t.id}`}</p>
                          </button>
                        );
                      })}
                    </div>
                    {filteredTemplates.length > templateShowCount && (
                      <button onClick={() => setTemplateShowCount((c) => c + 8)} className="w-full mt-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">Muat Lebih Banyak <ChevronDown size={14} /></button>
                    )}
                  </div>
                </div>
              )}

              {designSubTab === 'tema' && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Tema</p>
                  <p className="text-xs text-slate-400 mb-3">Gaya tampilan menyeluruh untuk halaman bio Anda.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['air', 'customize', 'dark', 'light'].map((th) => (
                      <button key={th} onClick={() => updateDesign('theme', th)} className={cx('px-4 py-3 rounded-lg text-sm font-medium capitalize border transition-colors', (user?.design_settings?.theme || 'air') === th ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>{th}</button>
                    ))}
                  </div>
                  <button onClick={handleEnhance} className="mt-5 flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700"><Sparkles size={16} /> Acak & sempurnakan desain</button>
                </div>
              )}

              {designSubTab === 'warna' && (
                <div className="space-y-5">
                  <p className="text-sm font-bold text-slate-800 -mb-2">Warna</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { key: 'theme_primary', label: 'Warna Tombol', fallback: '#3b82f6' },
                      { key: 'theme_secondary', label: 'Warna Teks Tombol', fallback: '#ffffff' },
                      { key: 'theme_bg', label: 'Warna Latar (fallback)', fallback: '#f3f4f6' },
                    ].map((c) => (
                      <div key={c.key} className="flex items-center gap-3 border border-slate-200 rounded-lg p-3">
                        <input type="color" value={user?.[c.key] || c.fallback} onChange={(e) => setUser((prev: any) => ({ ...prev, [c.key]: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{c.label}</p>
                          <p className="text-[10px] text-slate-400 uppercase">{user?.[c.key] || c.fallback}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2">Tema Cepat</p>
                    <div className="flex gap-2">
                      {quickThemeColors.map((c) => (
                        <button key={c} onClick={() => setUser((prev: any) => ({ ...prev, theme_primary: c }))} className="w-8 h-8 rounded-full border-2 border-white shadow ring-1 ring-slate-200" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {designSubTab === 'tipografi' && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Tipografi</p>
                  <p className="text-xs text-slate-400 mb-3">Jenis huruf untuk nama, bio, dan tombol link.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ key: 'sans', label: 'Sans', style: 'sans-serif' }, { key: 'serif', label: 'Serif', style: 'serif' }, { key: 'mono', label: 'Mono', style: 'monospace' }].map((f) => (
                      <button key={f.key} onClick={() => updateDesign('font', f.key)} className={cx('px-4 py-4 rounded-lg border text-center transition-colors', (user?.design_settings?.font || 'sans') === f.key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50')}>
                        <p className="text-lg text-slate-800" style={{ fontFamily: f.style }}>Aa</p>
                        <p className="text-[11px] text-slate-500 mt-1">{f.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {designSubTab === 'tombol' && (
                <div>
                  <p className="text-sm font-bold text-slate-800 mb-1">Gaya Tombol</p>
                  <p className="text-xs text-slate-400 mb-3">Terapkan ke semua tombol link di halaman bio Anda.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ key: 'fill', label: 'Fill' }, { key: 'outline', label: 'Outline' }, { key: 'ghost', label: 'Ghost' }].map((b) => (
                      <button key={b.key} onClick={() => updateDesign('buttons', b.key)} className={cx('px-4 py-4 rounded-lg border transition-colors flex flex-col items-center gap-2', (user?.design_settings?.buttons || 'fill') === b.key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50')}>
                        <span className="w-full py-2 rounded-lg text-xs font-semibold text-center" style={b.key === 'outline' ? { border: `2px solid ${user?.theme_primary || '#3b82f6'}`, color: user?.theme_primary || '#3b82f6' } : b.key === 'ghost' ? { color: user?.theme_primary || '#3b82f6' } : { backgroundColor: user?.theme_primary || '#3b82f6', color: user?.theme_secondary || '#fff' }}>Link</span>
                        <p className="text-[11px] text-slate-500">{b.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {designSubTab === 'lanjutan' && (
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-1">Stiker &amp; Footer</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <button onClick={() => updateDesign('stickers', user?.design_settings?.stickers === 'decorate' ? 'none' : 'decorate')} className={cx('px-4 py-2 rounded-lg text-xs font-semibold border transition-colors', user?.design_settings?.stickers === 'decorate' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500')}>✨ Stiker Dekorasi</button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Sosial Media (Footer Bio)</label>
                    {[
                      { key: 'social_instagram', icon: <Instagram size={16} />, ph: 'Link Instagram (opsional)' },
                      { key: 'social_tiktok', icon: <Music2 size={16} />, ph: 'Link TikTok (opsional)' },
                      { key: 'social_youtube', icon: <Youtube size={16} />, ph: 'Link YouTube (opsional)' },
                      { key: 'social_facebook', icon: <Facebook size={16} />, ph: 'Link Facebook (opsional)' },
                      { key: 'social_twitter', icon: <Twitter size={16} />, ph: 'Link Twitter/X (opsional)' },
                      { key: 'social_linkedin', icon: <Linkedin size={16} />, ph: 'Link LinkedIn (opsional)' },
                      { key: 'social_whatsapp', icon: <MessageCircle size={16} />, ph: 'Link WhatsApp (opsional)' },
                      { key: 'social_telegram', icon: <Send size={16} />, ph: 'Link Telegram (opsional)' },
                      { key: 'social_twitch', icon: <Twitch size={16} />, ph: 'Link Twitch (opsional)' },
                    ].map((s) => (
                      <div key={s.key} className="flex items-center gap-2">
                        <span className="text-slate-400 flex-shrink-0">{s.icon}</span>
                        <input type="text" placeholder={s.ph} value={user?.[s.key] || ''} onChange={(e) => setUser((prev: any) => ({ ...prev, [s.key]: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400">Icon hanya akan muncul di footer bio jika linknya diisi.</p>
                  </div>
                </div>
              )}

              <div className="pt-5 mt-6 border-t border-slate-100 text-xs text-slate-400">*Perubahan akan tersimpan setelah klik Simpan Perubahan.</div>
            </div>
          )}

          {/* --------------------------------- TAB: SHOP --------------------------------- */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              
              {/* --- MODAL KELOLA PESANAN (BARU) --- */}
              {showOrderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[80vh] flex flex-col">
                    <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Daftar Pesanan</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                      {ordersLoading ? (
                        <div className="py-10 text-center text-slate-500">Memuat pesanan...</div>
                      ) : orders.length > 0 ? (
                        orders.map((order) => (
                          <div key={order.id} className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{order.customer_name || 'Pelanggan'}</p>
                                <p className="text-xs text-slate-500">{order.customer_email || '-'}</p>
                              </div>
                              <span className={cx('px-2 py-0.5 rounded-full text-[10px] font-semibold',
                                order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'delivered' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              )}>
                                {order.status}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-slate-400 flex justify-between">
                              <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className="font-semibold text-slate-700">Rp {order.total_amount?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-slate-400">
                          <ClipboardList size={48} className="mx-auto mb-2 text-slate-200" />
                          <p className="font-medium">Belum ada pesanan.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* --- MODAL TAMBAH/EDIT PRODUK --- */}
              {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                    <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tambah Produk Baru</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Nama Produk" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Harga (misal: Rp 50.000)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Link Produk (opsional)" value={newProduct.link} onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <textarea placeholder="Deskripsi (opsional)" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('product-image-input')?.click()}>
                        <input id="product-image-input" type="file" accept="image/*" className="hidden" onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files?.[0] || null })} />
                        {newProduct.image ? (<div className="flex items-center justify-center gap-2 text-blue-600"><Video size={16} /> <span className="text-sm">{newProduct.image.name}</span></div>) : (<div className="text-slate-400 text-sm">Upload Gambar Produk</div>)}
                      </div>
                      <button onClick={handleAddProduct} disabled={uploadingProduct} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex justify-center gap-2">{uploadingProduct ? 'Menyimpan...' : 'Simpan Produk'}</button>
                    </div>
                  </div>
                </div>
              )}

              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                    <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><X size={24} /></button>
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Edit Produk</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Nama Produk" value={editingProduct.title || ''} onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Harga" value={editingProduct.price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <input type="text" placeholder="Link Produk" value={editingProduct.product_link || ''} onChange={(e) => setEditingProduct({ ...editingProduct, product_link: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                      <textarea placeholder="Deskripsi" value={editingProduct.description || ''} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
                      <button onClick={handleEditProduct} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Simpan Perubahan</button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- STATISTIK TOKO (TERHUBUNG KE SUPABASE) --- */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Produk</p>
                  <p className="text-2xl font-bold text-slate-800">{products.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Penjualan</p>
                  <p className="text-2xl font-bold text-green-600">Rp {shopStats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Pesanan</p>
                  <p className="text-2xl font-bold text-slate-800">{shopStats.totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Rating Toko</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-yellow-500">{shopStats.averageRating}</p>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={14} fill={star <= Math.round(shopStats.averageRating) ? '#facc15' : 'none'} stroke={star <= Math.round(shopStats.averageRating) ? '#facc15' : '#d1d5db'} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 ml-1">({shopStats.totalReviews} ulasan)</span>
                  </div>
                </div>
              </div>

              {/* --- MANAJEMEN PRODUK --- */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 space-y-3">
                  <div className="flex gap-2 overflow-x-auto">
                    {[{ k: 'semua', l: 'Semua Produk' }, { k: 'aktif', l: 'Produk Aktif' }, { k: 'habis', l: 'Stok Habis' }, { k: 'arsip', l: 'Arsip' }].map((t) => (
                      <button key={t.k} onClick={() => setShopStatusTab(t.k as any)} className={cx('px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors', shopStatusTab === t.k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500')}>{t.l}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={shopSearch} onChange={(e) => setShopSearch(e.target.value)} placeholder="Cari produk..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <select value={shopSort} onChange={(e) => setShopSort(e.target.value as any)} className="text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-600">
                      <option value="terbaru">Terbaru</option>
                      <option value="harga">Harga</option>
                      <option value="nama">Nama</option>
                    </select>
                  </div>
                  {shopStatusTab !== 'semua' && (
                    <p className="text-[10px] text-amber-600 flex items-center gap-1"><Info size={12} /> Filter status produk perlu kolom "status" di tabel shop_products — untuk saat ini semua produk ditampilkan.</p>
                  )}
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredProducts.map((prod) => (
                      <div key={prod.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-300">
                          {prod.image_url ? <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" /> : <Package size={20} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{prod.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{prod.description || '—'}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 flex-shrink-0 w-24 text-right">{prod.price}</span>
                        <span className="hidden sm:inline-flex text-[10px] font-semibold px-2 py-1 rounded-full bg-green-50 text-green-600 flex-shrink-0">Aktif</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => setEditingProduct(prod)} className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-full transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="col-span-2 py-14 text-center text-slate-400 text-sm">
                    <ShoppingBag size={36} className="mx-auto mb-2 text-slate-200" />
                    Belum ada produk. Klik "+ Tambah Produk" untuk memulai.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------- TAB: ANALYTICS ------------------------------- */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Total Klik', value: totalClicks, color: 'text-blue-600' },
                  { label: 'Total Pengunjung', value: totalViews, color: 'text-slate-800' },
                  { label: 'Rata-rata CTR', value: `${ctr}%`, color: 'text-green-600' },
                  { label: 'Link Aktif', value: links.length, color: 'text-slate-800' },
                  { label: 'Konversi', value: `${ctr}%`, color: 'text-pink-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={cx('text-2xl font-bold', s.color)}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-800">Performa Klik</h4>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-600 inline-block" /> Klik</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-blue-300 inline-block" /> Pengunjung</span>
                    </div>
                  </div>
                  {analyticsLoading ? <div className="py-16 text-center text-slate-400 text-sm">Memuat data...</div> : <MiniLineChart series={dailySeries} />}
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Sumber Trafik</h4>
                  <p className="text-[10px] text-slate-400 mb-3 flex items-center gap-1"><Info size={11} /> Perlu kolom referrer untuk mengaktifkan.</p>
                  <DonutChart segments={[{ label: 'Data belum tersedia', value: 0, color: '#e2e8f0' }]} centerLabel="Total" centerValue={0} />
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.4fr_1fr_1fr] gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Link Teratas</h4>
                  <div className="space-y-2">
                    {topLinks.slice(0, 5).map((l, i) => (
                      <div key={l.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span className="truncate text-slate-700">{l.title}</span>
                        </div>
                        <span className="text-slate-400 text-xs flex-shrink-0">{clicksByLink[l.id] || 0} klik</span>
                      </div>
                    ))}
                    {topLinks.length === 0 && <p className="text-xs text-slate-400">Belum ada link.</p>}
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5"><Monitor size={14} /> Performa Berdasarkan Device</h4>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Info size={11} /> Perlu kolom device di analytics_events.</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5"><MapPin size={14} /> Lokasi Teratas</h4>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Info size={11} /> Perlu kolom lokasi/IP di analytics_events.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* -------------------------- RIGHT PREVIEW PANEL -------------------------- */}
      <aside className="flex flex-col w-full lg:w-[380px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200 h-auto lg:h-screen p-6 flex-shrink-0 overflow-y-auto">
        {activeTab === 'links' && (
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm font-bold text-slate-800 mb-1">Preview Link</p>
            <p className="text-xs text-slate-400 mb-4">Lihat tampilan link Anda di berbagai device.</p>
            <DevicePicker />
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between mb-6 gap-3 shadow-sm">
              <span className="text-xs text-slate-600 font-medium truncate px-1">{user?.username ? `oneklik.my.id/${user.username}` : 'oneklik.my.id/username'}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={handleCopyUrl} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium">{copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}{copied ? 'Disalin' : 'Salin'}</button>
                <ShareDropdown url={bioUrl} />
              </div>
            </div>
            <FramedPreview><BioPreview user={user} links={links} /></FramedPreview>
            <div className="mt-4 text-center text-[10px] text-slate-400">*Mockup menyesuaikan Template &amp; Desain yang dipilih.</div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-bold text-slate-800 mb-1">Preview Tampilan</p>
            <p className="text-xs text-slate-400 mb-4">Lihat bagaimana bio link Anda akan terlihat.</p>
            <DevicePicker />
            <FramedPreview><BioPreview user={user} links={links} /></FramedPreview>

            <div className="mt-6 bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-700 mb-1">Tema Cepat</p>
              <p className="text-[10px] text-slate-400 mb-3">Terapkan tema warna secara instan.</p>
              <div className="flex gap-2">
                {quickThemeColors.map((c) => (
                  <button key={c} onClick={() => setUser((prev: any) => ({ ...prev, theme_primary: c }))} className={cx('w-9 h-9 rounded-full border-2 shadow', user?.theme_primary === c ? 'border-blue-500' : 'border-white')} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="mt-4 bg-white rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-700 mb-1">Reset</p>
              <p className="text-[10px] text-slate-400 mb-3">Kembalikan semua pengaturan ke default.</p>
              <button onClick={handleResetDesign} className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"><RefreshCw size={13} /> Reset ke Default</button>
            </div>
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-bold text-slate-800 mb-1">Preview Toko Anda</p>
            <p className="text-xs text-slate-400 mb-4">Begini tampilan produk Anda di halaman bio.</p>

            <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 mb-4">
              <p className="text-xs font-bold text-slate-700 mb-2">Produk Terbaru</p>
              <div className="space-y-2">
                {products.slice(0, 3).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">{i + 1}</span>
                    <span className="truncate flex-1 text-slate-700">{p.title}</span>
                    <span className="text-slate-400 flex-shrink-0">{p.price}</span>
                  </div>
                ))}
                {products.length === 0 && <p className="text-[11px] text-slate-400">Belum ada produk.</p>}
              </div>
            </div>

            <ShopPreview user={user} products={products} />
            <p className="mt-3 text-center text-[10px] text-slate-400">Produk tampil lewat tombol 🛍️ Shop di halaman bio Anda saat ini — bukan halaman toko terpisah.</p>

            <div className="mt-5 bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-700 mb-2">Bagikan Toko</p>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 mb-3">
                <span className="text-[11px] text-slate-500 truncate flex-1">{bioUrl}</span>
                <button onClick={handleCopyUrl}>{copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} className="text-slate-400" />}</button>
              </div>
              <ShareDropdown url={bioUrl} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 flex flex-col">
            <p className="text-sm font-bold text-slate-800 mb-1">Preview Link</p>
            <p className="text-xs text-slate-400 mb-4">Lihat tampilan link Anda di berbagai device.</p>
            <FramedPreview><BioPreview user={user} links={links} /></FramedPreview>

            <div className="mt-6 bg-slate-50 rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-700 mb-3">Waktu Aktif Pengunjung</p>
              <ActivityHeatmap events={analyticsData} />
            </div>

            <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4 flex gap-2.5">
              <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700">Posting link Anda saat jam kunjungan tertinggi (lihat heatmap di atas) untuk mendapatkan klik lebih banyak!</p>
            </div>
          </div>
        )}
      </aside>

      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={notifications} loading={notifLoading} tab={notifTab} setTab={setNotifTab} />
    </div>
  );
}