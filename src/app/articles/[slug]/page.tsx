'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/types';
import { 
  ArrowLeft, Calendar, User, Eye, Share2, Check, 
  Sparkles, Tag, BookOpen, Clock, ChevronRight, Loader2
} from 'lucide-react';

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    }>
      <ArticleContent params={params} />
    </Suspense>
  );
}

function ArticleContent({ params }: { params: Promise<{ slug: string }> }) {
  const rawParams = use(params);
  const rawSlug = rawParams.slug || '';
  const decodedSlug = decodeURIComponent(rawSlug);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (!decodedSlug) return;
    Promise.all([
      fetch(`/api/articles/${encodeURIComponent(decodedSlug)}`).then(r => r.json()),
      fetch('/api/articles').then(r => r.json())
    ])
      .then(([resArticle, resList]) => {
        if (resArticle.success) {
          setArticle(resArticle.data);
        }
        if (resList.success) {
          setRecentArticles(resList.data.filter((a: Article) => 
            a.slug !== decodedSlug && a.slug !== rawSlug && a.id !== decodedSlug
          ).slice(0, 3));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [decodedSlug, rawSlug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080f1a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#080f1a] text-slate-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-[#101c2d] p-8 rounded-3xl border border-white/10 shadow-2xl">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">ไม่พบบทความนี้</h2>
          <p className="text-xs text-slate-400 mb-6">บทความที่คุณกำลังค้นหาอาจถูกย้าย หรือยังไม่เปิดเผยแพร่</p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-400/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้ารวมบทความ</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080f1a] text-slate-100 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่คลังบทความทั้งหมด</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              {article.category}
            </span>
            <span className="text-xs text-slate-400">
              📅 {new Date(article.createdAt).toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views.toLocaleString()} วิว
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed pt-1 border-l-2 border-amber-400 pl-4 font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Author & Share bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center font-bold text-amber-400 text-sm">
                K
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{article.authorName}</span>
                <span className="text-[11px] text-slate-400 block">AI Studio Director & Specialist</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-white/5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกลิงก์แล้ว!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>แชร์บทความ</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden mb-10 bg-slate-900 border border-white/10 shadow-2xl">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {/* Content Body */}
        <article className="bg-[#101c2d] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl prose prose-invert max-w-none prose-headings:text-white prose-h2:text-2xl prose-h2:font-bold prose-h3:text-xl prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 prose-strong:text-amber-300 prose-a:text-amber-400 prose-img:rounded-2xl prose-img:border prose-img:border-white/10">
          <div 
            dangerouslySetInnerHTML={{ __html: article.content }} 
            className="space-y-4"
          />
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-white/10">
            <Tag className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">แท็กที่เกี่ยวข้อง:</span>
            {article.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Section: Enroll to learn deeper */}
        <div className="my-12 p-8 rounded-3xl bg-gradient-to-r from-amber-400/10 via-[#101c2d] to-amber-400/5 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>สนใจเรียนรู้เทคนิค AI เจาะลึกกับ อ. Kevin แบบจับมือทำ?</span>
            </h3>
            <p className="text-xs text-slate-400">
              เลือกลงทะเบียนคลาสเรียน AI Content หรือ Private 1-on-1 เพื่อนำไปใช้กับงานจริงของคุณทันที
            </p>
          </div>
          <Link
            href="/booking"
            className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition shadow-lg shadow-amber-400/20"
          >
            ดูรอบและจองคลาสเรียน ↗
          </Link>
        </div>

        {/* Related Articles */}
        {recentArticles.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white">บทความที่คุณอาจสนใจ (Related Articles)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentArticles.map(rel => (
                <Link
                  key={rel.id}
                  href={`/articles/${encodeURIComponent(rel.slug)}`}
                  className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-amber-400/40 transition group space-y-2 block"
                >
                  <span className="text-[10px] text-amber-400 font-bold block">{rel.category}</span>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 line-clamp-2 transition-colors">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(rel.createdAt).toLocaleDateString('th-TH', { dateStyle: 'short' })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
