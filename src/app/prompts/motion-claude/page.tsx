'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import motionVideosData from '@/data/motion-claude-videos.json';
import {
  Clapperboard,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Terminal,
  Download,
  Eye,
  X,
  ChevronRight,
  ArrowRight,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Video,
  Film,
  Code2,
  Cpu,
  Monitor,
  Share2,
  Maximize2
} from 'lucide-react';

interface MotionVideoItem {
  slug: string;
  author: string;
  author_url: string;
  post_url: string;
  category: 'motion' | '3d' | 'explainer' | 'interactive' | string;
  tech_tags: string[];
  prompt: string;
  prompt_partial?: boolean;
  poster_url: string;
  skillry_url: string;
  added?: string;
  has_remake: boolean;
  original_video_url?: string;
  remake_video_url?: string;
}

export default function MotionClaudePromptsPage() {
  const allItems = motionVideosData as MotionVideoItem[];

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [onlyWithRemake, setOnlyWithRemake] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayCount, setDisplayCount] = useState<number>(36);

  // Modal states
  const [modalItem, setModalItem] = useState<MotionVideoItem | null>(null);
  const [videoTab, setVideoTab] = useState<'original' | 'remake' | 'compare'>('original');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedModalPrompt, setCopiedModalPrompt] = useState<boolean>(false);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItems.length };
    allItems.forEach(item => {
      const cat = item.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allItems]);

  // Tech tags list & counts
  const topTechTags = useMemo(() => {
    const map: Record<string, number> = {};
    allItems.forEach(item => {
      item.tech_tags?.forEach(tag => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchTech =
        selectedTech === 'all' || item.tech_tags?.includes(selectedTech);
      const matchRemake = !onlyWithRemake || item.has_remake;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.author.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tech_tags?.some(t => t.toLowerCase().includes(q));

      return matchCategory && matchTech && matchRemake && matchSearch;
    });
  }, [allItems, selectedCategory, selectedTech, onlyWithRemake, searchQuery]);

  // Paginated visible items
  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  // Copy helper
  const handleCopy = async (text: string, id: string, isModal = false) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isModal) {
        setCopiedModalPrompt(true);
        setTimeout(() => setCopiedModalPrompt(false), 2000);
      } else {
        setCopiedPromptId(id);
        setTimeout(() => setCopiedPromptId(null), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = (item: MotionVideoItem) => {
    setModalItem(item);
    setVideoTab(item.has_remake ? 'compare' : 'original');
    setCopiedModalPrompt(false);
  };

  // Helper for Category Label
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'motion':
        return 'Motion Graphics';
      case '3d':
        return '3D Scenes';
      case 'explainer':
        return 'Explainers';
      case 'interactive':
        return 'Interactive & Games';
      default:
        return cat;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'motion':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case '3d':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'explainer':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'interactive':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-rose-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[550px] h-[400px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-orange-500/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <Link href="/prompts" className="hover:text-amber-400 transition-colors">
            Prompts
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-orange-400 font-semibold">Motion Claude Prompt (Opus 5.5)</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-orange-950/40 via-slate-900/70 to-[#0a1122]/90 p-6 sm:p-10 mb-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-semibold uppercase tracking-wider">
                <Clapperboard className="w-3.5 h-3.5 text-orange-400" />
                Motion Claude &bull; Opus 5.5
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                703 Viral Prompts
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                <Video className="w-3 h-3" />
                418 Live Remakes
              </span>
              <a
                href="https://skillry.dev/ai-videos/opus-5-5?utm_source=github&utm_medium=readme&utm_campaign=awesome-opus5-5-videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium ml-auto"
              >
                <span>Skillry Original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Opus 5.5 Videos & Motion Graphics.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400">
                Viral Prompts and Live Remakes
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-8">
              คลังรวมสูตร Master Prompt ของวิดีโอระดับไวรัลที่สร้างด้วย <strong>Claude Opus 5.5</strong>{' '}
              โดยการสั่งให้ AI เขียนแอนิเมชันออกมาเป็นโค้ดจริง (HTML, Canvas, Three.js, SVG, WebGL และ GSAP) 
              พร้อมวิดีโอเปรียบเทียบ Original กับ Live Remake ให้คุณคัดลอก Prompt ไปทดลองสั่งงาน AI Agent ได้ทันที
            </p>

            {/* Quick Action Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">369</div>
                  <div className="text-xs text-slate-400">Motion Graphics</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">117</div>
                  <div className="text-xs text-slate-400">3D Scenes & Shader</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">116</div>
                  <div className="text-xs text-slate-400">Explainers & Diagrams</div>
                </div>
              </div>

              <a
                href="/skills/awesome-opus5-5-prompts.zip"
                download="awesome-opus5-5-prompts.zip"
                className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-lg shadow-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด 703 Prompts (.zip)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Filter Controls Section */}
        <div className="space-y-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setDisplayCount(36);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              All Categories ({categoryCounts['all']})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('motion');
                setDisplayCount(36);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'motion'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              Motion Graphics ({categoryCounts['motion'] || 0})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('3d');
                setDisplayCount(36);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === '3d'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              3D Scenes ({categoryCounts['3d'] || 0})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('explainer');
                setDisplayCount(36);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'explainer'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              Explainers ({categoryCounts['explainer'] || 0})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('interactive');
                setDisplayCount(36);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'interactive'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              Interactive & Games ({categoryCounts['interactive'] || 0})
            </button>
          </div>

          {/* Subfilter & Search Row */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
            {/* Tech Tags Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-500" />
                <span>Tech:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTech('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedTech === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {topTechTags.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTech(tag)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedTech === tag
                      ? 'bg-orange-500 text-slate-950 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>

            {/* Right side: Remake Switch & Search */}
            <div className="flex items-center gap-3 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none bg-slate-900/60 px-3 py-2 rounded-xl border border-white/5 hover:border-white/10">
                <input
                  type="checkbox"
                  checked={onlyWithRemake}
                  onChange={e => {
                    setOnlyWithRemake(e.target.checked);
                    setDisplayCount(36);
                  }}
                  className="w-3.5 h-3.5 rounded text-orange-500 focus:ring-0 focus:outline-none accent-orange-500"
                />
                <span>เฉพาะที่มี Live Remake (418)</span>
              </label>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ค้นหา Creator, Prompt หรือ Tag..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setDisplayCount(36);
                  }}
                  className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-400 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span>
            แสดง <strong>{visibleItems.length}</strong> จากทั้งหมด <strong>{filteredItems.length}</strong> วิดีโอ
          </span>
          <span className="text-[11px] text-slate-500">
            คลิกที่การ์ดเพื่อดูคลิปแบบ Side-by-Side และคัดลอก Prompt
          </span>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleItems.map(item => (
            <div
              key={item.slug}
              onClick={() => openModal(item)}
              className="group relative rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Video Poster with aspect-video */}
              <div className="relative aspect-video overflow-hidden bg-slate-950">
                <img
                  src={item.poster_url}
                  alt={`Opus 5.5 video by @${item.author}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Category Badge top-left */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md uppercase tracking-wider ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                </div>

                {/* Live Remake Badge top-right */}
                {item.has_remake && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/90 text-slate-950 backdrop-blur-md font-sans shadow-sm font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Live Remake
                    </span>
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-orange-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <span className="px-3 py-1.5 rounded-xl bg-orange-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-orange-500/40">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Watch & Remake
                  </span>
                </div>
              </div>

              {/* Card Meta & Prompt Snippet */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <a
                      href={item.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="font-bold text-xs text-white hover:text-orange-400 transition-colors flex items-center gap-1 truncate"
                    >
                      <span>@{item.author}</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                    </a>
                    {item.added && (
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {item.added}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-3 font-sans">
                    {item.prompt}
                  </p>
                </div>

                {/* Footer: Tech stack and Copy button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 overflow-hidden truncate">
                    {item.tech_tags?.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tech_tags && item.tech_tags.length > 3 && (
                      <span className="text-[9px] text-slate-500 font-mono">
                        +{item.tech_tags.length - 3}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopy(item.prompt, item.slug);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-orange-500 hover:text-slate-950 text-slate-400 transition-colors shrink-0 flex items-center gap-1 text-[11px]"
                    title="คัดลอก Prompt"
                  >
                    {copiedPromptId === item.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleItems.length < filteredItems.length && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setDisplayCount(prev => prev + 36)}
              className="px-6 py-3 rounded-2xl bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/20"
            >
              โหลดวิดีโอเพิ่มเติม (+36 วิดีโอ)
            </button>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-base text-slate-400 mb-2">
              ไม่พบวิดีโอที่ตรงกับเงื่อนไขการค้นหา &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTech('all');
                setOnlyWithRemake(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 text-xs font-semibold transition-colors"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE VIDEO MODAL (SIDE-BY-SIDE / PLAYER)           */}
      {/* ======================================================== */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl bg-[#091122] border border-white/15 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getCategoryColor(
                    modalItem.category
                  )}`}
                >
                  {getCategoryLabel(modalItem.category)}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  Opus 5.5 Video by @{modalItem.author}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              {/* Left Column: Video Player Viewport (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10">
                {/* Video Switcher Tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setVideoTab('original')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      videoTab === 'original'
                        ? 'bg-orange-500 text-slate-950 font-bold shadow'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Original Video
                  </button>

                  {modalItem.has_remake && modalItem.remake_video_url && (
                    <button
                      type="button"
                      onClick={() => setVideoTab('remake')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        videoTab === 'remake'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Remake
                    </button>
                  )}

                  {modalItem.has_remake && modalItem.remake_video_url && (
                    <button
                      type="button"
                      onClick={() => setVideoTab('compare')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        videoTab === 'compare'
                          ? 'bg-gradient-to-r from-orange-500 to-emerald-500 text-slate-950 font-bold shadow'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Side-by-Side Compare</span>
                    </button>
                  )}
                </div>

                {/* Video Container Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 min-h-[260px] sm:min-h-[360px] flex items-center justify-center shadow-inner">
                  {videoTab === 'original' && (
                    <video
                      key={modalItem.original_video_url}
                      src={modalItem.original_video_url}
                      poster={modalItem.poster_url}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full max-h-[460px] object-contain rounded-2xl"
                    />
                  )}

                  {videoTab === 'remake' && modalItem.remake_video_url && (
                    <video
                      key={modalItem.remake_video_url}
                      src={modalItem.remake_video_url}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full max-h-[460px] object-contain rounded-2xl"
                    />
                  )}

                  {videoTab === 'compare' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full p-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-orange-400 font-bold mb-1 uppercase tracking-wider text-center">
                          Original Video
                        </span>
                        <video
                          src={modalItem.original_video_url}
                          poster={modalItem.poster_url}
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-auto aspect-video object-contain rounded-xl border border-orange-500/30"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-400 font-bold mb-1 uppercase tracking-wider text-center">
                          Live Remake
                        </span>
                        <video
                          src={modalItem.remake_video_url}
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-auto aspect-video object-contain rounded-xl border border-emerald-500/30"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* External links */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <a
                    href={modalItem.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline flex items-center gap-1"
                  >
                    <span>โพสต์ต้นฉบับบน X (@{modalItem.author})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <a
                    href={modalItem.skillry_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>ดูบน Skillry</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Right Column: Prompt Details & Copy (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Viral Video Master Prompt
                    </h3>
                    <p className="text-xs text-slate-400">
                      สั่งให้ AI สร้างเป็นโค้ด HTML/JS Animation ที่รันได้จริง
                    </p>
                  </div>

                  {/* Tech stack badge list */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-slate-500">Tech:</span>
                    {modalItem.tech_tags?.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-orange-300 uppercase font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Prompt Text Box */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wide flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" />
                        Prompt (English)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(modalItem.prompt, modalItem.slug, true)}
                        className="px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        {copiedModalPrompt ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedModalPrompt ? 'คัดลอกแล้ว!' : 'Copy Prompt'}</span>
                      </button>
                    </div>

                    <div className="relative rounded-2xl bg-slate-950 border border-white/10 p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-64 overflow-y-auto selection:bg-orange-500 selection:text-slate-950">
                      {modalItem.prompt}
                    </div>
                  </div>

                  {/* Instruction Guide */}
                  <div className="rounded-2xl bg-orange-950/30 border border-orange-500/20 p-3.5 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-orange-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      <span>วิธีนำไปสั่งงาน Claude Opus 5.5 / Cursor:</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ก็อปปี้ Prompt ด้านบนไปใส่ใน <strong>Claude Opus 5.5</strong>, <strong>Codex</strong> หรือ <strong>Cursor Composer</strong>{' '}
                      โดยให้ AI สร้างเป็นไฟล์ HTML เดียวที่รวม CSS, JavaScript, Canvas หรือ Three.js เพื่อดูผลลัพธ์แอนิเมชันแบบสดๆ
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(modalItem.prompt, modalItem.slug, true)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 transition-all"
                  >
                    {copiedModalPrompt ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-950" />
                    )}
                    <span>
                      {copiedModalPrompt
                        ? 'คัดลอก Master Prompt เรียบร้อยแล้ว!'
                        : 'คัดลอก Master Prompt ไปใช้งาน'}
                    </span>
                  </button>

                  <a
                    href={modalItem.skillry_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <span>ดูรายละเอียด Live Remake บน Skillry</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
