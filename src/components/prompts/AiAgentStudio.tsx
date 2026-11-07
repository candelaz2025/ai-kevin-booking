'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, Search, Copy, Check, Sliders, ChevronDown, CheckCircle2,
  Cpu, Terminal, ArrowRight, Wand2, RefreshCw, X, Download, Briefcase,
  AlertCircle, Layers, Flame, Bot, Send, FileCode, CheckCircle
} from 'lucide-react';
import occupationsList from '@/data/occupations-500.json';
import useCasesList from '@/data/ai-agent-400-usecases.json';

interface Occupation {
  id: string;
  titleTh: string;
  titleEn: string;
  category: string;
  painpoint: string;
  recommendedAi: string;
}

interface AgentUseCase {
  id: string;
  title: string;
  role: string;
  category: string;
  categoryKey: string;
  targetAi: string;
  occupations: string[];
  painpoint: string;
  deliverable: string;
  actionSteps: string[];
  fullPrompt: string;
  variables: Array<{
    key: string;
    label: string;
    defaultValue: string;
  }>;
}

const TARGET_AI_OPTIONS = [
  'Claude 3.7 Sonnet / Computer Use',
  'ChatGPT Plus / Operator & Actions',
  'DeepSeek-R1 (Deep Reasoning Agent)',
  'Gemini 2.0 Flash / Pro (Google AI)',
  'Perplexity Pro (Deep Research Agent)',
  'CrewAI / LangGraph (Multi-Agent System)',
  'n8n / Make.com (Autonomous Workflow)'
];

const ROLE_CONTEXT_OPTIONS = [
  'เจ้าของธุรกิจ / ผู้ประกอบการ SME',
  'ผู้บริหารระดับสูง (C-Level / MD / GM)',
  'ผู้จัดการฝ่าย / หัวหน้าทีม (Department Lead)',
  'พนักงานปฏิบัติการ / ผู้เชี่ยวชาญเฉพาะทาง',
  'ฟรีแลนซ์ / ผู้รับจ้างอิสระ (Freelancer)'
];

const DELIVERABLE_OPTIONS = [
  'Executive Dashboard + สรุป 3 ความเสี่ยง และ 5 การตัดสินใจเร่งด่วน',
  'คู่มือขั้นตอนการปฏิบัติงานมาตรฐาน (SOP) + Checklist ตรวจสอบ',
  'สคริปต์อัตโนมัติ / โค้ดโปรแกรมพร้อมใช้งานทันที',
  'ชุดอีเมลและข้อความสื่อสารเพื่อปิดการขายหรือเจรจาต่อรอง',
  'รายงานวิเคราะห์เปรียบเทียบข้อมูลเชิงลึก (In-depth Benchmark Report)',
  'ตารางคำนวณตัวเลข งบประมาณ และผลตอบแทนการลงทุน (ROI / Payback)'
];

export default function AiAgentStudio() {
  // Autocomplete state for 500+ occupations
  const [occupationSearch, setOccupationSearch] = useState('');
  const [selectedOccupation, setSelectedOccupation] = useState<Occupation | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Form state
  const [customOccupation, setCustomOccupation] = useState('');
  const [roleContext, setRoleContext] = useState(ROLE_CONTEXT_OPTIONS[0]);
  const [painpoint, setPainpoint] = useState('');
  const [targetAi, setTargetAi] = useState(TARGET_AI_OPTIONS[0]);
  const [desiredOutput, setDesiredOutput] = useState(DELIVERABLE_OPTIONS[0]);
  const [constraints, setConstraints] = useState('ถูกต้อง แม่นยำ รวดเร็ว และไม่มีการมโนข้อมูล (Zero Hallucination)');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 400 Catalog filtering state
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeCustomizeCase, setActiveCustomizeCase] = useState<AgentUseCase | null>(null);
  const [customizedVariables, setCustomizedVariables] = useState<Record<string, string>>({});
  const [displayCount, setDisplayCount] = useState(24);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter occupations for autocomplete
  const filteredOccupations = useMemo(() => {
    if (!occupationSearch.trim()) return occupationsList.slice(0, 8) as Occupation[];
    const q = occupationSearch.toLowerCase().trim();
    return (occupationsList as Occupation[]).filter(
      occ =>
        occ.titleTh.toLowerCase().includes(q) ||
        occ.titleEn.toLowerCase().includes(q) ||
        occ.category.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [occupationSearch]);

  // Handle selecting an occupation
  const handleSelectOccupation = (occ: Occupation) => {
    setSelectedOccupation(occ);
    setCustomOccupation(occ.titleTh);
    setOccupationSearch(occ.titleTh);
    setIsAutocompleteOpen(false);
    if (occ.painpoint) {
      setPainpoint(occ.painpoint);
    }
    if (occ.recommendedAi) {
      const match = TARGET_AI_OPTIONS.find(opt => opt.toLowerCase().includes(occ.recommendedAi.toLowerCase().split(' ')[0]));
      if (match) setTargetAi(match);
    }
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#fbbf24', '#34d399']
      });
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Form Submission -> AI Generate Prompt
  const handleGeneratePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOcc = selectedOccupation ? selectedOccupation.titleTh : (customOccupation.trim() || 'ผู้เชี่ยวชาญการทำงาน');
    if (!painpoint.trim()) {
      showToast('⚠️ กรุณาระบุ Pain Point หรือปัญหาที่ต้องการให้ AI Agent จัดการแทน');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/prompts/generate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupation: finalOcc,
          roleContext,
          painpoint,
          targetAi,
          desiredOutput,
          constraints
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setGeneratedPrompt(json.data);
        triggerConfetti();
        showToast('✨ เสก AI Agent Master Prompt สำเร็จเรียบร้อย!');
        // Scroll to result
        setTimeout(() => {
          document.getElementById('generated-prompt-result')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error(json.error || 'Failed to generate prompt');
      }
    } catch (err: any) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter 400 use cases
  const categoriesList = useMemo(() => {
    const cats = Array.from(new Set((useCasesList as AgentUseCase[]).map(c => c.category)));
    return ['all', ...cats];
  }, []);

  const filteredUseCases = useMemo(() => {
    let list = useCasesList as AgentUseCase[];

    // If an occupation is selected, boost/filter matching ones
    if (selectedOccupation) {
      const occKeywords = selectedOccupation.titleTh.split(/[\s(/)]+/).filter(w => w.length > 2);
      const matched = list.filter(item => 
        item.occupations.some(o => occKeywords.some(kw => o.includes(kw))) ||
        occKeywords.some(kw => item.category.includes(kw))
      );
      if (matched.length > 0 && selectedCategory === 'all' && !catalogSearch) {
        return matched;
      }
    }

    if (selectedCategory !== 'all') {
      list = list.filter(item => item.category === selectedCategory);
    }

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().trim();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.role.toLowerCase().includes(q) ||
        item.painpoint.toLowerCase().includes(q) ||
        item.deliverable.toLowerCase().includes(q) ||
        item.occupations.some(o => o.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, catalogSearch, selectedOccupation]);

  // Open customize modal
  const handleOpenCustomize = (useCase: AgentUseCase) => {
    setActiveCustomizeCase(useCase);
    const initialVars: Record<string, string> = {};
    useCase.variables.forEach(v => {
      initialVars[v.key] = v.defaultValue;
    });
    setCustomizedVariables(initialVars);
  };

  // Get active customized prompt text
  const customizedPromptText = useMemo(() => {
    if (!activeCustomizeCase) return '';
    let text = activeCustomizeCase.fullPrompt;
    Object.entries(customizedVariables).forEach(([key, val]) => {
      text = text.replaceAll(`{{${key}}}`, val || `{{${key}}}`);
    });
    return text;
  }, [activeCustomizeCase, customizedVariables]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('📋 คัดลอก Master Prompt ลงคลิปบอร์ดแล้ว!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadMarkdown = (title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'ai-agent-prompt'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('💾 ดาวน์โหลดไฟล์ .md เรียบร้อย!');
  };

  return (
    <div className="w-full space-y-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-2xl shadow-cyan-500/30 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* HERO SECTION: AI AGENT WORKFORCE GENERATOR               */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0c192c] via-[#091322] to-[#050b14] p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-gradient-to-bl from-cyan-500/15 via-blue-500/10 to-transparent blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI AGENT 400+ USE CASES & 500+ OCCUPATIONS</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            เสก Master Prompt สั่งการ{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-300 to-indigo-400">
              AI Agent ช่วยทำงานจริง
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl">
            ค้นหาจากคลัง <strong className="text-cyan-300">500+ อาชีพ</strong> พร้อมคลังตัวอย่าง{' '}
            <strong className="text-amber-300">400 Use Cases</strong> หรือใส่ปัญหาในการทำงาน (Pain Point) 
            ของคุณลงในแบบฟอร์ม เพื่อให้ AI สังเคราะห์ Master Prompt พร้อมตัวแปรและขั้นตอนปฏิบัติการที่นำไปสั่งงาน Claude 3.7, ChatGPT Operator หรือ AI Agent ได้ทันที
          </p>

          {/* ======================================================== */}
          {/* 500+ OCCUPATIONS AUTOCOMPLETE SEARCH BAR                */}
          {/* ======================================================== */}
          <div className="mb-8" ref={autocompleteRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>เลือกหรือพิมพ์ค้นหาอาชีพของคุณ (มีให้เลือกมากกว่า 500 อาชีพ)</span>
            </label>

            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-cyan-400/70 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={occupationSearch}
                  onChange={(e) => {
                    setOccupationSearch(e.target.value);
                    setCustomOccupation(e.target.value);
                    setIsAutocompleteOpen(true);
                  }}
                  onFocus={() => setIsAutocompleteOpen(true)}
                  placeholder="พิมพ์อาชีพ เช่น นักการตลาด, บัญชี, วิศวกร, ทนาย, แพทย์, เซลล์, Dev, ครู, ช่าง..."
                  className="w-full bg-[#101e33] border-2 border-cyan-500/30 hover:border-cyan-500/50 focus:border-cyan-400 text-white rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                />
                {occupationSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setOccupationSearch('');
                      setSelectedOccupation(null);
                      setCustomOccupation('');
                    }}
                    className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {isAutocompleteOpen && filteredOccupations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c1a2e] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden z-40 max-h-80 overflow-y-auto divide-y divide-white/5 backdrop-blur-xl">
                  <div className="px-4 py-2 bg-cyan-950/40 text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                    <span>ตรงกับคำค้นหา ({filteredOccupations.length} รายการ)</span>
                    <span className="text-slate-400">คลิกเพื่อเลือกอาชีพ</span>
                  </div>
                  {filteredOccupations.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => handleSelectOccupation(occ)}
                      className="w-full text-left px-4 py-3 hover:bg-cyan-500/15 flex items-center justify-between gap-3 transition-colors group"
                    >
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-cyan-300 flex items-center gap-2">
                          <span>{occ.titleTh}</span>
                          <span className="text-xs text-slate-400 font-normal">({occ.titleEn})</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-cyan-300">
                            {occ.category}
                          </span>
                          <span className="truncate max-w-md text-slate-400">
                            💡 Pain Point: {occ.painpoint}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected occupation pill */}
            {selectedOccupation && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">อาชีพที่เลือก:</span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedOccupation.titleTh}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOccupation(null);
                      setOccupationSearch('');
                      setCustomOccupation('');
                    }}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[11px] text-slate-400">
                  (ระบบจะแนะนำ Pain Point และกรอง Use Cases ที่เกี่ยวข้องด้านล่างให้อัตโนมัติ)
                </span>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* INTERACTIVE PAIN POINT FORM                              */}
          {/* ======================================================== */}
          <form onSubmit={handleGeneratePrompt} className="bg-[#091424] border border-cyan-500/20 rounded-2xl p-5 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Wand2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                ฟอร์มสร้าง AI Agent ตาม Pain Point ในการทำงานของคุณ
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role Context */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ระดับงาน / บริบทองค์กร (Role Context)
                </label>
                <select
                  value={roleContext}
                  onChange={(e) => setRoleContext(e.target.value)}
                  className="w-full bg-[#101c2d] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                >
                  {ROLE_CONTEXT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Target AI Engine */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  เครื่องมือ / แพลตฟอร์ม AI Agent ที่ต้องการสั่งงาน
                </label>
                <select
                  value={targetAi}
                  onChange={(e) => setTargetAi(e.target.value)}
                  className="w-full bg-[#101c2d] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                >
                  {TARGET_AI_OPTIONS.map((ai) => (
                    <option key={ai} value={ai}>{ai}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pain Point Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pain Point หรือปัญหาที่เจอ / งานที่ต้องทำซ้ำๆ เสียเวลามากที่สุด <span className="text-rose-400">*</span></span>
                </label>
                {selectedOccupation && (
                  <button
                    type="button"
                    onClick={() => setPainpoint(selectedOccupation.painpoint)}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    ใช้ปัญหาตัวอย่างของ {selectedOccupation.titleTh.split(' ')[0]}
                  </button>
                )}
              </div>

              <textarea
                rows={3}
                value={painpoint}
                onChange={(e) => setPainpoint(e.target.value)}
                placeholder="เช่น ต้องนั่งสรุปรายงานยอดขายจาก Excel 5 สาขาและเปรียบเทียบกับปีก่อนทุกวันจันทร์ เสียเวลา 4 ชม. อยากให้ AI ช่วยตรวจจับสาขาที่ยอดตกและเขียนสรุป Executive Summary ทันที..."
                className="w-full bg-[#101c2d] border border-white/10 focus:border-cyan-400 text-white rounded-xl p-3.5 text-xs sm:text-sm placeholder-slate-500 focus:outline-none transition-colors"
                required
              />

              {/* Quick sample chips */}
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">ตัวอย่างปัญหาคลิกใส่ได้ทันที:</span>
                {[
                  'ต้องรวบรวมไฟล์ Excel สรุปงบและตรวจจับความผิดปกติรายสัปดาห์',
                  'ตอบแชทลูกค้าตอบคำถามซ้ำๆ ปิดการขายไม่ทันนอกเวลาทำการ',
                  'เขียนบทความและทำคอนเทนต์ลงหลายแพลตฟอร์มทุกวันแต่หมดมุก',
                  'ตรวจทานสัญญาทางธุรกิจหลายฉบับ กลัวตกหล่นข้อกำหนดที่เสียเปรียบ',
                  'คัดเลือกเรซูเม่ผู้สมัครงานหลายร้อยคนเพื่อหาคนที่ตรงตามสเปก'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPainpoint(sample)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-[11px] text-slate-300 hover:text-cyan-300 border border-white/5 transition-colors"
                  >
                    + {sample.slice(0, 24)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Output & Constraints */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  รูปแบบผลลัพธ์ที่ต้องการ (Deliverable)
                </label>
                <select
                  value={desiredOutput}
                  onChange={(e) => setDesiredOutput(e.target.value)}
                  className="w-full bg-[#101c2d] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                >
                  {DELIVERABLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ข้อจำกัดเพิ่มเติม (Constraints)
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="เช่น ห้ามคิดเลขผิด, ใช้ภาษาไทยทางการ, ความยาวไม่เกิน 1 หน้า"
                  className="w-full bg-[#101c2d] border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ขับเคลื่อนด้วยสถาปัตยกรรม Prompt Engineering ระดับสากล</span>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-cyan-300/40 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังประมวลผลและสร้าง Master Prompt...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>⚡ เสก AI Agent Master Prompt ทันที</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ======================================================== */}
      {/* GENERATED PROMPT RESULT SECTION (SHOWS WHEN READY)        */}
      {/* ======================================================== */}
      {generatedPrompt && (
        <div id="generated-prompt-result" className="rounded-3xl border border-cyan-400/50 bg-[#0c182a] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>MASTER PROMPT CREATED</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {generatedPrompt.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                บทบาท: <strong className="text-cyan-300">{generatedPrompt.role}</strong> · ปรับให้เหมาะกับ: <strong className="text-amber-300">{generatedPrompt.targetAi}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleCopyText(generatedPrompt.masterPrompt, 'generated')}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 transition-all hover:scale-105"
              >
                {copiedId === 'generated' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'generated' ? 'คัดลอกแล้ว!' : 'คัดลอก Prompt'}</span>
              </button>

              <button
                onClick={() => handleDownloadMarkdown(generatedPrompt.title, generatedPrompt.masterPrompt)}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                title="ดาวน์โหลดเป็นไฟล์ .md"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">.md</span>
              </button>
            </div>
          </div>

          {/* Workflow Steps */}
          {generatedPrompt.steps && generatedPrompt.steps.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5">
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>ขั้นตอนการปฏิบัติการอัตโนมัติ (Execution Workflow)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {generatedPrompt.steps.map((step: string, sIdx: number) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {sIdx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Codebox */}
          <div className="relative rounded-2xl bg-[#070e18] border border-white/10 p-5 font-mono text-xs text-slate-200 overflow-x-auto max-h-[450px] overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-cyan-500 selection:text-slate-950">
            {generatedPrompt.masterPrompt}
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span>💡 วิธีใช้: ก๊อปปี้ข้อความข้างต้น นำไปแปะในหน้าแชทของ {generatedPrompt.targetAi} พร้อมแนบไฟล์หรือข้อมูลของคุณได้ทันที</span>
            <button
              onClick={() => {
                const dummyUseCase: AgentUseCase = {
                  id: 'gen_custom',
                  title: generatedPrompt.title,
                  role: generatedPrompt.role,
                  category: 'Custom AI Agent',
                  categoryKey: 'custom',
                  targetAi: generatedPrompt.targetAi,
                  occupations: [selectedOccupation?.titleTh || 'ผู้ใช้งาน AI'],
                  painpoint: generatedPrompt.painpoint,
                  deliverable: desiredOutput,
                  actionSteps: generatedPrompt.steps || [],
                  fullPrompt: generatedPrompt.masterPrompt,
                  variables: [
                    { key: 'COMPANY_OR_PROJECT', label: 'ชื่อบริษัท / โปรเจกต์', defaultValue: 'Kevin AI Enterprise' },
                    { key: 'PRIMARY_GOAL', label: 'เป้าหมายเฉพาะเจาะจง', defaultValue: generatedPrompt.title },
                    { key: 'INPUT_DATA', label: 'ข้อมูลนำเข้า', defaultValue: 'สรุปข้อมูลที่เกี่ยวข้อง' }
                  ]
                };
                handleOpenCustomize(dummyUseCase);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ปรับแต่งตัวแปรใน Prompt นี้</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: BROWSE 400 AI AGENT USE CASES CATALOG         */}
      {/* ======================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                คลัง 400 AI Agent Use Cases แยกตามสายงาน
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              เลือกดูเทมเพลตคำสั่งสั่งงาน AI Agent ที่ผ่านการทดสอบจริงแล้ว คัดลอกไปใช้ หรือปรับแต่งตัวแปรตามบริบทของคุณ
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="ค้นหา Use Case เช่น บัญชี, ยิงแอด, สัญญา..."
              className="w-full bg-[#101c2d] border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            {catalogSearch && (
              <button
                onClick={() => setCatalogSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categoriesList.map((cat) => {
            const isAll = cat === 'all';
            const count = isAll
              ? useCasesList.length
              : (useCasesList as AgentUseCase[]).filter(c => c.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setDisplayCount(24);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                    : 'bg-[#101c2d] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{isAll ? 'ทั้งหมด (400)' : cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-white/5 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Occupation Filter Notice */}
        {selectedOccupation && (
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              <span>
                กำลังแสดง Use Cases ที่คัดสรรสำหรับ <strong>{selectedOccupation.titleTh}</strong>
              </span>
            </div>
            <button
              onClick={() => setSelectedOccupation(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              แสดงทุกสายงาน
            </button>
          </div>
        )}

        {/* Use Cases Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUseCases.slice(0, displayCount).map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl border border-white/10 hover:border-cyan-400/50 bg-[#0e1929] p-5 shadow-xl hover:shadow-cyan-500/10 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-cyan-300 truncate max-w-[180px]">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[10px] font-bold">
                    {item.targetAi.split(' ')[0]}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
                  {item.title}
                </h4>

                <div className="text-[11px] font-medium text-slate-400 mb-3 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{item.role}</span>
                </div>

                {/* Pain point alert box */}
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 mb-3">
                  <div className="text-[10px] uppercase font-bold text-amber-400/80 mb-0.5">ปัญหาที่แก้ (Pain Point):</div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {item.painpoint}
                  </p>
                </div>

                {/* Deliverable preview */}
                <div className="text-xs text-slate-400 mb-4">
                  <span className="text-cyan-400 font-semibold">ผลลัพธ์:</span> {item.deliverable}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(item.fullPrompt, item.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-white/5 transition-colors"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'คัดลอกแล้ว' : 'คัดลอก Prompt'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenCustomize(item)}
                  className="py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>ปรับแต่ง</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {displayCount < filteredUseCases.length && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount(prev => prev + 24)}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-colors"
            >
              โหลดเพิ่มเติม ({filteredUseCases.length - displayCount} รายการที่เหลือ)
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* CUSTOMIZE PROMPT MODAL (LIVE VARIABLE EDITING)           */}
      {/* ======================================================== */}
      {activeCustomizeCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0b1626] border border-cyan-400/40 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 shrink-0">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase mb-1.5">
                  <Sliders className="w-3 h-3" />
                  <span>CUSTOMIZE AI AGENT PROMPT</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  ปรับแต่งตัวแปร: {activeCustomizeCase.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveCustomizeCase(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 overflow-y-auto space-y-6 grow pr-1">
              {/* Variable Inputs */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4" />
                  <span>ใส่ข้อมูลของคุณลงในตัวแปร (Live Placeholders)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeCustomizeCase.variables.map((v) => (
                    <div key={v.key}>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {v.label} <span className="text-slate-500">({`{{${v.key}}}`})</span>
                      </label>
                      <input
                        type="text"
                        value={customizedVariables[v.key] ?? v.defaultValue}
                        onChange={(e) => setCustomizedVariables({
                          ...customizedVariables,
                          [v.key]: e.target.value
                        })}
                        className="w-full bg-[#101e31] border border-white/10 focus:border-cyan-400 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>ตัวอย่าง Prompt ที่ปรับแต่งแล้ว (Live Master Prompt)</span>
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    พร้อมคัดลอกไปสั่งงาน
                  </span>
                </div>

                <div className="rounded-2xl bg-[#060c16] border border-white/10 p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
                  {customizedPromptText}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400">
                นำ Prompt นี้ไปสั่งงานใน <strong>{activeCustomizeCase.targetAi}</strong>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleDownloadMarkdown(activeCustomizeCase.title, customizedPromptText)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด .md</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCopyText(customizedPromptText, 'modal');
                    triggerConfetti();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-400/20 transition-all hover:scale-105"
                >
                  <Copy className="w-4 h-4" />
                  <span>คัดลอก Master Prompt ที่ปรับแต่งแล้ว</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
