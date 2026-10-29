'use client';

import React, { useState, useEffect } from 'react';

export default function DirectorStudioPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] w-screen h-screen overflow-hidden bg-[#07090E]">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090E] z-10 text-slate-200">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p className="text-base font-bold text-white tracking-wide">กำลังเปิด Director Prompt Studio...</p>
          <p className="text-xs text-slate-400 mt-1">ห้องสร้าง Master Prompt วิดีโอ AI · MiniMax H3 · Google Flow · Meta AI · DreamRadar</p>
        </div>
      )}

      <iframe
        src="/director-studio/index.html"
        style={{
          width: '100vw',
          height: '100dvh',
          border: 'none',
          display: 'block'
        }}
        title="Director Prompt Studio"
        onLoad={() => setIsLoaded(true)}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
