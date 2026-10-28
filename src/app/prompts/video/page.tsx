'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Video, 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Play, 
  X, 
  Film, 
  ArrowLeft, 
  Layers, 
  SlidersHorizontal,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Info,
  Flame,
  Volume2,
  Hammer,
  Home,
  Tv,
  Building,
  UserCheck,
  Clapperboard,
  Palette,
  Terminal,
  Maximize2,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { videoStyles100, filterVideoStyles, studioVideoPrompts, filterStudioVideoPrompts } from '@/lib/video-styles-service';
import { 
  VideoStyleItem, 
  VIDEO_STYLES_CATEGORIES, 
  getVideoStyleImageUrl, 
  getVideoStyleVideoUrl,
  StudioVideoItem,
  StudioVideoPromptItem,
  STUDIO_VIDEO_CATEGORIES 
} from '@/lib/video-styles-types';

export default function PromptVideoPage() {
  // Main view mode: 'studios' (9 Production Studios) or 'styles' (100 Visual Styles)
  const [activeTab, setActiveTab] = useState<'studios' | 'styles'>('studios');

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Categories
  const [selectedStudioCat, setSelectedStudioCat] = useState<string | null>(null);
  const [selectedStyleCat, setSelectedStyleCat] = useState<string | null>(null);

  // Modals
  const [activeStudio, setActiveStudio] = useState<StudioVideoItem | null>(null);
  const [activeStyle, setActiveStyle] = useState<VideoStyleItem | null>(null);

  // Copy feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category counts for Studios
  const studioCatCounts = useMemo(() => {
    const counts: Record<string, number> = { all: studioVideoPrompts.length };
    STUDIO_VIDEO_CATEGORIES.forEach(cat => {
      counts[cat] = studioVideoPrompts.filter(s => s.category === cat).length;
    });
    return counts;
  }, []);

  // Category counts for 100 Styles
  const styleCatCounts = useMemo(() => {
    const counts: Record<string, number> = { all: videoStyles100.length };
    VIDEO_STYLES_CATEGORIES.forEach(cat => {
      counts[cat] = videoStyles100.filter(s => s.cat.split('/').map(c => c.trim()).includes(cat) || s.cat === cat).length;
    });
    return counts;
  }, []);

  // Filtered lists
  const filteredStudios = useMemo(() => {
    return filterStudioVideoPrompts(studioVideoPrompts, selectedStudioCat, searchQuery);
  }, [selectedStudioCat, searchQuery]);

  const filteredStyles = useMemo(() => {
    return filterVideoStyles(videoStyles100, selectedStyleCat, searchQuery);
  }, [selectedStyleCat, searchQuery]);

  // Copy handler
  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setToastMessage(`คัดลอก Prompt ${label} เรียบร้อยแล้ว!`);

    setTimeout(() => {
      setCopiedKey(null);
      setToastMessage(null);
    }, 2800);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeStudio) setActiveStudio(null);
        if (activeStyle) setActiveStyle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStudio, activeStyle]);

  return (
    <div className="min-h-screen bg-[#080f1a] text-slate-100 flex flex-col selection:bg-pink-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-pink-500/40 text-pink-300 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="bg-[#0b1320]/90 border-b border-white/10 px-4 sm:px-6 py-3 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/prompts"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prompt Hub</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/30">
              <Video className="w-3.5 h-3.5" />
              <span>Prompt Video Studio & 100 Styles</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <Link
              href="/prompts/drama"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg border border-amber-400/20 transition-all"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Prompt Video ละคร (AI Drama)</span>
            </Link>
            <Link
              href="/prompts/website-design"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-400/10 hover:bg-indigo-400/20 px-3 py-1.5 rounded-lg border border-indigo-400/20 transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Website Design</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/#classes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 hover:from-pink-400 hover:to-rose-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เวิร์กช็อป AI Video Creator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(244,114,182,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-pink-500/30 text-pink-400 text-xs font-semibold mb-4 shadow-lg shadow-pink-500/10">
            <div className="w-5 h-5 rounded-md overflow-hidden bg-pink-500/20 flex items-center justify-center shrink-0">
              <img src="/assets/logo.png" alt="Kevin AI Logo" className="w-full h-full object-cover" />
            </div>
            <span>Kevin AI Video Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-slate-300 font-normal">AI Video Production & Prompt Suite</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            คลัง Prompt วิดีโอ <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">9 สตูดิโอโปรดักชัน</span> & 100 สไตล์ภาพยนตร์
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 font-normal">
            รวมสูตร Master Prompt วิดีโอสำเร็จรูปสำหรับงานเฉพาะทาง ทั้งงานรีโนเวทบ้าน, ประกอบเฟอร์นิเจอร์ ASMR, รีวิวสินค้า UGC พูดไทย, พรีเซนต์อสังหาฯ และคลิปไวรัลสายฮา 
            พร้อมใช้งานกับ <span className="text-white font-semibold">Veo 3, MiniMax H3, Kling, Runway Gen-3 และ Luma Dream Machine</span>
          </p>

          {/* Key Metric Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs mb-8">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-pink-400" />
              <span><strong>9</strong> สตูดิโอโปรดักชันเฉพาะทาง</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>107+</strong> สูตรฉาก & Presets สำเร็จรูป</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span><strong>100</strong> สไตล์ภาพยนตร์คัดสรร</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>คลิกเดียว <strong>คัดลอก Master Prompt</strong></span>
            </div>
          </div>

          {/* Main Tab Switcher */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl max-w-xl w-full">
            <button
              type="button"
              onClick={() => { setActiveTab('studios'); setSearchQuery(''); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'studios'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>9 สตูดิโอโปรดักชันเฉพาะทาง</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'studios' ? 'bg-white/20 text-white' : 'bg-pink-500/20 text-pink-400'}`}>
                HOT 9
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('styles'); setSearchQuery(''); }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'styles'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>คลัง Prompt 100 สไตล์</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${activeTab === 'styles' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'}`}>
                100
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Sticky Controls & Category Bar */}
        <div className="sticky top-[133px] z-20 pb-4 pt-2 bg-[#080f1a]/95 backdrop-blur-xl border-b border-white/5 space-y-3 mb-6">
          
          {/* Search Bar + Result Counter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'studios' 
                    ? 'ค้นหาสตูดิโอ, หมวดรีโนเวท, UGC, อสังหาฯ, ละครสั้น...'
                    : 'ค้นหาด้วยชื่อสไตล์ เช่น Arcade, Cyberpunk, 3D, Minimal...'
                }
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
              <span>แสดงผล:</span>
              <strong className="text-white font-bold">
                {activeTab === 'studios' ? filteredStudios.length : filteredStyles.length}
              </strong>
              <span>{activeTab === 'studios' ? 'สตูดิโอ' : 'สไตล์'}</span>
            </div>
          </div>

          {/* Category Filter Pills for Studios Mode */}
          {activeTab === 'studios' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedStudioCat(null)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all border ${
                  selectedStudioCat === null
                    ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20 font-bold'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-pink-500/40 hover:text-white'
                }`}
              >
                <span>สตูดิโอทั้งหมด</span>
                <span className={`text-[10px] ml-1.5 px-1.5 py-0.2 rounded-full ${selectedStudioCat === null ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {studioCatCounts.all}
                </span>
              </button>

              {STUDIO_VIDEO_CATEGORIES.map(cat => {
                const count = studioCatCounts[cat] || 0;
                const isSelected = selectedStudioCat === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedStudioCat(isSelected ? null : cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20 font-bold'
                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-pink-500/40 hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Category Filter Pills for 100 Styles Mode */}
          {activeTab === 'styles' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <button
                type="button"
                onClick={() => setSelectedStyleCat(null)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all border ${
                  selectedStyleCat === null
                    ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20 font-bold'
                    : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-pink-500/40 hover:text-white'
                }`}
              >
                <span>ทุกหมวดสไตล์</span>
                <span className={`text-[10px] ml-1.5 px-1.5 py-0.2 rounded-full ${selectedStyleCat === null ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {styleCatCounts.all}
                </span>
              </button>

              {VIDEO_STYLES_CATEGORIES.map(cat => {
                const count = styleCatCounts[cat] || 0;
                const isSelected = selectedStyleCat === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedStyleCat(isSelected ? null : cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20 font-bold'
                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-pink-500/40 hover:text-white'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------------- SECTION 1: 9 PRODUCTION STUDIOS ---------------- */}
        {activeTab === 'studios' && (
          <div>
            {filteredStudios.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">ไม่พบสตูดิโอที่ค้นหา</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  ลองค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อแสดงสตูดิโอทั้งหมด
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedStudioCat(null); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-400 transition-all shadow-md shadow-pink-500/20"
                >
                  แสดงสตูดิโอทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {filteredStudios.map(studio => (
                  <StudioCard
                    key={studio.id}
                    studio={studio}
                    onOpenModal={() => setActiveStudio(studio)}
                    onCopyMaster={() => {
                      if (studio.masterPrompt) {
                        handleCopy(studio.masterPrompt, `${studio.id}-master`, `${studio.name} (Master Prompt)`);
                      }
                    }}
                    isCopiedMaster={copiedKey === `${studio.id}-master`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------------- SECTION 2: 100 VISUAL STYLES ---------------- */}
        {activeTab === 'styles' && (
          <div>
            {filteredStyles.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">ไม่พบสไตล์ที่ค้นหา</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  ลองค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อแสดงสไตล์ทั้งหมด 100 รูปแบบ
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedStyleCat(null); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-400 transition-all shadow-md shadow-pink-500/20"
                >
                  แสดงสไตล์ทั้งหมด
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredStyles.map((style) => (
                  <VideoStyleCard
                    key={style.slug}
                    style={style}
                    onSelect={() => setActiveStyle(style)}
                    onCopyEn={(e) => {
                      e.stopPropagation();
                      handleCopy(style.pen, `${style.slug}-en`, `${style.en} (EN)`);
                    }}
                    onCopyTh={(e) => {
                      e.stopPropagation();
                      handleCopy(style.pth, `${style.slug}-th`, `${style.th} (TH)`);
                    }}
                    isCopiedEn={copiedKey === `${style.slug}-en`}
                    isCopiedTh={copiedKey === `${style.slug}-th`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Studio Detail Modal */}
      {activeStudio && (
        <StudioDetailModal
          studio={activeStudio}
          onClose={() => setActiveStudio(null)}
          onCopy={(text, key, label) => handleCopy(text, key, label)}
          copiedKey={copiedKey}
        />
      )}

      {/* Video & Style Detail Modal */}
      {activeStyle && (
        <VideoStyleModal
          style={activeStyle}
          onClose={() => setActiveStyle(null)}
          onCopy={(text, key, label) => handleCopy(text, key, label)}
          copiedKey={copiedKey}
        />
      )}

      {/* Bottom Educational Callout */}
      <footer className="mt-16 border-t border-white/10 bg-[#09111e]/90 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-pink-500/30 mx-auto bg-pink-500/10">
            <img src="/assets/logo.png" alt="Kevin AI Logo" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-black text-white">
            สร้างผลงานวิดีโอ AI ให้โดดเด่น ด้วยเทคนิคการผสาน Prompt 9 สตูดิโอ และ 100 สไตล์
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            เรียนรู้การนำ Master Prompt ไปเจนด้วย ComfyUI, MiniMax, Veo 3, Kling พร้อมเวิร์กโฟลว์การใส่เสียงพากย์และซับไตเติลแบบไวรัล 
            ในคอร์สเรียนกับ อ. Kevin
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#classes"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-pink-500/25 hover:from-pink-400 hover:to-rose-400 transition-all"
            >
              ดูรอบเรียน & จองคอร์ส
            </Link>
            <Link
              href="/prompts/drama"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-sm font-semibold border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Film className="w-4 h-4" />
              <span>ดู Prompt Video ละคร (AI Drama)</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Card for 9 AI Production Studios
 */
function StudioCard({
  studio,
  onOpenModal,
  onCopyMaster,
  isCopiedMaster
}: {
  studio: StudioVideoItem;
  onOpenModal: () => void;
  onCopyMaster: () => void;
  isCopiedMaster: boolean;
}) {
  return (
    <div className="group rounded-3xl bg-slate-900/80 border border-white/10 hover:border-pink-500/40 transition-all flex flex-col overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-pink-500/10">
      
      {/* Poster Image or Banner Header */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer" onClick={onOpenModal}>
        {studio.poster ? (
          <img
            src={studio.poster}
            alt={studio.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback to stylized gradient if image fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Category Pill Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500 text-white shadow-lg backdrop-blur-md">
            {studio.category}
          </span>
        </div>

        {/* Presets count badge Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{studio.items.length} สูตร/ฉาก</span>
          </span>
        </div>

        {/* Title over poster bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="text-lg font-black text-white group-hover:text-pink-300 transition-colors drop-shadow-md">
            {studio.name}
          </h3>
          <p className="text-xs text-slate-300 line-clamp-1 drop-shadow">
            {studio.subtitle}
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        
        {/* Description & Tags */}
        <div className="space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {studio.desc}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {studio.tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-400 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Master Prompt Quick Copy Box */}
        {studio.masterPrompt && (
          <div className="rounded-2xl bg-slate-950/90 border border-white/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>สูตร Master Prompt</span>
              </span>

              <button
                type="button"
                onClick={onCopyMaster}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  isCopiedMaster 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-white'
                }`}
              >
                {isCopiedMaster ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{isCopiedMaster ? 'คัดลอกแล้ว!' : 'คัดลอก Master Prompt'}</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-300 line-clamp-3 leading-relaxed bg-black/40 p-2 rounded-xl">
              {studio.masterPrompt}
            </div>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenModal}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white hover:text-pink-300 text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2 group-hover:border-pink-500/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>ดูสูตรและฉากทั้งหมด ({studio.items.length} สูตร)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal to display Studio Master Prompts and all specific Presets
 */
function StudioDetailModal({
  studio,
  onClose,
  onCopy,
  copiedKey
}: {
  studio: StudioVideoItem;
  onClose: () => void;
  onCopy: (text: string, key: string, label: string) => void;
  copiedKey: string | null;
}) {
  const [activeItem, setActiveItem] = useState<StudioVideoPromptItem | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click outside */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c1524] border border-white/15 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-500 text-white">
              {studio.category}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                {studio.name}
              </h2>
              <p className="text-xs text-slate-400">{studio.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Master Prompt Section */}
          {studio.masterPrompt && (
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950 border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                    ★
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Master Prompt ประจำสตูดิโอ (สูตรหลัก)</h3>
                    <p className="text-[11px] text-slate-400">แทนที่ตัวแปรในเครื่องหมาย &#123; &#125; ด้วยข้อมูลของคุณ</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onCopy(studio.masterPrompt!, `${studio.id}-modal-master`, `${studio.name} (Master Prompt)`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    copiedKey === `${studio.id}-modal-master`
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-pink-500 text-white hover:bg-pink-400 shadow-pink-500/20'
                  }`}
                >
                  {copiedKey === `${studio.id}-modal-master` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === `${studio.id}-modal-master` ? 'คัดลอกแล้ว!' : 'คัดลอก Master Prompt'}</span>
                </button>
              </div>

              {/* English Prompt */}
              <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-pink-500 selection:text-white">
                {studio.masterPrompt}
              </div>

              {/* Thai explanation */}
              {studio.masterPromptTh && (
                <div className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-pink-300">วิธีใช้งานและข้อแนะนำ: </strong>
                  {studio.masterPromptTh}
                </div>
              )}
            </div>
          )}

          {/* AI Tools Recommended */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>เครื่องมือ AI ที่แนะนำสำหรับสูตรนี้:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {['Veo 3', 'MiniMax H3', 'Kling AI', 'Runway Gen-3', 'Luma Dream Machine', 'ComfyUI'].map(tool => (
                <span key={tool} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-white/10 font-semibold text-[11px]">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Presets List Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>รายการสูตรฉาก & Presets ({studio.items.length} สูตร)</span>
              </h3>
              <span className="text-[11px] text-slate-400">คลิกที่การ์ดเพื่อดูรายละเอียดหรือคัดลอกทันที</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {studio.items.map((item, idx) => {
                const isCopied = copiedKey === `preset-${item.id}`;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 hover:border-pink-500/40 transition-all flex flex-col justify-between gap-2.5 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                          {item.title}
                        </span>
                        {item.label && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 shrink-0 font-medium">
                            {item.label}
                          </span>
                        )}
                      </div>

                      {item.summary && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-2 font-light">
                          {item.summary}
                        </p>
                      )}

                      <div className="p-2 rounded-xl bg-slate-950 font-mono text-[10px] text-slate-300 line-clamp-3 leading-relaxed border border-white/5">
                        {item.prompt}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onCopy(item.prompt, `preset-${item.id}`, item.title)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                          isCopied 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-800 hover:bg-pink-500 text-slate-300 hover:text-white border border-white/10'
                        }`}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'คัดลอกสำเร็จ' : 'คัดลอก Prompt'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>นำ Prompt ไปวางใน AI Video Generator ได้ทันที</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all border border-white/10"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Single Video Style Card (100 Styles)
 */
function VideoStyleCard({
  style,
  onSelect,
  onCopyEn,
  onCopyTh,
  isCopiedEn,
  isCopiedTh
}: {
  style: VideoStyleItem;
  onSelect: () => void;
  onCopyEn: (e: React.MouseEvent) => void;
  onCopyTh: (e: React.MouseEvent) => void;
  isCopiedEn: boolean;
  isCopiedTh: boolean;
}) {
  const imgUrl = getVideoStyleImageUrl(style.slug);

  return (
    <div
      onClick={onSelect}
      className="group rounded-2xl bg-slate-900/80 border border-white/10 hover:border-pink-500/50 transition-all cursor-pointer flex flex-col overflow-hidden shadow-lg hover:shadow-pink-500/10 hover:-translate-y-0.5"
    >
      {/* Thumbnail Aspect Ratio 9:16 vertical preview */}
      <div className="relative aspect-[9/14] w-full bg-slate-950 overflow-hidden">
        <img
          src={imgUrl}
          alt={style.en}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Number Badge Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-black/80 text-pink-400 border border-pink-500/30 backdrop-blur-md font-mono">
            #{style.num}
          </span>
        </div>

        {/* Category Pill Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/70 text-slate-300 border border-white/10 backdrop-blur-md">
            {style.cat}
          </span>
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg shadow-pink-500/40 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 gap-2 border-t border-white/5">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition-colors line-clamp-1">
            {style.en}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {style.th}
          </p>
        </div>

        {/* Suitability preview */}
        <p className="text-[11px] text-slate-400/90 line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-white/5 font-light">
          {style.suit}
        </p>

        {/* Quick action footer */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-white/5 text-[11px]">
          <span className="text-slate-400 group-hover:text-pink-300 transition-colors flex items-center gap-1 font-medium">
            <span>ดูตัวอย่าง & Prompt</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCopyEn}
              title="คัดลอก Prompt ภาษาอังกฤษ"
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                isCopiedEn
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                  : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-pink-500 hover:text-white hover:border-pink-500'
              }`}
            >
              {isCopiedEn ? '✓ EN' : 'EN'}
            </button>
            <button
              type="button"
              onClick={onCopyTh}
              title="คัดลอก Prompt ภาษาไทย"
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                isCopiedTh
                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                  : 'bg-slate-800 border-white/10 text-slate-300 hover:bg-pink-500 hover:text-white hover:border-pink-500'
              }`}
            >
              {isCopiedTh ? '✓ TH' : 'TH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal to display style video animation and full prompts (100 Styles)
 */
function VideoStyleModal({
  style,
  onClose,
  onCopy,
  copiedKey
}: {
  style: VideoStyleItem;
  onClose: () => void;
  onCopy: (text: string, key: string, label: string) => void;
  copiedKey: string | null;
}) {
  const [showVideo, setShowVideo] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const imgUrl = getVideoStyleImageUrl(style.slug);
  const videoUrl = getVideoStyleVideoUrl(style.slug);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#0c1524] border border-white/15 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 font-mono">
              #{style.num}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{style.en}</span>
                <span className="text-xs font-normal text-slate-400">({style.th})</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-white/5 text-[11px]">
                  {style.cat}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-white/10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Media Player Showcase */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center max-h-[380px]">
            {showVideo ? (
              <video
                ref={videoRef}
                src={videoUrl}
                poster={imgUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-h-[380px] w-auto mx-auto object-contain"
                onError={() => setShowVideo(false)}
              />
            ) : (
              <img
                src={imgUrl}
                alt={style.en}
                className="max-h-[380px] w-auto mx-auto object-contain"
              />
            )}
          </div>

          {/* Suitable for */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 leading-relaxed">
            <span className="text-amber-400 font-bold mr-1.5">เหมาะสำหรับ:</span>
            {style.suit}
          </div>

          {/* English Video Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Video Prompt (English Master Prompt)</span>
              </div>
              <button
                type="button"
                onClick={() => onCopy(style.pen, `${style.slug}-en-modal`, `${style.en} (EN)`)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                  copiedKey === `${style.slug}-en-modal`
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-pink-500 text-white hover:bg-pink-400 shadow-pink-500/20'
                }`}
              >
                {copiedKey === `${style.slug}-en-modal` ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>คัดลอกสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก Prompt EN</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/15 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {style.pen}
            </div>
          </div>

          {/* Thai Video Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Video Prompt (คำอธิบายภาษาไทย)</span>
              </div>
              <button
                type="button"
                onClick={() => onCopy(style.pth, `${style.slug}-th-modal`, `${style.th} (TH)`)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                  copiedKey === `${style.slug}-th-modal`
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/20'
                }`}
              >
                {copiedKey === `${style.slug}-th-modal` ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>คัดลอกสำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก Prompt TH</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-white/15 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {style.pth}
            </div>
          </div>

          {/* Subject Replacement Tip */}
          <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-pink-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>คำแนะนำในการแทนค่า [subject]:</span>
            </div>
            <p className="leading-relaxed">
              ในข้อความ Prompt ด้านบน ให้แทนที่คำว่า <code className="bg-slate-900 px-1.5 py-0.5 rounded text-pink-300 font-bold">[subject]</code> ด้วยหัวข้อของคุณ เช่น:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>&ldquo;A coffee cup brewing fresh espresso on a wooden cafe counter&rdquo; (คลิปโปรโมตร้านกาแฟ)</li>
              <li>&ldquo;A young programmer typing code with neon holographic UI&rdquo; (คลิปสายเทค/AI)</li>
              <li>&ldquo;A person calculating monthly savings with glowing piggy bank&rdquo; (คลิปการเงินส่วนบุคคล)</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
