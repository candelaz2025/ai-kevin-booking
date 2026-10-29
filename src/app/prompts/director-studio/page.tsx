'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Maximize2, 
  Sparkles, 
  Film, 
  Layers, 
  Dices, 
  Clapperboard, 
  CheckCircle2, 
  ShieldCheck,
  RefreshCw,
  Copy,
  ChevronRight
} from 'lucide-react';

export default function DirectorStudioPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <div className="border-b border-white/10 bg-[#0C0F17]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/prompts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่ Prompts</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Clapperboard className="w-4 h-4" />
              </span>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  Director Prompt Studio
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Pro Engine
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden md:block">
                  8-Step Master Prompt &amp; Storyboard Wizard พร้อม Identity Lock สำหรับ AI Video
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/director-studio/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              title="เปิดในแท็บใหม่แบบ Standalone"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เปิดแท็บใหม่</span>
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFullscreen ? 'ย่อหน้าจอ' : 'เต็มจอ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Frame Container */}
      <div className={`flex-1 relative w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-[#07090E]' : 'h-[calc(100vh-61px)]'}`}>
        {isFullscreen && (
          <div className="absolute top-3 right-4 z-50">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              ออกโหมดเต็มจอ (ESC)
            </button>
          </div>
        )}

        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090E] z-10">
            <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-300">กำลังเตรียมห้องปฏิบัติการ Director Prompt Studio...</p>
            <p className="text-xs text-slate-500 mt-1">โหลด 100+ แนวเรื่อง · 120+ สไตล์ภาพ · Identity Lock Engine</p>
          </div>
        )}

        <iframe
          src="/director-studio/index.html"
          className="w-full h-full border-0"
          title="Director Prompt Studio"
          onLoad={() => setIsLoaded(true)}
          allow="clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
