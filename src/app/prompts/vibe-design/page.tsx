'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import worksData from '@/data/vibe-design-works.json';
import guidesData from '@/data/vibe-design-guides.json';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Terminal,
  Download,
  Star,
  Eye,
  X,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Code,
  Zap,
  Shield,
  Play,
  Monitor,
  Smartphone,
  Layout,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

interface WorkItem {
  slug: string;
  href: string;
  title: string;
  description: string;
  alt: string;
  image: string;
  model: string;
  prompt_en?: string;
  prompt_zh?: string;
  views?: string[];
  live_url?: string;
}

interface GuideItem {
  slug: string;
  href: string;
  title: string;
  category: string;
  desc: string;
}

export default function VibeDesignPage() {
  const works = worksData as WorkItem[];
  const guides = guidesData as GuideItem[];

  // State
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'works' | 'playbooks' | 'skill'>('works');
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [modalView, setModalView] = useState<'cover' | 'live' | number>('cover');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedInstallCmd, setCopiedInstallCmd] = useState<boolean>(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState<boolean>(false);
  const [copiedChinese, setCopiedChinese] = useState<boolean>(false);
  const [showChineseOriginal, setShowChineseOriginal] = useState<boolean>(false);

  // Filter models
  const modelCounts = useMemo(() => {
    const counts: Record<string, number> = { all: works.length };
    works.forEach(w => {
      const m = w.model || 'Other';
      counts[m] = (counts[m] || 0) + 1;
    });
    return counts;
  }, [works]);

  const uniqueModels = useMemo(() => {
    const list = Object.keys(modelCounts).filter(k => k !== 'all');
    // Sort by count descending
    return list.sort((a, b) => modelCounts[b] - modelCounts[a]);
  }, [modelCounts]);

  // Filtered works
  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      const matchModel = selectedModel === 'all' || w.model === selectedModel;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        w.title.toLowerCase().includes(query) ||
        w.description.toLowerCase().includes(query) ||
        (w.prompt_en && w.prompt_en.toLowerCase().includes(query)) ||
        w.model.toLowerCase().includes(query);
      return matchModel && matchQuery;
    });
  }, [works, selectedModel, searchQuery]);

  // Model badge styler
  const getModelBadge = (modelName: string) => {
    if (modelName.includes('Claude Opus')) {
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    }
    if (modelName.includes('Claude Sonnet') || modelName.includes('Claude Fable')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (modelName.includes('DeepSeek')) {
      return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
    if (modelName.includes('GPT 6 Luna') || modelName.includes('GPT 6 Astra')) {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  };

  // Copy helper
  const handleCopyText = async (text: string, type: 'prompt' | 'install' | 'git' | 'zh') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'prompt') {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      } else if (type === 'install') {
        setCopiedInstallCmd(true);
        setTimeout(() => setCopiedInstallCmd(false), 2000);
      } else if (type === 'git') {
        setCopiedGitCmd(true);
        setTimeout(() => setCopiedGitCmd(false), 2000);
      } else if (type === 'zh') {
        setCopiedChinese(true);
        setTimeout(() => setCopiedChinese(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openWorkModal = (w: WorkItem) => {
    setSelectedWork(w);
    setModalView('cover');
    setShowChineseOriginal(false);
  };

  return (
    <div className="min-h-screen bg-[#080e1a] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[500px] h-[400px] bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-[160px] rounded-full" />
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
          <span className="text-indigo-400 font-semibold">Vibe Design (Oil UI)</span>
        </nav>

        {/* Hero Section */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-[#0b1220]/80 p-6 sm:p-10 mb-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                Vibe Design &bull; Oil UI
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                97 Handcrafted Styles
              </span>
              <a
                href="https://github.com/oil-oil/oil-ui"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>2.2k</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </a>
              <a
                href="https://ui.oiloil.org/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-300 text-xs transition-colors ml-auto"
              >
                <span>Original Oil UI</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Build Interfaces with Character.{' '}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                A UI Design Skill for AI Agents
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed mb-8">
              หมดยุคดีไซน์ AI หน้าตาซ้ำซาก สี่เหลี่ยมสีม่วงแบบเดิมๆ <strong>Vibe Design (Oil UI)</strong>{' '}
              คือชุดทักษะสำหรับ AI (Claude Code, OpenAI Codex, DeepSeek Harness, Cursor & Windsurf) 
              ที่สอนให้ AI คิดแบบ Senior Designer กำหนดคาแรคเตอร์ โทนสี ฟอนต์ และจัดวางสัดส่วนให้โดดเด่นสะกดสายตา
            </p>

            {/* Quick Install Commands & Download row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {/* Command 1: npx skills add */}
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 text-xs font-mono text-slate-200 shadow-inner">
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">npx skills add oil-oil/oil-ui</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('npx skills add oil-oil/oil-ui', 'install')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white transition-colors shrink-0 flex items-center gap-1"
                  title="Copy command"
                >
                  {copiedInstallCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[11px] font-sans font-medium">{copiedInstallCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Command 2: git clone */}
              <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-purple-500/30 text-xs font-mono text-slate-200 shadow-inner">
                <div className="flex items-center gap-2 truncate">
                  <Code className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">git clone oil-oil/oil-ui.git</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText('git clone https://github.com/oil-oil/oil-ui.git', 'git')}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white transition-colors shrink-0 flex items-center gap-1"
                  title="Copy git clone"
                >
                  {copiedGitCmd ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[11px] font-sans font-medium">{copiedGitCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Download Skill Zip Button */}
              <a
                href="/skills/oil-ui-skill.zip"
                download="oil-ui-skill.zip"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all md:col-span-2 lg:col-span-1"
              >
                <Download className="w-4 h-4" />
                <span>Download Skill Package (.zip)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('works')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'works'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>97 Showcase Styles ({works.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playbooks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'playbooks'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>13 Playbooks & Guides</span>
          </button>

          <button
            onClick={() => setActiveTab('skill')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'skill'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Design Methodology (SKILL.md)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: 97 SHOWCASE STYLES                                */}
        {/* ======================================================== */}
        {activeTab === 'works' && (
          <div>
            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
              {/* Model pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedModel('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedModel === 'all'
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  All ({modelCounts['all']})
                </button>
                {uniqueModels.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      selectedModel === m
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {m} ({modelCounts[m]})
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อสไตล์ หรือ Keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Results counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
              <span>แสดงทั้งหมด <strong>{filteredWorks.length}</strong> สไตล์</span>
              <span className="text-[11px] text-slate-500">คลิกที่การ์ดเพื่อดูตัวอย่างแบบ Interactive และคัดลอก Master Prompt</span>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWorks.map((work, index) => (
                <div
                  key={work.slug}
                  onClick={() => openWorkModal(work)}
                  className="group relative rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Card Cover Image with aspect ratio */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={work.image}
                      alt={work.alt || work.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Model tag badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border backdrop-blur-md uppercase tracking-wider ${getModelBadge(
                          work.model
                        )}`}
                      >
                        {work.model}
                      </span>
                    </div>

                    {/* Live demo indicator badge if available */}
                    {work.live_url && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/80 text-white backdrop-blur-md shadow-sm">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          Live Demo
                        </span>
                      </div>
                    )}

                    {/* Hover quick action overlay */}
                    <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <span className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/40">
                        <Eye className="w-3.5 h-3.5" />
                        View & Copy Prompt
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
                          {work.title}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {work.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300">
                        <span>ดูสเปก & Prompt</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      {work.views && work.views.length > 0 && (
                        <span className="text-slate-500 font-mono">
                          {work.views.length + 1} views
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredWorks.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-base text-slate-400 mb-2">ไม่พบสไตล์ที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModel('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-xs font-semibold transition-colors"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: 13 PLAYBOOKS & GUIDES                             */}
        {/* ======================================================== */}
        {activeTab === 'playbooks' && (
          <div>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">13 Official Playbooks & Agent Guides</h2>
              <p className="text-sm text-slate-400">
                คู่มือการสั่ง AI Agent ออกแบบตั้งแต่หน้าแรก (Landing Page), แดชบอร์ดงานปฏิบัติการ (Dashboard), แอปมือถือ (Mobile), ไปจนถึงการล้างและปรับปรุงโค้ดโปรเจกต์เดิม (Renovation)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((g, idx) => (
                <div
                  key={g.slug}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 flex flex-col justify-between hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                        {g.category}
                      </span>
                      <span className="text-xs font-mono text-slate-500">#{String(idx + 1).padStart(2, '0')}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                      {g.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {g.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                    <a
                      href={`https://ui.oiloil.org${g.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>อ่านคู่มือฉบับเต็ม</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SKILL METHODOLOGY (SKILL.md)                      */}
        {/* ======================================================== */}
        {activeTab === 'skill' && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-10">
            <div className="max-w-4xl mx-auto space-y-10">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  SKILL PHILOSOPHY & WORKFLOW
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
                  หลักการคิด 5 ขั้นตอนของ Oil UI
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  &ldquo;先定下一句设计北极星，再让构图、字体、色彩、素材和交互都朝它靠拢，做出一眼认得出来的界面。克制是留下最有力量的选择、删掉没有贡献的元素，不是把所有风格磨成中庸。&rdquo;
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <h3 className="font-bold text-white text-base">探索并收敛方向 (Explore & Converge)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  ตอบ 3 คำถามก่อนลงมือ: หน้าตานี้คือของประเภทไหน (品类)? ผู้ใช้งานเข้ามาดูอะไรบน First Fold? และผลิตภัณฑ์ระดับแถวหน้าในวงการนี้ทำอย่างไร? เสนอ 3 สไตล์ที่มีความต่างทางสายตาชัดเจน
                </p>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-indigo-300">
                  Direction 1: Editorial & Craft &bull; Direction 2: Tactical & Data-Dense &bull; Direction 3: Kinetic & Immersive
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <h3 className="font-bold text-white text-base">建立视觉与交互结构 (Visual & Interaction Structure)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  คุม Hierarchy ของตัวอักษร สี สเปซ และการเคลื่อนไหว (Motion) ให้สอดคล้องกับคาแรคเตอร์ที่กำหนด ไม่ยัดเยียด Card Grid หากไม่จำเป็น
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <h3 className="font-bold text-white text-base">制作并取得实际证据 (Production & Empirical Proof)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  สร้างหน้าตัวแทนหรือโฟลว์หลักก่อนเสมอ ตรวจสอบบน Target Viewport จริง (Desktop 1440px / Mobile 390px) ตรวจสอบความถูกต้องของการตัดคำและลำดับสายตา
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <h3 className="font-bold text-white text-base">独立评审与修正 (Independent Blind Review)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ประเมินผลงานผ่านภาพสกรีนช็อตจริงโดยไม่ดูคำอธิบาย (Blind Visual Review) เพื่อทดสอบว่าหน้าจอสื่อสารหน้าที่และคุณค่าของแบรนด์ได้จริงโดยไม่ต้องอ่านคำชี้แจง
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500 text-white font-bold text-xs flex items-center justify-center">5</span>
                  <h3 className="font-bold text-white text-base">交付与使用 (Delivery & Integration)</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  นำผลงานไปใช้งานผ่าน Claude Code, Codex, Cursor หรือ Windsurf ได้ทันทีโดยติดตั้งคำสั่ง:
                </p>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 font-mono text-xs text-emerald-300 border border-emerald-500/30">
                  <span>npx skills add oil-oil/oil-ui</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText('npx skills add oil-oil/oil-ui', 'install')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-sans font-bold transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE DETAIL MODAL                                 */}
      {/* ======================================================== */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl rounded-3xl bg-[#091120] border border-white/15 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getModelBadge(selectedWork.model)}`}>
                  {selectedWork.model}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {selectedWork.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWork(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              {/* Left Column: Visual Preview / Live iframe (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950/90 p-4 sm:p-6 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10">
                {/* View switcher tabs */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setModalView('cover')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      modalView === 'cover'
                        ? 'bg-indigo-500 text-white shadow'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    Cover Overview
                  </button>

                  {selectedWork.views?.map((v, i) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setModalView(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        modalView === i
                          ? 'bg-indigo-500 text-white shadow'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      View {i + 1}
                    </button>
                  ))}

                  {selectedWork.live_url && (
                    <button
                      type="button"
                      onClick={() => setModalView('live')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        modalView === 'live'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Live Interactive Demo</span>
                    </button>
                  )}
                </div>

                {/* Preview Viewport Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900 min-h-[320px] sm:min-h-[420px] flex items-center justify-center shadow-inner">
                  {modalView === 'cover' && (
                    <img
                      src={selectedWork.image}
                      alt={selectedWork.title}
                      className="w-full h-full object-contain max-h-[480px]"
                    />
                  )}

                  {typeof modalView === 'number' && selectedWork.views && selectedWork.views[modalView] && (
                    <img
                      src={selectedWork.views[modalView]}
                      alt={`${selectedWork.title} View ${modalView + 1}`}
                      className="w-full h-full object-contain max-h-[480px]"
                    />
                  )}

                  {modalView === 'live' && selectedWork.live_url && (
                    <div className="w-full h-[480px] relative bg-white">
                      <iframe
                        src={selectedWork.live_url}
                        title={`${selectedWork.title} Live Preview`}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                      />
                      <a
                        href={selectedWork.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-950/80 text-white text-xs font-semibold flex items-center gap-1 shadow-lg hover:bg-slate-900 border border-white/20 transition-all"
                      >
                        <span>Open in New Tab</span>
                        <Maximize2 className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom external link pill */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>Slug: <code className="text-indigo-400">{selectedWork.slug}</code></span>
                  {selectedWork.live_url && (
                    <a
                      href={selectedWork.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <span>Direct Live Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Prompt & Metadata (5 cols) */}
              <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{selectedWork.title}</h3>
                    <p className="text-xs text-slate-400">{selectedWork.description}</p>
                  </div>

                  {/* Master Prompt Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" />
                        Original Design Prompt (English)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedWork.prompt_en || selectedWork.description, 'prompt')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPrompt ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="relative rounded-2xl bg-slate-950 border border-white/10 p-4 text-xs font-mono text-slate-300 leading-relaxed max-h-56 overflow-y-auto selection:bg-indigo-500 selection:text-white">
                      {selectedWork.prompt_en || selectedWork.description}
                    </div>
                  </div>

                  {/* Chinese Original Toggle */}
                  {selectedWork.prompt_zh && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowChineseOriginal(!showChineseOriginal)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 underline underline-offset-4"
                      >
                        <span>{showChineseOriginal ? 'ซ่อน' : 'แสดง'} ต้นฉบับภาษาจีน (Chinese Original)</span>
                      </button>

                      {showChineseOriginal && (
                        <div className="mt-2 rounded-2xl bg-slate-950/80 border border-white/10 p-3 text-xs text-slate-300 leading-relaxed relative">
                          <button
                            type="button"
                            onClick={() => handleCopyText(selectedWork.prompt_zh || '', 'zh')}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white"
                            title="Copy Chinese prompt"
                          >
                            {copiedChinese ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                          {selectedWork.prompt_zh}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Claude / Codex instruction tip */}
                  <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/20 p-3.5 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>วิธีนำไปสั่งงาน AI Agent:</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ก็อปปี้ Prompt ด้านบนไปใส่ใน Claude Code, Cursor หรือ Codex ควบคู่กับคำสั่ง{' '}
                      <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">npx skills add oil-oil/oil-ui</code>{' '}
                      เพื่อสร้าง UI เต็มรูปแบบ
                    </p>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyText(selectedWork.prompt_en || selectedWork.description, 'prompt')}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all"
                  >
                    {copiedPrompt ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPrompt ? 'คัดลอก Master Prompt เรียบร้อยแล้ว!' : 'คัดลอก Master Prompt ไปใช้งาน'}</span>
                  </button>

                  <a
                    href={`https://ui.oiloil.org/en/works/${selectedWork.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <span>ดูรายละเอียดบน Oil UI Official</span>
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
