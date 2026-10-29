'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Download, 
  ThumbsUp, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Check, 
  Layers, 
  Film, 
  SlidersHorizontal, 
  X, 
  Play, 
  Tag, 
  Cpu, 
  Video, 
  Clapperboard,
  ArrowRight,
  Filter
} from 'lucide-react';
import rawModels from '@/data/minimax-h3-civitai.json';

interface ModelMedia {
  url: string;
  type: string;
  width?: number;
  height?: number;
  prompt?: string;
  negativePrompt?: string;
}

interface CivitaiModel {
  id: number;
  name: string;
  type: string;
  creator: {
    username: string;
    image: string | null;
  };
  tags: string[];
  description: string;
  cleanDescription?: string;
  extractedPrompt?: string;
  stats: {
    downloadCount: number;
    thumbsUpCount: number;
    commentCount: number;
    rating: number;
  };
  baseModel: string;
  trainedWords: string[];
  files?: Array<{
    name: string;
    sizeKB: number;
    type: string;
    downloadUrl: string;
  }>;
  images: ModelMedia[];
  primaryMedia?: ModelMedia | null;
  civitaiUrl: string;
}

export default function MiniMaxH3ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState<'downloads' | 'thumbs' | 'name'>('downloads');
  const [activeModel, setActiveModel] = useState<CivitaiModel | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyPrompt = (text: string, id: number | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('คัดลอก Prompt เรียบร้อยแล้ว!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyTrigger = (word: string, id: number | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(word);
    setCopiedId(id);
    showToast(`คัดลอก Trigger Word: "${word}" แล้ว!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and sort models
  const filteredModels = useMemo(() => {
    return (rawModels as CivitaiModel[]).filter((m) => {
      // Type filter
      if (selectedType !== 'all') {
        if (selectedType === 'LORA' && m.type !== 'LORA') return false;
        if (selectedType === 'Workflows' && !m.type.toLowerCase().includes('workflow')) return false;
        if (selectedType === 'Checkpoint' && m.type !== 'Checkpoint') return false;
        if (selectedType === 'Other' && (m.type === 'LORA' || m.type.toLowerCase().includes('workflow') || m.type === 'Checkpoint')) return false;
      }

      // Tag filter
      if (selectedTag !== 'all') {
        const hasTag = m.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = m.name.toLowerCase().includes(q);
        const inCreator = m.creator?.username?.toLowerCase().includes(q);
        const inTags = m.tags.some(t => t.toLowerCase().includes(q));
        const inDesc = (m.cleanDescription || m.description || '').toLowerCase().includes(q);
        const inTrained = m.trainedWords?.some(w => w.toLowerCase().includes(q));
        if (!inName && !inCreator && !inTags && !inDesc && !inTrained) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'downloads') {
        return (b.stats?.downloadCount || 0) - (a.stats?.downloadCount || 0);
      }
      if (sortBy === 'thumbs') {
        return (b.stats?.thumbsUpCount || 0) - (a.stats?.thumbsUpCount || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchQuery, selectedType, selectedTag, sortBy]);

  // Total statistics
  const stats = useMemo(() => {
    const list = rawModels as CivitaiModel[];
    const totalDownloads = list.reduce((acc, curr) => acc + (curr.stats?.downloadCount || 0), 0);
    const totalLikes = list.reduce((acc, curr) => acc + (curr.stats?.thumbsUpCount || 0), 0);
    return {
      total: list.length,
      downloads: totalDownloads.toLocaleString(),
      likes: totalLikes.toLocaleString(),
      loras: list.filter(m => m.type === 'LORA').length,
      workflows: list.filter(m => m.type.toLowerCase().includes('workflow')).length,
      checkpoints: list.filter(m => m.type === 'Checkpoint').length
    };
  }, []);

  const getTypeBadgeColor = (type: string) => {
    if (type === 'LORA') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (type.toLowerCase().includes('workflow')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (type === 'Checkpoint') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 pb-24 selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/20 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-12 pb-10 border-b border-white/10 bg-gradient-to-b from-[#0e1424] to-[#07090E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
            <span>/</span>
            <Link href="/prompts" className="hover:text-white transition-colors">Prompts Hub</Link>
            <span>/</span>
            <span className="text-amber-400 font-semibold">MiniMax H3 Models</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>CIVITAI SHOWCASE · 112+ REAL MINIMAX H3 MODELS & WORKFLOWS</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                MiniMax H3 Models, LoRAs &amp; Workflows
              </h1>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                คลังโมเดล Checkpoints, Turbo LoRAs, และ ComfyUI Workflows สำหรับ <strong>MiniMax Hailuo H3</strong> จัดข้อมูลและรูปแบบตรงจาก <a href="https://civitai.com/search/models?sortBy=models_v9&query=minimax%20h3" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Civitai</a> พร้อม Prompt และ Trigger Words สำหรับสร้างวิดีโอ 2K คมชัดระดับโปรดักชัน
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/prompts/director-studio"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <Clapperboard className="w-4 h-4" />
                <span>Director Studio</span>
              </Link>
              <a
                href="https://civitai.com/search/models?sortBy=models_v9&query=minimax%20h3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-all"
              >
                <span>เปิด Civitai ↗</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-xs text-slate-400 font-medium">โมเดลทั้งหมด</span>
              <span className="text-xl font-black text-white tracking-tight mt-0.5 block">{stats.total} แบบ</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-xs text-slate-400 font-medium">ยอดดาวน์โหลดบน Civitai</span>
              <span className="text-xl font-black text-amber-400 tracking-tight mt-0.5 block">{stats.downloads}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-xs text-slate-400 font-medium">LoRAs &amp; Enhancers</span>
              <span className="text-xl font-black text-purple-400 tracking-tight mt-0.5 block">{stats.loras} รายการ</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <span className="block text-xs text-slate-400 font-medium">ComfyUI Workflows</span>
              <span className="text-xl font-black text-blue-400 tracking-tight mt-0.5 block">{stats.workflows} รายการ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter and Search Navigation Bar */}
      <section className="sticky top-20 z-30 bg-[#09111e]/95 backdrop-blur-xl border-b border-white/10 py-4 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อโมเดล, LoRA, Creator, หรือคำค้น (เช่น turbo, cinematic, pov)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-400 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'LORA', label: `LoRA (${stats.loras})` },
                { id: 'Workflows', label: `Workflows (${stats.workflows})` },
                { id: 'Checkpoint', label: `Checkpoint (${stats.checkpoints})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedType === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">จัดเรียง:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0e1424] border border-white/10 text-xs text-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="downloads">ยอดดาวน์โหลดสูงสุด</option>
                <option value="thumbs">ความนิยม (Thumbs Up)</option>
                <option value="name">ชื่อ A-Z</option>
              </select>
            </div>
          </div>

          {/* Tag Chips */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-amber-400" /> แท็กด่วน:
            </span>
            {[
              { id: 'all', label: 'ทั้งหมด' },
              { id: 'turbo', label: '⚡ Turbo Speed' },
              { id: 'cinematic', label: '🎬 Cinematic Look' },
              { id: 'filmmaking', label: '🎥 Filmmaking' },
              { id: 'audio', label: '🔊 Audio & Sound' },
              { id: 'speedup', label: '🚀 Low VRAM / Speedup' },
              { id: 'multishot', label: '🎞 Multishot Chain' },
              { id: 'pov', label: '👁 Male POV' },
              { id: 'upscaler', label: '✨ Latent Upscaler' }
            ].map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setSelectedTag(tag.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedTag === tag.id
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid Showcase */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            พบ <span className="text-white font-bold">{filteredModels.length}</span> โมเดล MiniMax H3
          </p>
        </div>

        {filteredModels.length === 0 ? (
          <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <Film className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">ไม่พบโมเดลที่ตรงกับคำค้น</h3>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองประเภทโมเดล</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedType('all'); setSelectedTag('all'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredModels.map((model) => {
              const primaryMedia = model.primaryMedia || (model.images && model.images[0]);
              const isVideo = primaryMedia?.type === 'video' || primaryMedia?.url?.endsWith('.mp4');

              return (
                <div
                  key={model.id}
                  onClick={() => { setActiveModel(model); setActiveMediaIndex(0); }}
                  className="group rounded-2xl bg-[#0c1220] border border-white/10 hover:border-amber-400/50 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Media Preview Box */}
                  <div className="relative aspect-video w-full bg-[#05070c] overflow-hidden">
                    {primaryMedia ? (
                      isVideo ? (
                        <video
                          src={primaryMedia.url}
                          muted
                          loop
                          playsInline
                          autoPlay
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src={primaryMedia.url}
                          alt={model.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                        <Video className="w-8 h-8 opacity-40" />
                        <span className="text-[11px] font-mono">MiniMax H3 Native</span>
                      </div>
                    )}

                    {/* Top Type Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md border backdrop-blur-md ${getTypeBadgeColor(model.type)}`}>
                        {model.type}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 font-semibold">
                        H3 2K
                      </span>
                    </div>

                    {/* Bottom Stats Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-[11px] text-slate-300 font-mono">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        {(model.stats?.downloadCount || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-rose-400" />
                        {(model.stats?.thumbsUpCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Model Title */}
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {model.name}
                      </h3>

                      {/* Creator attribution */}
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                        <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-200">
                          {model.creator.username.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate">{model.creator.username}</span>
                      </div>

                      {/* Trained Words / Trigger Words if present */}
                      {model.trainedWords && model.trainedWords.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-slate-500 font-medium">Trigger:</span>
                          {model.trainedWords.slice(0, 2).map((tw, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={(e) => handleCopyTrigger(tw, `${model.id}-${i}`, e)}
                              className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-amber-300 border border-white/10 truncate max-w-[130px]"
                              title="คลิกเพื่อคัดลอก Trigger Word"
                            >
                              {tw}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Description Preview */}
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {model.cleanDescription || 'โมเดลปรับแต่งและ workflow ขั้นสูงสำหรับ MiniMax H3'}
                      </p>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleCopyPrompt(model.extractedPrompt || model.name, model.id, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 transition-all"
                        title="คัดลอก Prompt สำหรับ MiniMax H3"
                      >
                        {copiedId === model.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-[11px]">Copy Prompt</span>
                          </>
                        )}
                      </button>

                      <a
                        href={model.civitaiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 border border-white/10 transition-all"
                        title="ดูโมเดลนี้บน Civitai"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Model Detail Modal (Civitai Full Inspection) */}
      {activeModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div 
            className="relative w-full max-w-4xl bg-[#0C1220] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#090E17]">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${getTypeBadgeColor(activeModel.type)}`}>
                  {activeModel.type}
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                    {activeModel.name}
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>โดย <strong>{activeModel.creator.username}</strong></span>
                    <span>·</span>
                    <span>{activeModel.baseModel}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-semibold">{activeModel.stats.downloadCount.toLocaleString()} downloads</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModel(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-300">
              {/* Media Gallery / Main Preview */}
              {activeModel.images && activeModel.images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10">
                    {activeModel.images[activeMediaIndex]?.type === 'video' || activeModel.images[activeMediaIndex]?.url.endsWith('.mp4') ? (
                      <video
                        src={activeModel.images[activeMediaIndex].url}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={activeModel.images[activeMediaIndex].url}
                        alt={activeModel.name}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Thumbnail Row if multiple images */}
                  {activeModel.images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {activeModel.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`relative w-20 h-14 rounded-lg overflow-hidden border shrink-0 transition-all ${
                            activeMediaIndex === idx
                              ? 'border-amber-400 scale-105'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Trigger Words Section */}
              {activeModel.trainedWords && activeModel.trainedWords.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Trigger Words / Trained Words (คลิกเพื่อคัดลอก)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {activeModel.trainedWords.map((word, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleCopyTrigger(word, `modal-${idx}`, e)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <span>{word}</span>
                        <Copy className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Prompt Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-amber-400" />
                    Prompt Template แนะนำสำหรับ MiniMax H3
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(activeModel.extractedPrompt || '', 'modal-prompt')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all"
                  >
                    {copiedId === 'modal-prompt' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>คัดลอก Prompt</span>
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#07090e] border border-white/5 font-mono text-xs text-slate-200 whitespace-pre-wrap break-words leading-relaxed select-all">
                  {activeModel.extractedPrompt}
                </pre>
              </div>

              {/* Description Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  รายละเอียดและวิธีใช้งานโมเดล
                </h4>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto">
                  {activeModel.cleanDescription || 'ไม่มีรายละเอียดเพิ่มเติม'}
                </div>
              </div>

              {/* Tags */}
              {activeModel.tags && activeModel.tags.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">แท็กที่เกี่ยวข้อง</h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeModel.tags.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-[#090E17] flex items-center justify-between gap-3 shrink-0">
              <a
                href={activeModel.civitaiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all"
              >
                <span>ดูบน Civitai Official</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <Link
                href="/prompts/director-studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all"
              >
                <Clapperboard className="w-4 h-4" />
                <span>นำไปใส่ใน Director Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
