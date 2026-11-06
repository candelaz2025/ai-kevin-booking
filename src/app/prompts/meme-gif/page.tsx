'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import memeData from '@/data/meme-gif-200.json';
import {
  Sparkles, Copy, Check, Search, ArrowRight, Dices, ExternalLink,
  Flame, Film, Layers, Bot, Sliders, RefreshCw, X, ChevronRight,
  Smile, Laugh, Info, CheckCircle2, Bookmark
} from 'lucide-react';

interface MemeItem {
  id: string;
  code: string;
  category: string;
  badge: string;
  titleTh: string;
  titleEn: string;
  caption: string;
  motion: string;
  prompt: string;
  tags: string[];
}

export default function MemeGifPromptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<MemeItem | null>(null);
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);

  // Extract distinct categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(memeData.map((item) => item.category)));
    return ['all', ...list];
  }, []);

  // Filtered meme items
  const filteredItems = useMemo(() => {
    return memeData.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.titleTh.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.caption.toLowerCase().includes(q) ||
        item.prompt.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  // Copy handler
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2200);
  }, []);

  // Random meme picker
  const handleRandomPick = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    const randomIndex = Math.floor(Math.random() * memeData.length);
    const chosen = memeData[randomIndex];
    setActiveModalItem(chosen);
  }, []);

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 pb-24">
      {/* Hero Header */}
      <div className="relative border-b border-white/10 bg-gradient-to-b from-[#0e1726] to-[#070d19] pt-12 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/10 via-purple-500/10 to-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto space-y-6 text-center">
          {/* Breadcrumb & Pill */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/prompts"
              className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
            >
              <span>Prompts</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              ChatGPT Image 2.6 Special Edition
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2.5 py-0.5 rounded-full">
              220+ Presets
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Meme GIF Animation Prompt Studio
            <span className="block text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 mt-2">
              คลัง 200+ Prompt เจนมีม GIF แอนิเมชันลูป สำหรับ ChatGPT Image 2.6
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            รวมสูตรเขียน Prompt ระดับมือโปรเพื่อสั่ง <strong>ChatGPT Image 2.6</strong> เจนภาพสติกเกอร์มีมและสร้างแอนิเมชันลูปแบบต่อเนื่อง (Seamless Looping GIF / Sticker Art) 
            มีมสนุก กวน ตลก คมชัด พร้อมองค์ประกอบท่าทางการเคลื่อนไหวภาษาอังกฤษที่โมเดลเข้าใจได้เป๊ะ 100%
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRandomPick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition"
            >
              <Dices className="w-4 h-4" />
              <span>สุ่มมีม GIF ไอเดียฮิต (Randomize)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFormulaGuide(!showFormulaGuide)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-white/10 flex items-center gap-2 transition"
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>{showFormulaGuide ? 'ซ่อนโครงสร้าง Prompt' : 'ดูโครงสร้างสูตร Prompt ChatGPT 2.6'}</span>
            </button>

            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <span>เปิด ChatGPT</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Collapsible Formula Guide */}
          {showFormulaGuide && (
            <div className="mt-6 max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-400/30 text-left space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  สูตรโครงสร้างการสั่ง ChatGPT Image 2.6 สร้างมีม GIF
                </span>
                <button
                  type="button"
                  onClick={() => setShowFormulaGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/60 border border-white/5">
                  <p className="font-bold text-white text-sm">💡 4 องค์ประกอบสำคัญใน Prompt</p>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    <li><strong className="text-amber-300">Style:</strong> Sticker art, bold vector outline, transparent background aesthetic</li>
                    <li><strong className="text-emerald-300">Action & Reaction:</strong> บอกสีหน้า อารมณ์ และกิริยาท่าทางที่เวอร์เกินจริง (Exaggerated facial expression)</li>
                    <li><strong className="text-cyan-300">Motion Cue:</strong> บรรยายจังหวะการขยับ เช่น slides back, typing rapidly, steam rising</li>
                    <li><strong className="text-purple-300">Loop Tag:</strong> คำว่า &quot;seamless loop&quot;, &quot;looping GIF animation&quot;, &quot;comic sticker sheet&quot;</li>
                  </ul>
                </div>

                <div className="space-y-2 p-3.5 rounded-xl bg-slate-800/60 border border-white/5">
                  <p className="font-bold text-white text-sm">🎯 เคล็ดลับการแปลงเป็น GIF ขยับได้</p>
                  <p className="text-slate-300 leading-relaxed">
                    1. ป้อน Prompt ภาษาอังกฤษที่เตรียมไว้ให้ใน ChatGPT Image 2.6<br/>
                    2. สั่งต่อ: <em className="text-amber-300">&quot;Now generate 4 sequential frames for a 1-second animated GIF cycle&quot;</em><br/>
                    3. หรือนำภาพสติกเกอร์ที่ได้ไปส่งเข้า Kling / Runway Gen-3 / Luma หรือ Ezgif เพื่อแปลงเป็นไฟล์ .GIF พร้อมส่งใน LINE และ Discord ได้ทันที!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-2xl bg-[#0d1627] border border-white/10 shadow-lg">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อมีม, ภาษาไทย, English, หรือแท็ก..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
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

          {/* Result Count and Clear */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>แสดง <strong>{filteredItems.length}</strong> จาก <strong>{memeData.length}</strong> แบบ</span>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-amber-400 hover:underline font-semibold"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {/* Category Chips Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'all' ? '🔥 ทั้งหมด (All 220+)' : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900/80 text-slate-300 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid of Meme Prompts */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 p-8 rounded-3xl bg-[#0d1627] border border-white/5 space-y-3">
            <Smile className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">ไม่พบมีมที่ตรงกับคำค้นหา</h3>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              ดูทั้งหมด 220 แบบ
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#0d1627] border border-white/10 hover:border-amber-400/40 p-5 space-y-4 shadow-xl hover:shadow-2xl hover:shadow-black/60 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header badge & code */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-white/5">
                        {item.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{item.code}
                      </span>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.titleTh}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {item.titleEn}
                      </p>
                    </div>

                    {/* Situation Caption */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        สถานการณ์ / จังหวะมีม:
                      </span>
                      <p className="text-xs text-slate-200 font-medium leading-snug">
                        &quot;{item.caption}&quot;
                      </p>
                    </div>

                    {/* Motion Cue */}
                    <div className="text-xs text-slate-400">
                      <span className="text-amber-400 font-semibold">การเคลื่อนไหวลูป:</span> {item.motion}
                    </div>

                    {/* English Prompt Preview */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1.5 relative group/code">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-mono">ChatGPT Image 2.6 Prompt:</span>
                        <span className="text-[9px] text-slate-500">English Prompt</span>
                      </div>
                      <p className="text-[11px] font-mono text-emerald-300 line-clamp-3 leading-relaxed">
                        {item.prompt}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-white/5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.prompt, item.id)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm shadow-amber-400/20'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>คัดลอกสำเร็จ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอก Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModalItem(item)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 transition"
                      title="ดูรายละเอียดและปรับแต่ง"
                    >
                      <span>รายละเอียด</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#0e1726] border border-amber-400/30 p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-white/5">
                    {activeModalItem.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    #{activeModalItem.code}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {activeModalItem.titleTh}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  {activeModalItem.titleEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Situation & Motion Details */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  สถานการณ์ / จังหวะมีม (Meme Context):
                </span>
                <p className="text-sm font-medium text-amber-300 mt-1">
                  &quot;{activeModalItem.caption}&quot;
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  รูปแบบการเคลื่อนไหวแบบลูป (Looping Motion):
                </span>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
                  {activeModalItem.motion}
                </p>
              </div>

              {/* Full English Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    ChatGPT Image 2.6 Full Prompt:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">พร้อมคัดลอกใช้งาน</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs sm:text-sm text-emerald-300 leading-relaxed select-all">
                  {activeModalItem.prompt}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {activeModalItem.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-white/5"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleCopy(activeModalItem.prompt, activeModalItem.id)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg ${
                  copiedId === activeModalItem.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                }`}
              >
                {copiedId === activeModalItem.id ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>คัดลอก Prompt เรียบร้อยแล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>คัดลอก Prompt นี้</span>
                  </>
                )}
              </button>

              <a
                href="https://chatgpt.com/"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-white/10 transition"
              >
                <span>ไปวางใน ChatGPT</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
