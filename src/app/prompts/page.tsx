'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PromptTemplate } from '@/lib/types';
import {
  Sparkles, Copy, Check, Terminal, Sliders, Layers, ArrowRight,
  Search, BookOpen, Download, Share2, RefreshCw, Cpu, Code2,
  CheckCircle2, Flame, ExternalLink, HelpCircle, Video, Film, Palette, Clapperboard
} from 'lucide-react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Generator form inputs: variable values mapped by key
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Fetch prompts
  useEffect(() => {
    fetch('/api/prompts')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data.length > 0) {
          setPrompts(res.data);
          // Pick the first featured or first prompt as default active builder
          const initial = res.data.find((p: PromptTemplate) => p.isFeatured) || res.data[0];
          setSelectedPrompt(initial);
          initVariables(initial);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Initialize form fields with prompt's default variable values
  const initVariables = (p: PromptTemplate) => {
    const initialMap: Record<string, string> = {};
    p.variables?.forEach(v => {
      initialMap[v.key] = v.defaultValue || '';
    });
    setVariableValues(initialMap);
  };

  const handleSelectPrompt = (p: PromptTemplate) => {
    setSelectedPrompt(p);
    initVariables(p);
    // Smooth scroll down to generator on mobile if needed
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      const el = document.getElementById('prompt-builder');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compute final generated prompt text by replacing placeholders
  const generatedPrompt = useMemo(() => {
    if (!selectedPrompt) return '';
    let result = selectedPrompt.templateContent;
    selectedPrompt.variables?.forEach(v => {
      const val = variableValues[v.key] ?? v.defaultValue ?? '';
      const regex = new RegExp(`{{${v.key}}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [selectedPrompt, variableValues]);

  // Copy handler
  const handleCopy = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      // Ping copy increment in background
      if (selectedPrompt?.id) {
        fetch(`/api/prompts/${selectedPrompt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'increment_copy' })
        }).catch(() => {});
        setPrompts(prev => prev.map(p => p.id === selectedPrompt.id ? { ...p, copyCount: (p.copyCount || 0) + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Download markdown (.md)
  const handleDownload = () => {
    if (!generatedPrompt || !selectedPrompt) return;
    const blob = new Blob([generatedPrompt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedPrompt.slug || 'master-prompt'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const categories = ['all', ...Array.from(new Set(prompts.map(p => p.category).filter(Boolean)))];

  const filteredPrompts = prompts.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#080f1a] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI PROMPT GENERATOR & LIBRARY</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
            คลัง Master Prompt & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400">
              ตัวสร้าง Prompt อัจฉริยะ (Builder)
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            เลือกโจทย์ที่คุณต้องการ ปรับตั้งค่าตัวแปรในฟอร์ม แล้วรับ Master Prompt สั่งการ Codex, Claude 3.7, Cursor หรือ ChatGPT 
            นำไปใช้สร้าง Web App, ระบบ CRM, หรือคอนเทนต์ได้ทันทีโดยไม่ต้องเริ่มต้นจากศูนย์
          </p>
        </div>

        {/* Video Prompt, Drama Studio, Vibe Design & Motion Claude Feature Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* 1. Video Prompt Library Banner */}
          <Link
            href="/prompts/video"
            className="group block relative overflow-hidden rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-pink-500/60 transition-all shadow-xl hover:shadow-pink-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center font-bold shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-pink-500 text-white uppercase tracking-wide">
                      100 STYLES
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                      Prompt Video
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    สูตรสร้างวิดีโอ 100 สไตล์ พร้อมคลิปตัวอย่างและวิธีแทนค่า
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 2. AI Drama Studio Pinterest Catalog Banner */}
          <Link
            href="/prompts/drama"
            className="group block relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/10 via-amber-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-amber-400/80 transition-all shadow-xl hover:shadow-amber-400/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wide">
                      77 STYLES
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Video ละคร
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    คลิปละครสั้น AI ทุกแนวเรื่อง ท่ากล้อง แสง และบทพูดภาษาไทย
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-amber-400/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 3. Vibe Design (Oil UI) Banner */}
          <Link
            href="/prompts/vibe-design"
            className="group block relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-indigo-400 transition-all shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500 text-white uppercase tracking-wide">
                      97 STYLES
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Vibe Design
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    UI Design Skill สำหรับ AI คลัง 97 สไตล์ & Playbooks
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* 4. Motion Claude Prompt (Opus 5.5) Banner */}
          <Link
            href="/prompts/motion-claude"
            className="group block relative overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-slate-900/40 p-4 sm:p-5 hover:border-orange-400 transition-all shadow-xl hover:shadow-orange-500/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                  <Clapperboard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-slate-950 uppercase tracking-wide">
                      703 PROMPTS · NEW
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                      Motion Claude
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    Opus 5.5 Viral Videos & Motion Code + 418 Remakes
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-slate-950 transition-colors shrink-0 mt-1">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: PROMPT PRESETS / CARDS SELECTOR               */}
        {/* ======================================================== */}
        <div className="mb-14">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>1. เลือกเทมเพลต Prompt จากคลัง</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">คลิกเพื่อโหลดการตั้งค่าเข้าสู่ระบบ Prompt Generator</p>
            </div>

            {/* Search Input & Filter pills */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหา เช่น หนังสั้น, UGC, ซีรีส์..."
                  className="w-full bg-[#101c2d] border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
                      selectedCategory === cat
                        ? cat === 'AI Video Creation'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-500/20'
                          : 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                        : 'bg-[#101c2d] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat === 'AI Video Creation' && <Video className="w-3 h-3 text-pink-300" />}
                    <span>{cat === 'all' ? 'ทั้งหมด' : cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredPrompts.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#0e1828] p-10 text-center text-slate-400">
              <p className="text-sm mb-3">ไม่พบ Prompt ที่ตรงกับคำค้นหา "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/30 hover:bg-amber-400/20 transition-all"
              >
                ล้างการค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrompts.map(p => {
                const isSelected = selectedPrompt?.id === p.id;
                const isVideo = p.category === 'AI Video Creation';
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPrompt(p)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all text-left relative flex flex-col justify-between ${
                      isSelected
                        ? isVideo
                          ? 'bg-[#1a1426] border-pink-500 shadow-xl shadow-pink-500/10 ring-2 ring-pink-500/30'
                          : 'bg-[#14233a] border-amber-400 shadow-xl shadow-amber-400/10 ring-2 ring-amber-400/30'
                        : 'bg-[#0e1828] border-white/5 hover:border-white/20 hover:bg-[#121f33]'
                    }`}
                  >
                    {p.isFeatured && (
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isVideo
                          ? 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                          : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                      }`}>
                        <Flame className="w-3 h-3" /> แนะนำ
                      </span>
                    )}

                    <div>
                      <span className={`text-[11px] font-medium tracking-wide uppercase flex items-center gap-1.5 mb-1.5 ${
                        isVideo ? 'text-pink-400' : 'text-amber-400/90'
                      }`}>
                        {isVideo && <Video className="w-3.5 h-3.5" />}
                        <span>{p.category}</span>
                      </span>
                      <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">
                        {p.variables?.length || 0} ตัวแปร
                      </span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        isSelected 
                          ? isVideo ? 'text-pink-400' : 'text-amber-400' 
                          : 'text-slate-400'
                      }`}>
                        {isSelected ? 'กำลังปรับแต่ง' : 'เลือกใช้'}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: PROMPT BUILDER WORKSPACE (เหมือนใน Reference) */}
        {/* ======================================================== */}
        <div id="prompt-builder" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <span>2. ปรับแต่ง Prompt ของคุณ (Prompt Generator)</span>
            </h2>
          </div>

          {selectedPrompt ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Input Configuration Form */}
              <div className="lg:col-span-5 bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                      CONFIG FORM
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {selectedPrompt.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => initVariables(selectedPrompt)}
                    title="รีเซ็ตค่าเป็นค่าเริ่มต้น"
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition text-xs flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">รีเซ็ต</span>
                  </button>
                </div>

                <form onSubmit={e => e.preventDefault()} className="space-y-4">
                  {selectedPrompt.variables?.map(v => (
                    <div key={v.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">
                          {v.label}
                        </label>
                        <span className="text-[10px] font-mono text-slate-500">
                          {`{{${v.key}}}`}
                        </span>
                      </div>

                      {v.description && (
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {v.description}
                        </p>
                      )}

                      {v.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={variableValues[v.key] ?? ''}
                          onChange={e => setVariableValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                          className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
                          placeholder={`ใส่ข้อมูล ${v.label}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={variableValues[v.key] ?? ''}
                          onChange={e => setVariableValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                          className="w-full bg-[#080f1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400 font-sans"
                          placeholder={`ใส่ข้อมูล ${v.label}...`}
                        />
                      )}
                    </div>
                  ))}

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'คัดลอก Prompt แล้ว!' : 'Copy Master Prompt ของฉัน'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="py-3 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition flex items-center gap-1.5"
                      title="ดาวน์โหลดเป็นไฟล์ Markdown (.md)"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline">.md</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: Real-Time Preview Terminal */}
              <div className="lg:col-span-7 bg-[#0b1320] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Terminal Header */}
                <div className="bg-[#0e1828] px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>{selectedPrompt.slug || 'master-prompt'}.md</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                      {generatedPrompt.length.toLocaleString()} ตัวอักษร
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-bold border border-amber-400/30 transition flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Terminal Code Body */}
                <div className="p-5 font-mono text-xs leading-relaxed text-slate-300 max-h-[580px] overflow-y-auto whitespace-pre-wrap select-text bg-[#070d17]/80">
                  {generatedPrompt}
                </div>

                {/* Footer hints */}
                <div className="bg-[#0e1828]/90 px-5 py-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>พร้อมนำไปวางใน Codex / Claude Sonnet / Cursor ได้ทันที</span>
                  </span>
                  <Link
                    href="/articles"
                    className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>อ่านคู่มือการรัน Prompt</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 bg-[#0e1828] border border-white/5 rounded-3xl">
              <p className="text-slate-400">กำลังโหลดเทมเพลต Prompt...</p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: FAQ / PROMPT TIPS                             */}
        {/* ======================================================== */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-white text-center mb-8 flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>วิธีใช้งาน Master Prompt ให้ได้ผลลัพธ์ดีที่สุด</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              <div className="bg-[#0e1828] p-5 rounded-2xl border border-white/5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center mb-3">
                  1
                </span>
                <h4 className="font-bold text-white mb-1.5">กำหนดโจทย์ให้เฉพาะเจาะจง</h4>
                <p className="text-slate-400 leading-relaxed">
                  ยิ่งใส่ข้อมูลกลุ่มเป้าหมาย (Users) และฟีเจอร์หลัก (Features) ชัดเจน AI จะไม่ออกนอกลู่นอกทาง และวางสถาปัตยกรรมได้ตรงใจ
                </p>
              </div>

              <div className="bg-[#0e1828] p-5 rounded-2xl border border-white/5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center mb-3">
                  2
                </span>
                <h4 className="font-bold text-white mb-1.5">สั่ง AI ทำทีละ Phase</h4>
                <p className="text-slate-400 leading-relaxed">
                  ใน Master Prompt แบ่งเป็น 6 Phases (Foundation → Database → Core UI → AI → Test → Deploy) อย่าสั่งทำทั้งหมดในคำสั่งเดียว
                </p>
              </div>

              <div className="bg-[#0e1828] p-5 rounded-2xl border border-white/5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 font-bold flex items-center justify-center mb-3">
                  3
                </span>
                <h4 className="font-bold text-white mb-1.5">ตรวจ Type & Tests สม่ำเสมอ</h4>
                <p className="text-slate-400 leading-relaxed">
                  เมื่อ AI เขียนโค้ดแต่ละหน้าเสร็จ ให้สั่งรัน Type Check และรันเทสต์ทุกครั้ง เพื่อป้องกันข้อผิดพลาดสะสม
                </p>
              </div>
            </div>

            {/* CTA Workshop Banner */}
            <div className="mt-12 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-400/30 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
              <h4 className="text-lg font-bold text-white mb-2">
                ต้องการเรียนรู้วิธีสร้าง AI Agent และสั่ง AI ขั้นสูงแบบจับมือทำ?
              </h4>
              <p className="text-xs text-slate-300 max-w-xl mx-auto mb-5 leading-relaxed">
                ลงทะเบียนเวิร์กช็อปกับ อ. Kevin เพื่อฝึกต่อยอด Prompt เหล่านี้ให้เป็นระบบใช้งานจริง พร้อมการเขียนโค้ดและเชื่อมระบบอัตโนมัติ
              </p>
              <Link
                href="/#classes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 transition"
              >
                <span>ดูรอบเรียนและจองคลาส</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
