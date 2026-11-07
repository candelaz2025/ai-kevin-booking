'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ClassItem, LessonModule, getYouTubeEmbedUrl, formatClassDuration } from '@/lib/types';
import { getSafeCourseImageUrl } from '@/lib/image-utils';
import { useAuth } from '@/lib/auth-context';
import { 
  Play, CheckCircle2, ChevronLeft, ChevronRight, Menu, X, 
  Download, FileText, Award, ArrowLeft, RotateCcw, Share2, 
  ExternalLink, Sparkles, Check, Printer, Loader2
} from 'lucide-react';

export default function ClassroomPage({ params }: { params: Promise<{ classId: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    }>
      <ClassroomContent params={params} />
    </Suspense>
  );
}

function ClassroomContent({ params }: { params: Promise<{ classId: string }> }) {
  const { user } = useAuth();
  const rawParams = use(params);
  const classId = decodeURIComponent(rawParams.classId || '');
  const searchParams = useSearchParams();
  const epParam = searchParams.get('ep');

  const [course, setCourse] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Classroom state
  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  
  // Certificate modal state
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Load course details
  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const res = await fetch(`/api/classes/${classId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setCourse(json.data);
        } else {
          // Fallback fetch from full list
          const listRes = await fetch('/api/classes');
          const listJson = await listRes.json();
          if (Array.isArray(listJson)) {
            const found = listJson.find((c: ClassItem) => c.id === classId);
            if (found) setCourse(found);
            else setError('ไม่พบคอร์สเรียน');
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลห้องเรียน');
      } finally {
        setLoading(false);
      }
    }

    if (classId) {
      fetchCourse();
    }
  }, [classId]);

  // Load completed lessons from localStorage
  useEffect(() => {
    if (!classId || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(`ai_kevin_completed_lessons_${classId}`);
      if (stored) {
        setCompletedLessonIds(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read completed lessons from localStorage', e);
    }
  }, [classId]);

  // Pre-fill student name
  useEffect(() => {
    if (user?.name) {
      setStudentName(user.name);
    } else if (!studentName) {
      setStudentName('ผู้สำเร็จการศึกษา');
    }
  }, [user]);

  // Handle URL ep param
  useEffect(() => {
    if (epParam !== null && !isNaN(Number(epParam))) {
      const parsed = Number(epParam);
      if (parsed >= 0) {
        setActiveLessonIndex(parsed);
      }
    }
  }, [epParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm font-medium">กำลังเตรียมห้องเรียนออนไลน์...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0b1322] border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-xl font-bold text-rose-400">ไม่สามารถเข้าสู่ห้องเรียนได้</h2>
          <p className="text-slate-400 text-xs">{error || 'ไม่พบคอร์สเรียนนี้'}</p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
          >
            <span>กลับสู่หน้ารายการคอร์ส</span>
          </Link>
        </div>
      </div>
    );
  }

  const lessons: LessonModule[] = course.lessons && course.lessons.length > 0
    ? course.lessons
    : [
        {
          id: 'les-main',
          title: 'EP.1 วิดีโอบทเรียนหลักประจำคอร์ส',
          duration: course.durationValue ? `${course.durationValue} ชม.` : '120 นาที',
          videoUrl: course.videoUrl || 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
          summary: course.subtitle || course.description
        }
      ];

  const currentLessonIndex = Math.min(Math.max(activeLessonIndex, 0), lessons.length - 1);
  const currentLesson = lessons[currentLessonIndex] || lessons[0];
  const isCurrentCompleted = completedLessonIds.includes(currentLesson.id);

  // Toggle lesson complete
  const handleToggleComplete = () => {
    let nextList: string[];
    if (isCurrentCompleted) {
      nextList = completedLessonIds.filter(id => id !== currentLesson.id);
    } else {
      nextList = [...completedLessonIds, currentLesson.id];
    }
    setCompletedLessonIds(nextList);
    try {
      localStorage.setItem(`ai_kevin_completed_lessons_${classId}`, JSON.stringify(nextList));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  const handleNextLesson = () => {
    // Automatically mark current as completed when pressing next
    if (!isCurrentCompleted) {
      handleToggleComplete();
    }
    if (currentLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(currentLessonIndex + 1);
    } else {
      // Reached the end! Trigger certificate modal
      setShowCertificate(true);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setActiveLessonIndex(currentLessonIndex - 1);
    }
  };

  const percentProgress = Math.round((completedLessonIds.length / lessons.length) * 100);
  const courseDurationFormatted = formatClassDuration(course);
  const embedUrl = getYouTubeEmbedUrl(currentLesson.videoUrl);

  // Find downloadable files for current lesson or course
  const currentAttachmentUrl = currentLesson.attachmentUrl || course.attachments?.[0]?.url;
  const currentAttachmentName = currentLesson.attachmentName || course.attachments?.[0]?.name;

  return (
    <div className="h-screen max-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Matching Screenshot 2) */}
      {/* ========================================================================= */}
      <header className="h-14 sm:h-16 bg-[#070b14] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-40">
        
        {/* Left: Course Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/courses/${course.id}`}
            className="text-xs sm:text-sm font-bold text-white hover:text-emerald-400 transition truncate max-w-[200px] sm:max-w-xs md:max-w-md block"
            title={course.title}
          >
            {course.title}
          </Link>
        </div>

        {/* Center: Toggle Sidebar button & Current Episode Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/5 cursor-pointer shrink-0"
            title="เปิด/ปิด สารบัญ"
          >
            <Menu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">สารบัญ</span>
          </button>

          <span className="text-slate-600 hidden md:inline">|</span>

          <span className="text-xs sm:text-sm text-slate-200 font-medium truncate max-w-[180px] sm:max-w-sm md:max-w-lg">
            {currentLesson.title}
          </span>
        </div>

        {/* Right: Return Link */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={`/courses/${course.id}`}
            className="text-xs font-medium text-slate-400 hover:text-emerald-300 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">คอร์สของฉัน</span>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT: SIDEBAR + VIDEO PLAYER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PLAYLIST SIDEBAR (Collapsible matching Screenshot 2) */}
        {sidebarOpen && (
          <aside className="w-72 sm:w-80 md:w-96 bg-[#070b14] border-r border-white/10 flex flex-col shrink-0 z-30 transition-all duration-300 overflow-y-auto">
            
            {/* Downloadable material banner / button */}
            {currentAttachmentUrl && (
              <div className="p-3 bg-amber-500/10 border-b border-amber-500/20">
                <a
                  href={currentAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="w-full py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{currentAttachmentName || 'ไฟล์ที่เกี่ยวข้อง'}</span>
                  </div>
                  <Download className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            )}

            {/* Section Header */}
            <div className="p-4 border-b border-white/5 bg-[#0a1220]/50">
              <h3 className="text-xs sm:text-sm font-bold text-white">
                {course.id === 'ai-unlock' ? 'ใช้เอไอเป็น ทำอะไรก็ง่ายไปหมด' : 'สารบัญบทเรียน'}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{lessons.length} บทเรียน</span>
                <span className="text-emerald-400 font-mono font-semibold">
                  เรียนแล้ว {completedLessonIds.length}/{lessons.length} ({percentProgress}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${percentProgress}%` }}
                />
              </div>
            </div>

            {/* Lesson List Items (Matching Image 2 highlight style) */}
            <div className="divide-y divide-white/5 overflow-y-auto flex-1">
              {lessons.map((les, idx) => {
                const isActive = idx === currentLessonIndex;
                const isCompleted = completedLessonIds.includes(les.id);

                return (
                  <button
                    key={les.id || idx}
                    type="button"
                    onClick={() => setActiveLessonIndex(idx)}
                    className={`w-full p-3.5 text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400 border-t border-b border-white/10 text-white'
                        : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 text-xs ${
                        isActive
                          ? 'text-emerald-400'
                          : isCompleted
                          ? 'text-emerald-500'
                          : 'text-slate-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className={`text-xs font-semibold block leading-snug ${
                          isActive ? 'text-emerald-300 font-bold' : 'text-slate-200'
                        }`}>
                          {les.title}
                        </span>

                        {les.attachmentUrl && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-1.5 py-0.2 rounded">
                            <Download className="w-2.5 h-2.5" />
                            <span>มีเอกสารโหลด</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {les.duration || '0 น.'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Certificate Trigger inside sidebar */}
            {course.certificateEnabled !== false && (
              <div className="p-3 border-t border-white/10 bg-[#0a1220]">
                <button
                  type="button"
                  onClick={() => setShowCertificate(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>รับใบประกาศนียบัตร</span>
                </button>
              </div>
            )}

          </aside>
        )}

        {/* RIGHT / MAIN CONTENT: VIDEO PLAYER + CONTROLS */}
        <main className="flex-1 flex flex-col bg-black min-h-0 overflow-hidden">
          
          {/* VIDEO FRAME CONTAINER (16:9 full width) */}
          <div className="w-full bg-black flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0">
            <div className="w-full h-full max-w-6xl max-h-full aspect-video bg-black relative flex items-center justify-center">
              {embedUrl ? (
                <iframe
                  src={`${embedUrl}?autoplay=1&rel=0`}
                  title={currentLesson.title}
                  className="w-full h-full border-0 rounded-xl overflow-hidden shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : currentLesson.videoUrl ? (
                <video
                  src={currentLesson.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Play className="w-12 h-12 opacity-40 text-emerald-400" />
                  <p className="text-sm">กำลังอัปเดตวิดีโอสำหรับบทเรียนนี้</p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. BOTTOM CONTROL BAR (Matching Screenshot 2) */}
          {/* ========================================================================= */}
          <footer className="h-16 bg-[#070b14] border-t border-white/10 px-4 sm:px-8 flex items-center justify-between gap-3 shrink-0">
            
            {/* Previous Button */}
            <button
              type="button"
              disabled={currentLessonIndex === 0}
              onClick={handlePrevLesson}
              className="py-2 px-3 sm:px-4 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ก่อนหน้า</span>
            </button>

            {/* Center: Mark Complete (Blue Button) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleComplete}
                className={`py-2 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg ${
                  isCurrentCompleted
                    ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-blue-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCurrentCompleted ? '✓ เรียนแล้ว' : 'ทำเครื่องหมายว่าเรียนแล้ว'}</span>
              </button>

              {/* Next Button (Green Button matching Image 2) */}
              <button
                type="button"
                onClick={handleNextLesson}
                className="py-2 px-4 sm:px-5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentLessonIndex < lessons.length - 1 ? 'ถัดไป' : 'จบหลักสูตร'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Tools: Download Materials & Certificate */}
            <div className="flex items-center gap-2">
              {currentAttachmentUrl && (
                <a
                  href={currentAttachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="hidden sm:inline-flex items-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
                  title="ดาวน์โหลดเอกสารประกอบ"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>เอกสารประกอบ</span>
                </a>
              )}

              {course.certificateEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setShowCertificate(true)}
                  className="py-2 px-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
                  title="เปิดใบประกาศนียบัตร"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="hidden md:inline">รับใบประกาศ</span>
                </button>
              )}
            </div>

          </footer>

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 4. CERTIFICATE OF COMPLETION MODAL */}
      {/* ========================================================================= */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#090f1d] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Printable Area */}
            <div
              id="printable-certificate"
              className="bg-gradient-to-b from-[#0f172a] via-[#090f1d] to-[#0a1220] border-4 border-double border-amber-400/60 rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-2xl"
            >
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400/70" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400/70" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400/70" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400/70" />

              {/* Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <Award className="w-96 h-96 text-amber-300" />
              </div>

              {/* Certificate Header */}
              <div className="space-y-2 relative z-10">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400/15 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-lg">
                  <Award className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xs sm:text-sm font-mono tracking-widest uppercase text-amber-400 font-bold">
                  Certificate of Completion
                </h3>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  ใบประกาศนียบัตรสำเร็จหลักสูตร
                </h2>
                <p className="text-xs text-slate-400 font-light">
                  ขอมอบใบประกาศนียบัตรฉบับนี้ เพื่อแสดงว่า
                </p>
              </div>

              {/* Recipient Name */}
              <div className="py-4 my-2 relative z-10 border-b border-amber-400/20 max-w-lg mx-auto">
                {isEditingName ? (
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="text-center text-xl sm:text-2xl font-black text-amber-300 bg-slate-900 border border-amber-400/50 rounded-xl px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 font-serif"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      เสร็จ
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide font-serif cursor-pointer hover:opacity-80 transition group flex items-center justify-center gap-2"
                    title="คลิกเพื่อแก้ไขชื่อผู้เรียน"
                  >
                    <span>{studentName || 'ผู้สำเร็จการศึกษา'}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-amber-400">✎ แก้ไข</span>
                  </div>
                )}
              </div>

              {/* Course Completed Description */}
              <div className="space-y-2 relative z-10 max-w-xl mx-auto pt-2">
                <p className="text-xs text-slate-400">
                  ได้ผ่านการศึกษาและฝึกอบรมหลักสูตรออนไลน์
                </p>
                <h4 className="text-base sm:text-xl font-bold text-white">
                  {course.title}
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  {courseDurationFormatted} • สำเร็จการเรียนรู้ครบทุกโมดูลภาคปฏิบัติ
                </p>
              </div>

              {/* Footer: Signatures & Seals */}
              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 items-end relative z-10 text-left">
                {/* Issue Date & ID */}
                <div className="space-y-1 text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] uppercase font-mono block text-slate-500">วันที่ออกใบประกาศ</span>
                    <span className="text-slate-200 font-semibold">
                      {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono block text-slate-500">รหัสตรวจสอบ</span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      CERT-AI-{course.id.toUpperCase()}-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Instructor Signature */}
                <div className="text-right space-y-1">
                  <div className="h-10 flex items-center justify-end font-serif italic text-lg sm:text-xl text-amber-300 font-bold">
                    {course.instructorName || 'อาจารย์ สรเชษฐ์ (อ. เควิน)'}
                  </div>
                  <div className="border-t border-slate-700 pt-1">
                    <span className="text-xs font-bold text-white block">
                      {course.instructorName || 'อาจารย์ สรเชษฐ์ (อ. เควิน)'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {course.instructorTitle || 'Lead AI Instructor & Founder, kevinaiagent.tech'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.print();
                  }
                }}
                className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ / บันทึกเป็น PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCertificate(false)}
                className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
