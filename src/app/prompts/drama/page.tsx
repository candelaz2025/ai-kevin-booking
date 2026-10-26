'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clapperboard, 
  Film, 
  Play, 
  Pause, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  ArrowLeft, 
  ExternalLink, 
  X, 
  Info, 
  Video, 
  Image as ImageIcon,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { dramaCatalog, getDramaMediaUrl, filterDramaItems } from '@/lib/drama-service';
import { DramaItem, DRAMA_GROUP_NOTES } from '@/lib/drama-types';

export default function DramaPromptsPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'clip' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<DramaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Group count calculation
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = { all: dramaCatalog.items.length };
    dramaCatalog.items.forEach(item => {
      counts[item.group] = (counts[item.group] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered items
  const filteredItems = useMemo(() => {
    return filterDramaItems(dramaCatalog.items, selectedGroup, typeFilter, searchQuery);
  }, [selectedGroup, typeFilter, searchQuery]);

  // Copy Prompt to clipboard
  const handleCopyPrompt = (e: React.MouseEvent, item: DramaItem) => {
    e.stopPropagation();
    const promptText = item.metaPrompt || item.lines?.join('\n') || item.beat || item.label;
    navigator.clipboard.writeText(promptText);
    setCopiedId(item.id);
    setToastMessage(`คัดลอก Prompt "${item.label}" เรียบร้อยแล้ว!`);

    setTimeout(() => {
      setCopiedId(null);
      setToastMessage(null);
    }, 2800);
  };

  // Keyboard navigation for dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeItem) {
        setActiveItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem]);

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-400/40 text-amber-300 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Quick Switcher */}
      <div className="bg-[#0a1220]/90 border-b border-white/10 px-4 sm:px-6 py-3 sticky top-20 z-30 backdrop-blur-md">
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
            <Link
              href="/prompts/video"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 px-3 py-1.5 rounded-lg border border-pink-500/20 transition-all"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Prompt Video (100 Styles)</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/30">
              <Film className="w-3.5 h-3.5" />
              <span>Prompt Video ละคร (AI Drama)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/#classes"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md shadow-amber-400/20 hover:from-amber-300 hover:to-amber-200 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เวิร์กช็อป AI Creator</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-amber-400/30 text-amber-400 text-xs font-semibold mb-4 shadow-lg shadow-amber-400/10">
            <div className="w-5 h-5 rounded-md overflow-hidden bg-amber-400/20 flex items-center justify-center shrink-0">
              <img src="/assets/logo.png" alt="Kevin AI Logo" className="w-full h-full object-cover" />
            </div>
            <span>Kevin AI Drama Studio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-300 font-normal">AI Video Catalog</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            คลังตัวอย่าง <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">ละครสั้น AI</span> & วิดีโอสตอรี่
          </h1>
          
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 font-normal">
            ตัวอย่างคลิปละครสั้น AI ทุกแนวเรื่อง บทพูดภาษาไทย ท่ากล้อง แสง และสไตล์ภาพ 
            กดดูคลิป บทพูดในแต่ละช็อต และคัดลอก Master Prompt ไปสร้างต่อได้ทันที
          </p>

          {/* Key Metric Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>77</strong> ตัวอย่างงานจริง</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-pink-400" />
              <span><strong>39</strong> คลิป 10 วินาที พร้อมเสียงพากย์</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span><strong>100%</strong> AI Generated ไม่ต้องถ่ายทำ</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>คลิกเดียว <strong>คัดลอก Master Prompt</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* Sticky Filter & Search Bar */}
        <div className="sticky top-[133px] z-20 pb-4 pt-2 bg-[#070d18]/95 backdrop-blur-xl border-b border-white/5 space-y-3">
          
          {/* Search + Media Type Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาแนวเรื่อง, บทพูด, สไตล์ภาพ, หรือ Prompt..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
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

            {/* Media Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/10 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  typeFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ทั้งหมด ({dramaCatalog.items.length})
              </button>
              <button
                onClick={() => setTypeFilter('clip')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  typeFilter === 'clip'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>คลิปวิดีโอ (39)</span>
              </button>
              <button
                onClick={() => setTypeFilter('image')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  typeFilter === 'image'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>รูปภาพ (38)</span>
              </button>
            </div>
          </div>

          {/* Category Tabs (Scrollable Horizontal) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {/* "All" Tab */}
            <button
              onClick={() => setSelectedGroup('all')}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedGroup === 'all'
                  ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-white'
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedGroup === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                {groupCounts['all'] || 0}
              </span>
            </button>

            {/* Individual Category Tabs */}
            {Object.entries(dramaCatalog.groups).map(([groupKey, groupTitleTh]) => {
              const count = groupCounts[groupKey] || 0;
              if (count === 0) return null;
              const isSelected = selectedGroup === groupKey;

              return (
                <button
                  key={groupKey}
                  onClick={() => setSelectedGroup(groupKey)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-900/80 border-white/10 text-slate-300 hover:border-amber-400/40 hover:text-white'
                  }`}
                >
                  <span>{groupTitleTh}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Group Note Banner */}
          {DRAMA_GROUP_NOTES[selectedGroup] && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-white/5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{DRAMA_GROUP_NOTES[selectedGroup]}</span>
            </div>
          )}
        </div>

        {/* Pinterest Masonry Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">ไม่พบผลลัพธ์ที่ค้นหา</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              ลองค้นหาด้วยคำสำคัญอื่น หรือกดเลือกแท็บ &quot;ทั้งหมด&quot; เพื่อดูตัวอย่างทั้งหมด 77 รายการ
            </p>
            <button
              onClick={() => { setSelectedGroup('all'); setTypeFilter('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20"
            >
              รีเซ็ตตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 pt-4">
            {filteredItems.map((item) => (
              <PinterestPinCard
                key={item.id}
                item={item}
                onSelect={() => setActiveItem(item)}
                onCopyPrompt={(e) => handleCopyPrompt(e, item)}
                isCopied={copiedId === item.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Pinterest-like Pin Detail Dialog / Modal */}
      {activeItem && (
        <DramaDetailModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onCopyPrompt={(e) => handleCopyPrompt(e, activeItem)}
          isCopied={copiedId === activeItem.id}
        />
      )}

      {/* Footer Banner */}
      <footer className="mt-16 border-t border-white/10 bg-[#09111e]/90 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="w-10 h-10 rounded-2xl overflow-hidden border border-amber-400/30 mx-auto bg-amber-400/10">
            <img src="/assets/logo.png" alt="Kevin AI Logo" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-xl font-black text-white">
            อยากสร้างละครสั้น AI หรือคลิปวิดีโอระดับมืออาชีพแบบนี้?
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            เรียนรู้เทคนิคการ Generate บทละคร, การทำ Character Consistency, การโคลนเสียงภาษาไทย 
            และการตัดต่ออัตโนมัติในคลาส <strong className="text-amber-400">AI Creator Workshop</strong> กับ อ. Kevin
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#classes"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-sm font-bold shadow-lg shadow-amber-400/25 hover:from-amber-300 hover:to-amber-200 transition-all"
            >
              ดูรายละเอียดคอร์สเรียน & จองที่นั่ง
            </Link>
            <Link
              href="/prompts"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold border border-white/10 transition-all"
            >
              ไปที่ Prompt Generator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Pinterest Pin Card Component
 */
function PinterestPinCard({
  item,
  onSelect,
  onCopyPrompt,
  isCopied
}: {
  item: DramaItem;
  onSelect: () => void;
  onCopyPrompt: (e: React.MouseEvent) => void;
  isCopied: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const imgUrl = getDramaMediaUrl(item.img);
  const clipUrl = item.clip ? getDramaMediaUrl(item.clip) : null;

  // Autoplay short preview on hover
  useEffect(() => {
    if (clipUrl && videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, clipUrl]);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="break-inside-avoid mb-4 group cursor-pointer relative rounded-2xl overflow-hidden bg-slate-900/90 border border-white/10 hover:border-amber-400/60 shadow-lg hover:shadow-2xl hover:shadow-amber-400/10 transition-all duration-300 flex flex-col"
    >
      {/* Media Container (Vertical Pinterest ratio 9:16) */}
      <div className="relative aspect-[9/16] w-full bg-black overflow-hidden">
        {/* Poster Image */}
        <img
          src={imgUrl}
          alt={item.label}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isHovered && clipUrl ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Hover Video Preview */}
        {clipUrl && (
          <video
            ref={videoRef}
            src={clipUrl}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
              {item.kind === 'clip' ? (
                <>
                  <Film className="w-3 h-3 text-pink-400" />
                  <span>10s</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3 h-3 text-cyan-400" />
                  <span>ภาพ</span>
                </>
              )}
            </span>
            {item.region && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/60 text-slate-300 backdrop-blur-sm">
                {item.region}
              </span>
            )}
          </div>

          {/* Quick Copy Prompt Button (Pinterest style Save button) */}
          <button
            onClick={onCopyPrompt}
            title="คัดลอก Master Prompt"
            className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-all shadow-lg ${
              isCopied
                ? 'bg-emerald-500 text-slate-950 scale-105'
                : 'bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 border border-white/20 hover:border-amber-400 opacity-90 group-hover:opacity-100'
            }`}
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Play indicator icon for clips */}
        {item.kind === 'clip' && !isHovered && (
          <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-md">
            <Play className="w-4 h-4 ml-0.5 text-amber-400" />
          </div>
        )}

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Pin Information / Caption */}
      <div className="p-3.5 flex flex-col gap-1.5 flex-1 bg-slate-900/90 border-t border-white/5">
        <div className="flex items-start justify-between gap-1.5">
          <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-1">
            {item.emoji ? `${item.emoji} ` : ''}{item.label}
          </h4>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-amber-400/90">{item.groupTh}</span>
          {item.settings?.['สไตล์'] && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]">{item.settings['สไตล์']}</span>
            </>
          )}
        </div>

        {/* Dialogue or Beat preview snippet */}
        {(item.lines?.[0] || item.beat) && (
          <p className="text-xs text-slate-300/80 line-clamp-2 leading-relaxed mt-0.5 font-light">
            {item.lines?.[0] ? `"${item.lines[0]}"` : item.beat}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Pinterest-like Detail Modal (Dialog)
 */
function DramaDetailModal({
  item,
  onClose,
  onCopyPrompt,
  isCopied
}: {
  item: DramaItem;
  onClose: () => void;
  onCopyPrompt: (e: React.MouseEvent) => void;
  isCopied: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const imgUrl = getDramaMediaUrl(item.img);
  const clipUrl = item.clip ? getDramaMediaUrl(item.clip) : null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#0c1524] border border-white/15 rounded-3xl shadow-2xl shadow-black overflow-hidden flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-all backdrop-blur-md"
          title="ปิดหน้าต่าง (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Video / Media Player */}
        <div className="md:w-[45%] bg-black flex items-center justify-center relative overflow-hidden shrink-0 min-h-[360px] md:min-h-[580px]">
          {clipUrl ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <video
                ref={videoRef}
                src={clipUrl}
                poster={imgUrl}
                controls
                autoPlay
                playsInline
                loop
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full max-h-[60vh] md:max-h-[92vh] object-contain"
              />

              {/* Floating Media Controls overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-black/70 hover:bg-amber-400 text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={imgUrl}
              alt={item.label}
              className="w-full max-h-[60vh] md:max-h-[92vh] object-contain"
            />
          )}

          {/* Media Kind Tag */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/80 text-amber-400 border border-amber-400/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
              {item.kind === 'clip' ? (
                <>
                  <Film className="w-3.5 h-3.5" />
                  <span>คลิปวิดีโอ 10s</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>ภาพความละเอียดสูง</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Right Side: Script, Dialogue & Prompt */}
        <div className="md:w-[55%] p-5 sm:p-6 md:p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1.5">
              <span>{item.groupTh}</span>
              {item.region && <span>• {item.region}</span>}
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-normal">Kevin AI Studio</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {item.emoji ? `${item.emoji} ` : ''}{item.label}
            </h2>
          </div>

          {/* Scene Beat (สถานการณ์ฉากนี้) */}
          {item.beat && (
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ฉากนี้ (Scene Beat)</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-light">
                {item.beat}
              </p>
            </div>
          )}

          {/* Dialogue Lines (บทพูดในช็อตนี้) */}
          {item.lines && item.lines.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                <span>บทพูดในช็อตนี้ ({item.lines.length} ประโยค)</span>
              </div>
              <div className="space-y-2">
                {item.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-sm text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-normal">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narration (เสียงบรรยาย) */}
          {item.narration && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                เสียงบรรยาย (Voice Narration)
              </div>
              <p className="text-sm text-slate-300 italic bg-slate-900/40 p-3 rounded-xl border border-white/5">
                &ldquo;{item.narration}&rdquo;
              </p>
            </div>
          )}

          {/* Settings Chips (ค่าที่ตั้งในระบบ) */}
          {item.settings && Object.keys(item.settings).length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                <span>ค่าที่ตั้งในระบบ (Parameters)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(item.settings)
                  .filter(([, val]) => Boolean(val))
                  .map(([key, val]) => (
                  <div
                    key={key}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs flex items-center gap-1.5"
                  >
                    <span className="text-slate-400 font-medium">{key}:</span>
                    <span className="text-amber-300 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Master Prompt Box */}
          {item.metaPrompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>คำสั่ง Master AI Prompt</span>
                </div>
                <button
                  onClick={onCopyPrompt}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
                    isCopied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-amber-400/20'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>คัดลอกสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก Master Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-white/15 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap selection:bg-amber-400 selection:text-slate-950 max-h-48 overflow-y-auto">
                {item.metaPrompt}
              </div>
            </div>
          )}

          {/* CTA Banner */}
          <div className="mt-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-amber-400/10 to-transparent p-4 rounded-2xl border border-amber-400/20">
            <div>
              <div className="text-xs font-bold text-amber-400">สนใจคอร์สสร้างละคร AI?</div>
              <p className="text-xs text-slate-300 mt-0.5">เวิร์กช็อปตัวต่อตัว & คลาสสดกับ อ. Kevin</p>
            </div>
            <Link
              href="/#classes"
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-400/20 shrink-0 transition-all"
            >
              ดูรอบเรียน & จองคอร์ส
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
