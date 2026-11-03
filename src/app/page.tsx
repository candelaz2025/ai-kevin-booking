'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Sparkles, Calendar, Clock, MapPin, Video, ArrowRight, 
  CheckCircle2, Users, Bot, Layers, ArrowUpRight, ShieldCheck, Mail, BookOpen, Gift, GraduationCap, ShoppingCart
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { ClassItem, SiteSettings, Article, formatClassDuration, isClassFree, CourseLevel, COURSE_LEVELS, getCourseLevelConfig } from '@/lib/types';
import CalendarPicker from '@/components/CalendarPicker';
import { getSafeCourseImageUrl } from '@/lib/image-utils';

export default function HomePage() {
  const { addItem, isInCart } = useCart();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassForCalendar, setSelectedClassForCalendar] = useState<ClassItem | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'all' | CourseLevel>('all');

  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setClasses(data.data);
          setSelectedClassForCalendar(data.data[0]);
        }
      });

    fetch('/api/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSiteSettings(data.data);
        }
      })
      .catch(console.error);

    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setArticles(data.data);
        }
      })
      .catch(console.error);

    // Capture referral code (?ref=CODE) from visitor URL
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref');
        if (refParam) {
          localStorage.setItem('kevin_ai_referrer', refParam.trim());
        }
      } catch {}
    }
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Optional Announcement Banner */}
      {siteSettings?.showAnnounceBanner !== false && siteSettings?.announceText && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-blue-500/20 border-b border-amber-400/20 py-2.5 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>{siteSettings.announceText}</span>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow & Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-400/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                {siteSettings?.heroBadge || 'WORKSHOP & PRIVATE 1-ON-1 · ลงมือทำจริงในคลาส'}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-white">
                  {siteSettings?.heroTitleGradient || 'AI CONTENT & AGENTS'}
                </span>
                <br />
                {siteSettings?.heroTitleMain || 'ทำคอนเทนต์และระบบ AI ในคลาสเดียว'}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl whitespace-pre-line">
                {siteSettings?.heroDescription || 'วางแผนคอนเทนต์รายวัน คิดและเขียนด้วย ChatGPT สร้างภาพและคอนเทนต์ด้วย Meta AI พร้อมต่อยอดเวิร์กโฟลว์ AI Agent ด้วย Grok Bot และเปิดรับจองคลาสส่วนตัว 1-on-1 กับ อ. Kevin'}
              </p>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {(siteSettings?.heroTags || [
                  '01 Content Strategy',
                  '02 AI Image & Video',
                  '03 Agent Workflow',
                  '04 1-on-1 Online'
                ]).map((tag, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-300">
                    <strong className="text-amber-400 mr-1.5">{String(idx + 1).padStart(2, '0')}</strong> {tag.replace(/^\d+\s*/, '')}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/booking"
                  className="px-8 py-4 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-400/25 hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-2 group text-sm"
                >
                  <span>{siteSettings?.heroCtaButtonText || 'จองคลาสเรียนออนไลน์ / ดูตารางว่าง'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#classes"
                  className="px-7 py-4 rounded-xl font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-center transition-all text-sm"
                >
                  ดูคลาสทั้งหมด
                </a>
              </div>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                <span>✦ สอนโดย {siteSettings?.instructorName || 'อ. Kevin'}</span>
                <span>•</span>
                <span>แล็ปท็อปเพื่อฝึกปฏิบัติในคลาส</span>
                <span>•</span>
                <span>แจ้งเตือนผ่าน Email อัตโนมัติ</span>
              </div>

            </div>

            {/* Right Poster Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md rounded-3xl overflow-hidden border border-white/15 bg-slate-900 shadow-2xl group">
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={siteSettings?.heroPosterImage || '/assets/ai-content-workshop.avif'}
                    alt="โปสเตอร์ AI Content Workshop"
                    fill
                    priority
                    unoptimized
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>
                
                {/* Float Card Top */}
                <div className="absolute top-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      ✦
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{siteSettings?.brandName || 'AI Creator Workshop'}</div>
                      <div className="text-[10px] text-slate-400">Idea → Content → Publish</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {siteSettings?.heroPriceTag || '499 บาท'}
                  </span>
                </div>

                {/* Float Card Bottom */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>{siteSettings?.heroSeatLimit || 'รับเพียง 20 ที่นั่ง / เวิร์กช็อป 3 ชม.'}</span>
                  </div>
                  <Link
                    href="/booking?classId=ai-content-workshop"
                    className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition"
                  >
                    จองเลย
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* Classes Section */}
      <section id="classes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block mb-1">
              ALL COURSES & WORKSHOPS
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              คลาสเรียน AI และเวิร์กช็อปที่มีให้เลือก
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              ครอบคลุมทั้งแบบ Onsite เวิร์กช็อปร่วมกัน และคลาสออนไลน์ส่วนตัว 1-on-1 สำหรับเจาะลึกเฉพาะทาง
            </p>
          </div>
          <Link
            href="/booking"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 group"
          >
            <span>ดูตารางว่างใน Calendar</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Course Difficulty Level Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none flex-wrap">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>ระดับความยาก:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedLevelFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              selectedLevelFilter === 'all'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-white/25'
            }`}
          >
            ทั้งหมด ({classes.length})
          </button>
          {(['beginner', 'intermediate', 'advanced'] as CourseLevel[]).map(lvlKey => {
            const cfg = COURSE_LEVELS[lvlKey];
            const isSelected = selectedLevelFilter === lvlKey;
            const count = classes.filter(c => (c.level || 'beginner') === lvlKey).length;
            return (
              <button
                key={lvlKey}
                type="button"
                onClick={() => setSelectedLevelFilter(lvlKey)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? `${cfg.badgeClass} ring-2 ring-amber-400 font-bold shadow-md`
                    : 'bg-slate-900 border border-white/10 text-slate-300 hover:border-white/25'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                <span>ระดับ{cfg.label}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {(() => {
          const displayClasses = selectedLevelFilter === 'all' 
            ? classes 
            : classes.filter(c => (c.level || 'beginner') === selectedLevelFilter);

          if (displayClasses.length === 0) {
            return (
              <div className="p-12 rounded-3xl bg-[#101c2d] border border-white/10 text-center space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">ไม่พบคลาสเรียนในระดับนี้</h4>
                <p className="text-xs text-slate-400">
                  คุณสามารถเลือกกด &quot;ทั้งหมด&quot; เพื่อดูหลักสูตรและคลาสเรียนทั้งหมดที่มีเปิดสอนได้ครับ
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedLevelFilter('all')}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition"
                >
                  แสดงคลาสเรียนทั้งหมด
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayClasses.map((c) => {
                const isOnline = c.type === 'online';
                const levelConfig = getCourseLevelConfig(c.level);
                return (
                  <div
                    key={c.id}
                    className="bg-[#101c2d] border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                        {(() => {
                          const imgSrc = getSafeCourseImageUrl(c.image);
                          const isDataUrl = imgSrc.startsWith('data:');
                          return (
                            <Image
                              src={imgSrc}
                              alt={c.title}
                              fill
                              unoptimized={isDataUrl}
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          );
                        })()}
                        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isOnline ? 'bg-emerald-500/90 text-slate-950' : 'bg-amber-400 text-slate-950'
                          }`}>
                            {isOnline ? '🌐 คลาสออนไลน์สด' : '🏢 Onsite Workshop'}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg backdrop-blur-md ${levelConfig.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${levelConfig.dotColor}`} />
                            <span>{levelConfig.label}</span>
                          </span>
                          {isClassFree(c) ? (
                            <span className="bg-emerald-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                              <Gift className="w-3 h-3 text-slate-950" />
                              เรียนฟรี (FREE)
                            </span>
                          ) : (
                            <span className="bg-slate-950/85 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              รับ +{c.rewardPoints ?? Math.round(c.price / 10)} แต้ม
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                {formatClassDuration(c)}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${levelConfig.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${levelConfig.dotColor}`} />
                                <span>ระดับ{levelConfig.label}</span>
                              </span>
                            </div>
                            <div>
                              {isClassFree(c) ? (
                                <span className="text-xl font-black text-emerald-400">
                                  ฟรี <small className="text-xs font-normal text-slate-300">(0 บาท)</small>
                                </span>
                              ) : (
                                <span className="text-xl font-extrabold text-amber-400">
                                  {c.price.toLocaleString()} <small className="text-xs font-normal text-slate-300">บาท</small>
                                </span>
                              )}
                            </div>
                          </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {c.title}
                      </h3>
                      {c.subtitle && (
                        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                          {c.subtitle}
                        </p>
                      )}
                      {c.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-3 mt-1.5 leading-relaxed whitespace-pre-line">
                          {c.description}
                        </p>
                      )}
                    </div>

                    {/* Topics bullet (สิ่งที่ได้รับ) */}
                    {(() => {
                      const displayTopics = (() => {
                        if (Array.isArray(c.topics) && c.topics.length > 0) {
                          const valid = c.topics.filter(t => t && !t.includes('หัวข้อที่ 1') && !t.includes('หัวข้อที่ 2'));
                          if (valid.length > 0) return valid;
                        }
                        if (c.description) {
                          const lines = c.description.split('\n').map(l => l.trim()).filter(Boolean);
                          const extracted: string[] = [];
                          let inTargetSection = false;
                          for (const l of lines) {
                            if (/^(🎯|🎁|✅|หัวข้อ|สิ่งที่คุณจะได้เรียนรู้|สิ่งที่ได้รับ|สิ่งที่จะได้เรียน|เรียนจบแล้ว)/.test(l)) {
                              inTargetSection = true;
                              continue;
                            }
                            if (inTargetSection && /^(👨‍💻|📅|🕐|📍|💰|👥|💻|📝|✨)/.test(l)) {
                              inTargetSection = false;
                              continue;
                            }
                            if (/^(\d+[\.\)]|[-*•✦✅]|(\d{2}\s+[A-Z]+:))/.test(l)) {
                              const clean = l.replace(/^[-*•✦✅\d.)\s]+/, '').trim();
                              if (clean && !extracted.includes(clean)) extracted.push(clean);
                            } else if (inTargetSection && l.length > 5 && l.length < 120 && !l.includes('http')) {
                              if (!extracted.includes(l)) extracted.push(l);
                            }
                          }
                          if (extracted.length > 0) return extracted;
                        }
                        return c.topics || [];
                      })();

                      if (!displayTopics || displayTopics.length === 0) return null;

                      return (
                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-slate-300">สิ่งที่ได้รับ:</span>
                            {displayTopics.length > 3 && (
                              <span className="text-[10px] text-amber-400 font-mono font-medium">
                                ({displayTopics.length} ข้อ)
                              </span>
                            )}
                          </div>
                          {displayTopics.slice(0, 4).map((topic, i) => (
                            <div key={i} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-amber-400 text-[10px] mt-0.5 shrink-0">✦</span>
                              <span className="line-clamp-1 break-words">{topic}</span>
                            </div>
                          ))}
                          {displayTopics.length > 4 && (
                            <div className="text-[10px] text-amber-400/90 font-medium pl-4 pt-0.5">
                              + อีก {displayTopics.length - 4} สิ่งที่จะได้รับ
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Tools */}
                    {c.toolsUsed && c.toolsUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {c.toolsUsed.map((tool, i) => (
                          <span key={i} className="text-[10px] bg-slate-900 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <Link
                    href={`/booking?classId=${c.id}`}
                    className={`sm:col-span-8 py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 ${
                      isClassFree(c)
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                    }`}
                  >
                    <span>{isClassFree(c) ? 'ลงทะเบียนเรียนฟรี' : 'เลือกรอบเรียน'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const defaultDate = c.availableDates?.length > 0 ? c.availableDates[0] : new Date().toISOString().slice(0, 10);
                      const defaultSlot = c.timeSlots?.length > 0 ? c.timeSlots[0] : '13:00 - 16:00';
                      addItem({
                        classId: c.id,
                        classTitle: c.title,
                        subtitle: c.subtitle,
                        classType: c.type,
                        price: isClassFree(c) ? 0 : c.price,
                        isFree: isClassFree(c),
                        rewardPoints: c.rewardPoints ?? Math.round((c.price || 0) / 10),
                        image: c.image,
                        date: defaultDate,
                        timeSlot: defaultSlot,
                        durationText: formatClassDuration(c),
                        level: c.level || 'beginner'
                      });
                      alert(`🛒 เพิ่ม "${c.title}" ลงในตะกร้าเรียบร้อย!`);
                    }}
                    className={`sm:col-span-4 py-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                      isInCart(c.id)
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-white/10 hover:border-amber-400/30'
                    }`}
                    title="เพิ่มคอร์สนี้ลงในตะกร้า"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isInCart(c.id) ? 'ในตะกร้า' : '+ ตะกร้า'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    })()}
  </section>

      {/* Interactive Calendar Section */}
      <section id="schedule" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#111f32] to-[#0d1725] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
                AVAILABILITY & CALENDAR
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                ตรวจสอบวันและรอบเวลาว่างของ อ. Kevin
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                คลิกเลือกวันที่ในปฏิทินที่มีจุดสีทองเพื่อดูรอบเวลาว่าง และสามารถคลิกเพื่อไปยังหน้าชำระเงินและยืนยันการจองได้ทันที
              </p>

              {/* Class switcher buttons */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-300 block">สลับดูตารางตามคลาส:</span>
                {classes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassForCalendar(c)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                      selectedClassForCalendar?.id === c.id
                        ? 'bg-amber-400/10 border-amber-400 text-white font-bold'
                        : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="truncate mr-2">{c.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono">
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                        +{c.rewardPoints ?? Math.round(c.price / 10)} pts
                      </span>
                      <span className="text-amber-400">{c.price.toLocaleString()} ฿</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4">
                <Link
                  href={selectedClassForCalendar ? `/booking?classId=${selectedClassForCalendar.id}` : '/booking'}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-400/20 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ไปหน้าจองคลาสและระบุผู้เรียน</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <CalendarPicker
                selectedClass={selectedClassForCalendar}
                onSelectSlot={(date, slot) => {
                  if (selectedClassForCalendar) {
                    window.location.href = `/booking?classId=${selectedClassForCalendar.id}&date=${date}&slot=${encodeURIComponent(slot)}`;
                  }
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Workflow / Curriculum section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">PRACTICAL WORKFLOW</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">เวิร์กโฟลว์ปฏิบัติจริงในคลาส</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            เรียนรู้ลำดับการทำงานด้วยเครื่องมือ AI และวางแผนต่อเนื่องอย่างเป็นรูปธรรม
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { num: '01', title: 'หาไอเดียและเขียนสคริปต์', desc: 'เริ่มจากแนวคิดและบท ด้วย ChatGPT', icon: '💡' },
            { num: '02', title: 'สร้างภาพและตัวละคร', desc: 'เตรียมภาพและคอนเทนต์ด้วย Meta AI', icon: '🖼️' },
            { num: '03', title: 'AI Agent + Grok Bot', desc: 'ต่อยอดเวิร์กโฟลว์อัตโนมัติ', icon: '🤖' },
            { num: '04', title: 'ตัดต่อและองค์ประกอบ', desc: 'จัดภาพ วิดีโอ ซับไตเติลให้พร้อมดู', icon: '🎬' },
            { num: '05', title: 'วางแผนและโพสต์', desc: 'จัดตารางด้วย Notion Calendar', icon: '🗓️' },
          ].map((step, idx) => (
            <div key={idx} className="bg-[#101c2d] border border-white/10 rounded-2xl p-5 space-y-3 relative group hover:border-amber-400/40 transition">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm border border-white/5">
                {step.num}
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Articles & Insights Section */}
      <section id="articles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>AI KNOWLEDGE & INSIGHTS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              บทความและคู่มือ AI ล่าสุด
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              อัปเดตเทคนิค AI Agent, กลยุทธ์คอนเทนต์ และความรู้ใหม่ๆ จาก อ. Kevin
            </p>
          </div>
          <Link
            href="/articles"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 group bg-slate-900 border border-white/10 px-4 py-2 rounded-xl hover:border-amber-400/40 transition"
          >
            <span>ดูบทความทั้งหมด {articles.length > 0 && `(${articles.length})`}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-10 text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm">กำลังโหลดบทความล่าสุด...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.slice(0, 3).map((article) => (
              <Link
                key={article.id}
                href={`/articles/${encodeURIComponent(article.slug)}`}
                className="group bg-[#101c2d] border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
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
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-950/85 text-amber-300 backdrop-blur-md border border-white/10 shadow-sm">
                        {article.category}
                      </span>
                    </div>
                    {article.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md">
                          ⭐ แนะนำ
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{new Date(article.createdAt).toLocaleDateString('th-TH', { dateStyle: 'medium' })}</span>
                      <span>•</span>
                      <span>{article.authorName}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    อ่าน 3 นาที
                  </span>
                  <span className="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    อ่านบทความ <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About Instructor & Venue Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase">
              {siteSettings?.instructorTitle || 'INSTRUCTOR PROFILE'}
            </span>
            <h3 className="text-2xl font-bold text-white">
              {siteSettings?.instructorName || 'สอนโดย อ. Kevin'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {siteSettings?.instructorBio || 'ผู้เชี่ยวชาญด้าน Generative AI, Automation Agent และ Digital Content Strategy ผู้ถ่ายทอดการนำ AI Tools (ChatGPT, Claude, Meta AI, Grok Bot) มาช่วยทุ่นแรงทำงานได้จริงและผลิตผลงานได้ทุกวันแบบจับมือทำ'}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              {(siteSettings?.instructorTags || [
                'AI Content Workflow',
                'AI Agent Architecture',
                'Private Mentoring'
              ]).map((t, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-900 rounded-lg border border-white/5">
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase">
              {siteSettings?.venueTitle || 'VENUE & FACILITY'}
            </span>
            <h3 className="text-2xl font-bold text-white">
              {siteSettings?.venueName || 'NEXUS Bangkok Downtown Campus'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {siteSettings?.venueAddress || 'ชั้น 6 M Academy, อาคารบิ๊กซี ราชดำริ, 97/11 ถนนราชดำริ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ 10330 เดินทางสะดวกใกล้ BTS ชิดลม และ BTS สยาม'}
            </p>
            <div className="pt-2">
              <a
                href={siteSettings?.venueMapUrl || 'https://maps.app.goo.gl/YDMbfMh7aRcPyvTb7?g_st=ic'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1.5"
              >
                <span>เปิดตำแหน่งใน Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 rounded-3xl p-8 sm:p-12 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black tracking-widest uppercase bg-slate-950/10 px-2.5 py-1 rounded-md">
              {siteSettings?.finalCtaBadge || 'LIMITED SEATS & SLOTS'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">
              {siteSettings?.finalCtaTitle || 'พร้อมต่อยอดไอเดียให้เป็นคอนเทนต์และระบบ AI แล้วหรือยัง?'}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-800">
              {siteSettings?.finalCtaDescription || 'จองง่ายผ่านระบบออนไลน์ ชำระผ่าน QR Code หรือบัตรเครดิต รับการยืนยันทาง Email ทันที'}
            </p>
          </div>

          <Link
            href="/booking"
            className="px-8 py-4 rounded-xl font-black text-white bg-slate-950 hover:bg-slate-900 shadow-xl transition-all shrink-0 text-sm flex items-center gap-2 hover:scale-105 cursor-pointer"
          >
            <span>{siteSettings?.finalCtaButtonText || 'จองคลาสเรียนทันที'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
