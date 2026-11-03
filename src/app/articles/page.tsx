'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/types';
import { 
  BookOpen, Calendar, Clock, ArrowRight, Sparkles, 
  Search, Tag, ChevronRight, User, Eye, Share2, Check
} from 'lucide-react';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setArticles(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))];

  const filteredArticles = articles.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const featuredArticle = articles.find(a => a.featured) || articles[0];

  const handleShare = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/articles/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#080f1a] text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI KNOWLEDGE & INSIGHTS</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            คลังบทความและคู่มือ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">AI Studio</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            อัปเดตเทรนด์ AI Agent, เทคนิค Vibe Coding, เวิร์กโฟลว์การทำงานอัตโนมัติ และกรณีศึกษาจริงจาก อ. Kevin
          </p>
        </div>

        {/* Featured Article Hero (If available) */}
        {featuredArticle && !searchQuery && selectedCategory === 'all' && (
          <div className="mb-14">
            <Link 
              href={`/articles/${encodeURIComponent(featuredArticle.slug)}`}
              className="group block bg-[#101c2d] border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto min-h-[300px] lg:min-h-[420px] bg-slate-900 overflow-hidden">
                  <Image
                    src={featuredArticle.coverImage || '/assets/ai-content-workshop.avif'}
                    alt={featuredArticle.title}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-lg">
                    ⭐ บทความแนะนำ (FEATURED)
                  </div>
                </div>

                <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                        {featuredArticle.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(featuredArticle.createdAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-white group-hover:text-amber-400 transition-colors leading-snug">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {featuredArticle.tags.slice(0, 4).map(t => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                        K
                      </div>
                      <span>{featuredArticle.authorName}</span>
                    </div>

                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>อ่านบทความเต็ม</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          {/* Categories pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/5'
                }`}
              >
                {cat === 'all' ? 'ทั้งหมด (All)' : cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ค้นหาบทความ, เทคนิค..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#101c2d] rounded-2xl h-80 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-[#101c2d] border border-white/10 rounded-3xl">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">ไม่พบบทความที่ตรงกับการค้นหา</h3>
            <p className="text-xs text-slate-400">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map(article => (
              <Link
                key={article.id}
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className="group bg-[#101c2d] border border-white/10 hover:border-amber-400/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={article.coverImage || '/assets/ai-content-workshop.avif'}
                      alt={article.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-950/80 text-amber-300 backdrop-blur-md border border-white/10">
                        {article.category}
                      </span>
                      {article.authorName?.includes('Routine') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600/90 text-white backdrop-blur-md border border-purple-400/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>AI Routine</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(article.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' })}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        {article.views.toLocaleString()} อ่าน
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {article.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    โดย {article.authorName}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleShare(article.slug, e)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="คัดลอกลิงก์แชร์"
                  >
                    {copiedSlug === article.slug ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
