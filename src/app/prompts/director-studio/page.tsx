'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Clapperboard, 
  RefreshCw
} from 'lucide-react';

export default function DirectorStudioPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E] text-slate-100 flex flex-col w-screen h-screen overflow-hidden">
      {/* Studio Header Bar */}
      <header className="h-14 border-b border-white/10 bg-[#0C0F17]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <Link 
            href="/prompts"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">กลับสู่</span>
            <span>Prompts Hub</span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <Clapperboard className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  Director Prompt Studio
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    PRO 8-STEP
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block leading-tight">
                ห้องปฏิบัติการสร้าง Master Prompt วิดีโอระดับผู้กำกับ · Google Flow · Meta AI · MiniMax H3 · DreamRadar
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            title="รีโหลดหน้า Studio"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">รีโหลด</span>
          </button>

          <a
            href="/director-studio/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 hover:border-amber-500/50 transition-all shadow-sm shadow-amber-500/10 cursor-pointer"
            title="เปิดในแท็บแยกอิสระ"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>เปิดแท็บใหม่</span>
          </a>
        </div>
      </header>

      {/* Main Studio Frame - Full viewport width and height */}
      <div className="flex-1 relative w-full h-[calc(100vh-56px)] bg-[#07090E]">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090E] z-10">
            <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-200">กำลังเตรียมห้องปฏิบัติการ Director Prompt Studio...</p>
            <p className="text-xs text-slate-500 mt-1">โหลด 100+ แนวเรื่อง · 120+ สไตล์ภาพ · MiniMax H3 Voiceover Tag Engine</p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src="/director-studio/index.html"
          className="w-full h-full border-0 block"
          title="Director Prompt Studio"
          onLoad={() => setIsLoaded(true)}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
