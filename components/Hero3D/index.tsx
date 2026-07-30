'use client';

import Image from 'next/image';

export default function Hero3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1200px]">
      
      {/* --- EFEK BACKGROUND AURORA --- */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-1/4 left-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-gradient-to-tr from-blue-400/50 via-indigo-400/40 to-purple-400/40 rounded-full blur-[60px] md:blur-[140px] md:animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-gradient-to-br from-cyan-300/30 via-blue-400/30 to-indigo-400/30 rounded-full blur-[60px] md:blur-[120px]" />
      </div>

      {/* --- CONTAINER HP & PODIUM (UKURAN MOBILE DIPERBESAR) --- */}
      <div 
        className="relative z-10 w-[140%] sm:w-full max-w-[600px] md:max-w-[900px] lg:max-w-[1200px] aspect-[4/3] mx-auto scale-[1.45] sm:scale-125 md:scale-150 origin-center will-change-transform mt-6 sm:mt-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ORBIT RINGS (Lingkaran cahaya) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div className="w-[140%] h-[140%] rounded-full border-[1px] border-blue-400/20 rotate-12 animate-[spin_30s_linear_infinite] will-change-transform" />
          <div className="absolute w-[160%] h-[160%] rounded-full border-[1px] border-purple-400/10 -rotate-12 animate-[spin_40s_linear_infinite_reverse] will-change-transform" />
        </div>

        {/* GAMBAR UTAMA (HP & PODIUM) - SVG */}
        <div className="absolute inset-0 z-10">
          <Image
            src="/hero-phone-podium.svg"
            alt="Oneklik Phone Podium"
            fill
            className="object-contain drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)] md:drop-shadow-[0_40px_100px_rgba(59,130,246,0.5)]"
            priority
          />
        </div>
      </div>
    </div>
  );
}