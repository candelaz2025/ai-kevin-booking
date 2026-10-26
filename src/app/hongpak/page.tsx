'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mic, ExternalLink, ArrowLeft, RefreshCw, Maximize2, Sparkles, Volume2 } from 'lucide-react';

export default function HongpakPage() {
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Banner / Toolbar */}
      <div className="bg-[#0b1322]/90 border-b border-white/10 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>หน้าหลัก</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
                <Mic className="w-4 h-4 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                    ห้องน้องพากย์
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300">
                    AI Voice Studio
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  สตูดิโอเสียงพากย์ภาษาไทย พิมพ์บท เลือกนักพากย์ และอัดเสียง AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              title="โหลดสตูดิโอใหม่"
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-xs">รีเฟรช</span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'ย่อหน้าต่าง' : 'ขยายเต็มจอ'}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-xs">{isFullscreen ? 'ย่อจอ' : 'เต็มจอ'}</span>
            </button>

            <a
              href="https://hongpak-voice-studio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 hover:shadow-amber-400/30 flex items-center gap-1.5 transition"
            >
              <span>เปิดในหน้าต่างใหม่</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Studio Container */}
      <div className={`flex-1 p-2 sm:p-4 transition-all ${isFullscreen ? 'fixed inset-0 top-0 z-50 bg-[#070b14] p-0' : 'max-w-7xl mx-auto w-full'}`}>
        {isFullscreen && (
          <div className="bg-[#0b1322] border-b border-white/10 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">ห้องน้องพากย์ — โหมดเต็มจอ</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://hongpak-voice-studio.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1 mr-2"
              >
                <span>เปิดแท็บใหม่</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="px-3 py-1 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20 transition"
              >
                ออกจากโหมดเต็มจอ
              </button>
            </div>
          </div>
        )}

        <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#09111e] ${isFullscreen ? 'h-[calc(100vh-45px)] rounded-none border-none' : 'h-[calc(100vh-145px)] min-h-[720px]'}`}>
          <iframe
            key={iframeKey}
            src="https://hongpak-voice-studio.vercel.app/"
            title="ห้องน้องพากย์ — สตูดิโอเสียงพากย์ภาษาไทย"
            className="w-full h-full border-0"
            allow="microphone; clipboard-read; clipboard-write; autoplay; fullscreen"
          />
        </div>
      </div>
    </div>
  );
}
