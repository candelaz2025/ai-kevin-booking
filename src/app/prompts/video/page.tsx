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
  Volume2
} from 'lucide-react';
import { videoStyles100, filterVideoStyles } from '@/lib/video-styles-service';
import { VideoStyleItem, VIDEO_STYLES_CATEGORIES, getVideoStyleImageUrl, getVideoStyleVideoUrl } from '@/lib/video-styles-types';

export default function PromptVideo100StylesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStyle, setActiveStyle] = useState<VideoStyleItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: videoStyles100.length };
    VIDEO_STYLES_CATEGORIES.forEach(cat => {
      counts[cat] = videoStyles100.filter(s => s.cat.split('/').map(c => c.trim()).includes(cat) || s.cat === cat).length;
    });
    return counts;
  }, []);

  // Filtered styles
  const filteredStyles = useMemo(() => {
    return filterVideoStyles(videoStyles100, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

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

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeStyle) {
        setActiveStyle(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStyle]);

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
              <span>Prompt Video 100 สไตล์ (Native Library)</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <Link
              href="/prompts/drama"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-lg border border-amber-400/20 transition-all"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Prompt Video ละคร (AI Drama)</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/#classes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20 hover:from-pink-400 hover:to-rose-400 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เวิร์กช็อป AI Creator</span>
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
            <span className="text-slate-300 font-normal">100 Styles Video Prompts</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            คลัง Prompt วิดีโอ <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">100 สไตล์</span> ระดับภาพยนตร์
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 font-normal">
            วิธีใช้: เลือกสไตล์ที่ต้องการ → แทนที่ <strong className="text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 font-mono">[subject]</strong> ใน prompt 
            ด้วยหัวข้อคอนเทนต์ของคุณ → วางลงใน AI Video Generator เช่น <span className="text-white font-semibold">Veo 3, MiniMax H3, หรือ ComfyUI</span> ได้ทันที
          </p>

          {/* Key Metric Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-pink-400" />
              <span><strong>100</strong> สไตล์คัดสรรพิเศษ</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-amber-400" />
              <span>มีคลิปแอนิเมชันตัวอย่าง <strong>ครบทุกสไตล์</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Prompt 2 ภาษา (<strong>EN / TH</strong>)</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
              <span>คลิกเดียว <strong>คัดลอกพร้อมใช้งาน</strong></span>
            </div>
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
                placeholder="ค้นหาชื่อสไตล์ (อังกฤษ/ไทย), หมายเลข, หรือประเภทเนื้อหา..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 shrink-0 self-start sm:self-auto">
              แสดง <strong className="text-pink-400">{filteredStyles.length}</strong> / 100 สไตล์
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* All Categories */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === null
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-pink-500/40 hover:text-white'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === null ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                {categoryCounts['all']}
              </span>
            </button>

            {/* Individual Categories */}
            {VIDEO_STYLES_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20'
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
        </div>

        {/* Styles Grid */}
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
              onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
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
      </main>

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
            สร้างผลงานวิดีโอ AI ให้โดดเด่น ด้วยเทคนิคการผสาน Prompt 100 สไตล์
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            เรียนรู้การนำ Prompt ไปเจนด้วย ComfyUI, MiniMax, Veo 3 พร้อมเวิร์กโฟลว์การใส่เสียงพากย์และซับไตเติลแบบไวรัล 
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
 * Single Video Style Card
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
  const [imgError, setImgError] = useState(false);
  const imgUrl = getVideoStyleImageUrl(style.slug);

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-pink-500/50 shadow-lg hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 flex flex-col hover:-translate-y-1"
    >
      {/* 16:9 Image Preview Box */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
        {!imgError ? (
          <img
            src={imgUrl}
            alt={style.en}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
            <Video className="w-8 h-8 opacity-40 mb-1" />
            <span className="text-xs font-mono">#{style.num}</span>
          </div>
        )}

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
 * Modal to display style video animation and full prompts
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
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-[#0a111e]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-pink-500/20 text-pink-400 border border-pink-500/30 font-mono">
              #{style.num}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{style.en}</span>
                <span className="text-slate-400 font-normal text-xs sm:text-sm">({style.th})</span>
              </h2>
              <span className="text-xs text-pink-400 font-medium">{style.cat}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Media Player Box */}
          <div className="rounded-2xl overflow-hidden bg-black border border-white/10 relative aspect-video w-full flex items-center justify-center">
            {showVideo ? (
              <video
                ref={videoRef}
                src={videoUrl}
                poster={imgUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={imgUrl}
                alt={style.en}
                className="w-full h-full object-cover"
              />
            )}

            {/* Toggle Video/Poster button */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={() => setShowVideo(prev => !prev)}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-1.5"
              >
                {showVideo ? '🖼️ ดูภาพนิ่ง' : '🎬 เล่นวิดีโอ'}
              </button>
            </div>
          </div>

          {/* Suitable for Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>เหมาะสำหรับคอนเทนต์แนว (Best Suited For)</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-light">
              {style.suit}
            </p>
          </div>

          {/* English Video Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Video Prompt (English Master Prompt)</span>
              </div>
              <button
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
