'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ClassItem, LessonModule, formatClassDuration } from '@/lib/types';
import { getSafeCourseImageUrl } from '@/lib/image-utils';
import { 
  Play, CheckCircle2, Clock, BookOpen, BarChart3, 
  Calendar, FileText, Download, ArrowRight, Sparkles, ChevronRight,
  ShieldCheck, Smartphone, Laptop, Award, Loader2
} from 'lucide-react';

export default function CourseOverviewPage({ params }: { params: Promise<{ classId: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070d18] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <CourseOverviewContent params={params} />
    </Suspense>
  );
}

function CourseOverviewContent({ params }: { params: Promise<{ classId: string }> }) {
  const router = useRouter();
  const rawParams = use(params);
  const classId = decodeURIComponent(rawParams.classId || '');

  const [course, setCourse] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/classes/${classId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setCourse(json.data);
        } else {
          // Fallback fetch all classes
          const listRes = await fetch('/api/classes');
          const listJson = await listRes.json();
          if (Array.isArray(listJson)) {
            const found = listJson.find((c: ClassItem) => c.id === classId);
            if (found) {
              setCourse(found);
            } else {
              setError('ไม่พบคอร์สเรียนที่ระบุ');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลคอร์สเรียน');
      } finally {
        setLoading(false);
      }
    }

    if (classId) {
      loadData();
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d18] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-medium">กำลังโหลดข้อมูลคอร์สเรียน...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#070d18] text-white flex flex-col justify-between">
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{error || 'ไม่พบคอร์สเรียน'}</h2>
          <p className="text-slate-400 text-sm">ไม่พบคอร์สเรียนที่คุณกำลังค้นหา อาจถูกย้ายหรือลบออกจากระบบแล้ว</p>
          <div className="pt-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
            >
              <span>ดูคอร์สเรียนทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const lessons: LessonModule[] = course.lessons && course.lessons.length > 0
    ? course.lessons
    : [
        {
          id: 'les-main',
          title: 'วิดีโอบทเรียนหลักประจำคอร์ส',
          duration: course.durationValue ? `${course.durationValue} ชม.` : '120 นาที',
          videoUrl: course.videoUrl || 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
          summary: course.subtitle || course.description
        }
      ];

  const totalLessonsCount = lessons.length;
  const courseDurationFormatted = formatClassDuration(course);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* HERO / HEADER SECTION */}
      <div className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 bg-gradient-to-b from-[#0a1220] via-[#070b14] to-[#070b14] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Content Column */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Link href="/booking" className="hover:text-emerald-400 transition">หมวดหมู่</Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-200">
                  {course.toolsUsed?.[0] || 'Vibe Coding'}
                </span>
              </div>

              {/* Top Highlight Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                <span>★ คอร์สหลัก • แนะนำให้เริ่มที่นี่</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Subtitle / Description */}
              <div className="text-sm sm:text-base text-slate-300 space-y-3 leading-relaxed">
                <p>
                  {course.description.split('\n\n')[0] || course.subtitle}
                </p>
                {course.subtitle && (
                  <p className="text-slate-300 font-medium">
                    {course.subtitle}
                  </p>
                )}
                <p className="text-amber-400/90 text-xs sm:text-sm font-semibold tracking-wide">
                  *** คอร์สนี้ จะปลดล็อค เรื่อยๆตามเวลา ***
                </p>
              </div>

              {/* Stat Chips */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
                {/* Lessons count */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{totalLessonsCount} บทเรียน</span>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{courseDurationFormatted}</span>
                </div>

                {/* Level */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200">
                  <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {course.level === 'beginner' ? 'เริ่มต้น' : course.level === 'intermediate' ? 'ระดับกลาง' : 'ระดับสูง'}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {course.availableDates?.[0] ? new Date(course.availableDates[0]).toLocaleDateString('th-TH') : '29/10/2569'}
                  </span>
                </div>
              </div>

            </div>

            {/* Right Card Column (Sticky Matching Image 1) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-[#0b1322] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-5">
                
                {/* Thumbnail Image */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-inner">
                  <img
                    src={getSafeCourseImageUrl(course.image)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Enrollment Status */}
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>คุณมีคอร์สนี้แล้ว</span>
                </div>

                {/* CTA Start Learning Button */}
                <Link
                  href={`/classroom/${course.id}`}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>เริ่มเรียน</span>
                </Link>

                {/* Features List */}
                <div className="space-y-3 pt-3 border-t border-white/10 text-xs text-slate-300">
                  <h4 className="font-bold text-white text-xs tracking-wider uppercase">
                    คอร์สนี้รวม:
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>เข้าถึงได้ตลอดชีพ</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>วิดีโอ {totalLessonsCount} บทเรียน</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>เข้าถึงบนมือถือและ PC</span>
                    </li>
                    {course.certificateEnabled !== false && (
                      <li className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-200/90 font-medium">ใบประกาศนียบัตรเมื่อเรียนจบ</span>
                      </li>
                    )}
                  </ul>
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MAIN CURRICULUM SECTION (Matching Image 1) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl space-y-6">
          
          {/* Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              เนื้อหาในคอร์ส
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              1 หมวด • {totalLessonsCount} บทเรียน
            </p>
          </div>

          {/* Module Box Container */}
          <div className="bg-[#0b1322] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            
            {/* Module Title Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-[#0b1322] border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {course.id === 'ai-unlock' ? 'ใช้เอไอเป็น ทำอะไรก็ง่ายไปหมด' : course.title}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {totalLessonsCount} บทเรียน
                </span>
              </div>

              <Link
                href={`/classroom/${course.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>เรียนทุกตอน</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Lessons List */}
            <div className="divide-y divide-white/5">
              {lessons.map((les, idx) => (
                <Link
                  key={les.id || idx}
                  href={`/classroom/${course.id}?ep=${idx}`}
                  className="p-4 sm:p-4.5 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 flex items-center justify-center shrink-0 transition">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white transition block truncate">
                        {les.title}
                      </span>
                      {les.summary && (
                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 block">
                          {les.summary}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {les.attachmentUrl && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        <Download className="w-3 h-3" />
                        <span>เอกสาร</span>
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400 group-hover:text-emerald-300 transition">
                      {les.duration || '0 น.'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

          </div>

          {/* COURSE ATTACHMENTS & MATERIALS (If any) */}
          {course.attachments && course.attachments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>เอกสารและไฟล์ประกอบการเรียน</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.attachments.map((att, aIdx) => (
                  <a
                    key={att.id || aIdx}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-2xl bg-[#0b1322] border border-white/10 hover:border-cyan-400/40 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition block truncate">
                          {att.name}
                        </span>
                        {att.size && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {att.size}
                          </span>
                        )}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 shrink-0 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
