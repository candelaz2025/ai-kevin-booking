'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Booking, ClassItem, ClassAttachment, UserRewardData, Quiz, QuizSubmission, CourseLevel, COURSE_LEVELS, getCourseLevelConfig } from '@/lib/types';
import { 
  BookOpen, Video, MapPin, Calendar, Clock, CheckCircle2, 
  ExternalLink, AlertCircle, Sparkles, User as UserIcon, RefreshCw, Loader2,
  Settings, Phone, FileText, Save, Eye, Download, Gift, MessageCircle,
  Copy, Check, RotateCcw, Share2, Award, Zap, Users, UserPlus, CheckCircle,
  X, Flame, ChevronRight, ShieldCheck, HeartHandshake, Link as LinkIcon,
  Book, Layers, Wrench, Info, FileCheck, HelpCircle, Send, XCircle, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSafeCourseImageUrl, getAttachmentDownloadInfo } from '@/lib/image-utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'quizzes' | 'ebooks' | 'rewards' | 'online' | 'history' | 'profile'>('all');
  const [viewingSlipBooking, setViewingSlipBooking] = useState<Booking | null>(null);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<{ booking: Booking; classItem?: ClassItem } | null>(null);

  // Quizzes & Assessments States
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userQuizSubmissions, setUserQuizSubmissions] = useState<QuizSubmission[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeQuizBooking, setActiveQuizBooking] = useState<Booking | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIdx: number]: number }>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResultModal, setQuizResultModal] = useState<{
    submission: QuizSubmission;
    questionReview: any[];
    score: number;
    totalQuestions: number;
    scorePercent: number;
    passed: boolean;
    passingScorePercent: number;
  } | null>(null);
  const [viewingPastSubmission, setViewingPastSubmission] = useState<{
    quiz: Quiz;
    submission: QuizSubmission;
  } | null>(null);

  // Rewards & LINE Notification States
  const [rewards, setRewards] = useState<UserRewardData | null>(null);
  const [lineOaId, setLineOaId] = useState('Candelaz');
  const [lineOaUrl, setLineOaUrl] = useState('');
  const [lineAddFriendUrl, setLineAddFriendUrl] = useState('');
  const [isConnectingLine, setIsConnectingLine] = useState(false);
  const [isVerifyingLine, setIsVerifyingLine] = useState(false);
  const [copiedRefLink, setCopiedRefLink] = useState(false);
  const [copiedLineCode, setCopiedLineCode] = useState(false);
  const [rewardToast, setRewardToast] = useState<{ type: 'success' | 'info'; message: string; points?: number } | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([]);
  const [sharingClassId, setSharingClassId] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Robust class matching helper (matching by ID, title, or normalized Unicode title)
  const normalizeTitle = (str: string) => (str || '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

  const findMatchingClass = (b: Booking) => {
    return availableClasses.find((c) => {
      if (b.classId && c.id === b.classId) return true;
      if (c.title && b.classTitle && c.title.trim().toLowerCase() === b.classTitle.trim().toLowerCase()) return true;
      const normC = normalizeTitle(c.title);
      const normB = normalizeTitle(b.classTitle);
      if (normC && normB && normC === normB) return true;
      if (normC.length >= 4 && normB.length >= 4) {
        if (normB.includes(normC) || normC.includes(normB)) return true;
      }
      return false;
    });
  };

  // Aggregated list of all downloadable materials/ebooks from enrolled classes
  const enrolledMaterials = useMemo(() => {
    const list: {
      id: string;
      booking: Booking;
      classItem?: ClassItem;
      attachment: ClassAttachment;
    }[] = [];

    bookings.forEach((b) => {
      const classInfo = findMatchingClass(b);
      if (classInfo?.attachments && classInfo.attachments.length > 0) {
        classInfo.attachments.forEach((att, idx) => {
          list.push({
            id: `${b.id}-${att.id || idx}`,
            booking: b,
            classItem: classInfo,
            attachment: att,
          });
        });
      }
    });

    return list;
  }, [bookings, availableClasses]);

  const showRewardToast = (type: 'success' | 'info', message: string, points?: number) => {
    setRewardToast({ type, message, points });
    setTimeout(() => {
      setRewardToast(null);
    }, 4500);
  };

  const fetchUserBookings = async () => {
    if (!user?.email) return;
    
    // 1. Instant cache load
    const cacheKey = `ai_kevin_bookings_${user.email.toLowerCase()}`;
    const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBookings(parsed);
          setIsLoading(false);
        }
      } catch {}
    }

    // 2. Fetch fresh bookings from API
    try {
      const emailQuery = `?userEmail=${encodeURIComponent(user.email)}`;
      const res = await fetch(`/api/bookings${emailQuery}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
        localStorage.setItem(cacheKey, JSON.stringify(data.data));
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRewards = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/user/rewards?email=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setRewards(data.data.rewards);
        setLineOaId(data.data.lineOaId || 'Candelaz');
        setLineOaUrl(data.data.lineOaUrl || '');
        setLineAddFriendUrl(data.data.lineAddFriendUrl || '');
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAvailableClasses(data.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchQuizzes = async () => {
    if (!user?.email) return;
    setIsLoadingQuizzes(true);
    try {
      const res = await fetch(`/api/quizzes?userEmail=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (data.success) {
        setQuizzes(data.quizzes || []);
        setUserQuizSubmissions(data.userSubmissions || []);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  // Find quiz that matches a specific booking
  const findQuizForBooking = (b: Booking): Quiz | undefined => {
    return quizzes.find((q) => {
      if (b.classId && q.classId === b.classId) return true;
      if (b.classTitle && q.classTitle && normalizeTitle(b.classTitle) === normalizeTitle(q.classTitle)) return true;
      const normB = normalizeTitle(b.classTitle);
      const normQ = normalizeTitle(q.title);
      if (normB && normQ && (normB.includes(normQ) || normQ.includes(normB))) return true;
      return false;
    });
  };

  // Get student's latest submission for a quiz
  const getLatestSubmissionForQuiz = (quizId: string): QuizSubmission | undefined => {
    return userQuizSubmissions
      .filter((s) => s.quizId === quizId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];
  };

  // Start taking a quiz
  const handleStartQuiz = (quiz: Quiz, booking?: Booking) => {
    setActiveQuiz(quiz);
    setActiveQuizBooking(booking || null);
    const initialAnswers: { [qIdx: number]: number } = {};
    quiz.questions.forEach((_, idx) => {
      initialAnswers[idx] = -1;
    });
    setQuizAnswers(initialAnswers);
  };

  // Submit student quiz answers
  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !user?.email) return;

    // Check if unanswered questions remain
    const unansweredCount = activeQuiz.questions.filter((_, idx) => quizAnswers[idx] === undefined || quizAnswers[idx] === -1).length;
    if (unansweredCount > 0) {
      if (!confirm(`คุณยังไม่ได้ตอบคำถามอีก ${unansweredCount} ข้อ ต้องการส่งแบบทดสอบเลยหรือไม่?`)) {
        return;
      }
    }

    setIsSubmittingQuiz(true);
    try {
      const answersArray = activeQuiz.questions.map((_, idx) => (quizAnswers[idx] !== undefined ? quizAnswers[idx] : -1));
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers: answersArray,
          userEmail: user.email,
          userName: user.name || 'ผู้เรียน',
          userId: user.id || 'anonymous',
          classId: activeQuizBooking?.classId || activeQuiz.classId,
          classTitle: activeQuizBooking?.classTitle || activeQuiz.classTitle
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.passed) {
          try {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          } catch {}
        }
        setQuizResultModal({
          submission: data.submission,
          questionReview: data.questionReview,
          score: data.score,
          totalQuestions: data.totalQuestions,
          scorePercent: data.scorePercent,
          passed: data.passed,
          passingScorePercent: data.passingScorePercent
        });
        setActiveQuiz(null);
        fetchQuizzes();
      } else {
        alert(`เกิดข้อผิดพลาดในการส่งแบบทดสอบ: ${data.error}`);
      }
    } catch (err: any) {
      alert(`เกิดข้อผิดพลาดในการส่งแบบทดสอบ: ${err.message}`);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  useEffect(() => {
    const hasHashToken = typeof window !== 'undefined' && window.location.hash.includes('access_token');
    if (!authLoading && !user && !hasHashToken) {
      router.push('/login');
    } else if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileBio(user.bio || '');
      fetchUserBookings();
      fetchUserRewards();
      fetchAvailableClasses();
      fetchQuizzes();
    }
  }, [user, authLoading]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSavedMsg(false);
    try {
      await updateUserProfile({
        name: profileName,
        phone: profilePhone,
        bio: profileBio
      });
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err: any) {
      alert(`บันทึกโปรไฟล์ไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Connect LINE
  const handleConnectLine = async () => {
    if (!user?.email) return;
    setIsVerifyingLine(true);
    try {
      const res = await fetch('/api/user/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, action: 'connect_line' })
      });
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards);
        setIsConnectingLine(false);
        try {
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        } catch {}
        showRewardToast('success', data.message || 'เชื่อมต่อ LINE สำเร็จ! คุณได้รับ +10 Point สะสม', data.pointsAwarded);
      }
    } catch (err: any) {
      alert(`เชื่อมต่อไม่สำเร็จ: ${err.message}`);
    } finally {
      setIsVerifyingLine(false);
    }
  };

  // Handle Disconnect LINE
  const handleDisconnectLine = async () => {
    if (!user?.email || !confirm('คุณต้องการยกเลิกการเชื่อมต่อการแจ้งเตือนทาง LINE ใช่หรือไม่?')) return;
    try {
      const res = await fetch('/api/user/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, action: 'disconnect_line' })
      });
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards);
        showRewardToast('info', 'ยกเลิกการเชื่อมต่อ LINE เรียบร้อยแล้ว');
      }
    } catch (err: any) {
      alert(`ดำเนินการไม่สำเร็จ: ${err.message}`);
    }
  };

  // Handle Refresh LINE Code
  const handleRefreshLineCode = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('/api/user/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, action: 'generate_line_code' })
      });
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards);
        showRewardToast('info', 'สร้างรหัสเชื่อมต่อ LINE ใหม่เรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Copy Referral Link
  const handleCopyRefLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-kevin-booking.vercel.app';
    const refCode = rewards?.refCode || 'CK83DD';
    const link = `${origin}/?ref=${refCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedRefLink(true);
    showRewardToast('info', 'คัดลอกลิงก์ชวนเพื่อนของคุณเรียบร้อยแล้ว!');
    setTimeout(() => setCopiedRefLink(false), 2500);
  };

  // Handle Copy LINE Code
  const handleCopyLineCode = () => {
    const code = rewards?.lineNotifyCode || 'CK83DD';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedLineCode(true);
    setTimeout(() => setCopiedLineCode(false), 2000);
  };

  // Handle Share Class via Social Media (+10 points)
  const handleShareClass = async (classItem: ClassItem, platform: 'line' | 'facebook' | 'x' | 'copy') => {
    if (!user?.email) return;
    setSharingClassId(classItem.id);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-kevin-booking.vercel.app';
    const refCode = rewards?.refCode || '';
    const shareUrl = `${origin}/?ref=${encodeURIComponent(refCode)}#classes`;
    const shareText = `แนะนำคลาสเรียน AI ยุคใหม่: ${classItem.title} โดย อ. Kevin AI Academy สมัครผ่านลิงก์นี้รับสิทธิ์เรียนฟรีและส่วนลดพิเศษ:`;

    if (platform === 'line') {
      window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'x') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    } else if (platform === 'copy') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
    }

    try {
      const res = await fetch('/api/user/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          action: 'share_class',
          classId: classItem.id,
          classTitle: classItem.title,
          platform
        })
      });
      const data = await res.json();
      if (data.success) {
        setRewards(data.rewards);
        try {
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        } catch {}
        showRewardToast('success', `แชร์คลาส "${classItem.title.slice(0, 30)}..." สำเร็จ! ได้รับ +10 Point สะสม`, 10);
      }
    } catch (err) {
      console.error('Error recording share reward:', err);
    } finally {
      setSharingClassId(null);
    }
  };

  // Formatted spaced code for LINE display: "C K 8 3 D D"
  const spacedLineCode = useMemo(() => {
    const rawCode = rewards?.lineNotifyCode || 'CK83DD';
    return rawCode.split('').join('  ');
  }, [rewards?.lineNotifyCode]);

  const referralUrl = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ai-kevin-booking.vercel.app';
    const refCode = rewards?.refCode || 'CK83DD';
    return `${origin}/?ref=${refCode}`;
  }, [rewards?.refCode]);

  if (authLoading || (!user && isLoading)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'online') return b.classType === 'online';
    if (activeTab === 'history') return b.bookingStatus === 'completed' || b.bookingStatus === 'confirmed';
    return true;
  });

  const onlineClasses = bookings.filter(b => b.classType === 'online');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Toast Notification */}
      {rewardToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-xs max-w-md ${
            rewardToast.type === 'success'
              ? 'bg-[#0a231c] border-emerald-500/50 text-white shadow-emerald-500/20'
              : 'bg-[#101c2d] border-amber-400/40 text-white shadow-amber-400/10'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>Kevin AI Academy Rewards</span>
                {rewardToast.points && (
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                    +{rewardToast.points} PTS
                  </span>
                )}
              </h4>
              <p className="text-slate-200 mt-0.5 leading-relaxed">{rewardToast.message}</p>
            </div>
            <button
              onClick={() => setRewardToast(null)}
              className="ml-auto text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111f32] to-[#0d1725] border border-white/10 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-400/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 border border-amber-300 flex items-center justify-center text-2xl font-black shadow-lg shadow-amber-400/20">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  สวัสดี, {user?.name || 'ผู้เรียน'}
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  {user?.provider === 'google' ? 'Google Account' : 'Student Member'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              {user?.bio && <p className="text-xs text-slate-300 italic mt-0.5">"{user.bio}"</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { fetchUserBookings(); fetchUserRewards(); fetchQuizzes(); }}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition flex items-center gap-2 text-xs"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเฟรช</span>
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className="px-4 py-3 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 transition flex items-center gap-2 text-xs font-bold"
              title="สิทธิพิเศษ & คะแนนสะสม"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>สิทธิพิเศษ & แต้ม ({rewards?.points || 0} pts)</span>
            </button>
            <Link
              href="/booking"
              className="px-5 py-3 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition text-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>จองคลาสใหม่</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid with Rewards & LINE status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-8 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block">คลาสที่จองทั้งหมด</span>
            <span className="text-2xl font-bold text-white mt-1 block">{bookings.length}</span>
          </div>
          <div>
            <span className="text-slate-400 block">คลาสออนไลน์สด</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{onlineClasses.length}</span>
          </div>
          <div className="cursor-pointer hover:opacity-80 transition" onClick={() => setActiveTab('ebooks')}>
            <span className="text-slate-400 block flex items-center gap-1">
              <Book className="w-3.5 h-3.5 text-cyan-400" />
              <span>E-Book & เอกสาร</span>
            </span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 block">
              {enrolledMaterials.length} <small className="text-xs font-normal text-slate-400">ไฟล์</small>
            </span>
          </div>
          <div className="cursor-pointer hover:opacity-80 transition" onClick={() => setActiveTab('quizzes')}>
            <span className="text-slate-400 block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>แบบทดสอบหลังเรียน</span>
            </span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">
              {userQuizSubmissions.length} <small className="text-xs font-normal text-slate-400">/ {quizzes.length} ชุด</small>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>คะแนนสะสม</span>
            </span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">
              {rewards?.points || 0} <small className="text-xs font-normal text-slate-400">pts</small>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-rose-400" />
              <span>เครดิตเรียนฟรี</span>
            </span>
            <span className="text-2xl font-bold text-rose-400 mt-1 block">
              {rewards?.freeHours || 0} <small className="text-xs font-normal text-slate-400">ชม.</small>
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-400 block flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-green-400" />
              <span>แจ้งเตือน LINE</span>
            </span>
            <span className={`text-xs font-bold mt-1.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
              rewards?.lineConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-slate-800 text-slate-400 border border-white/10'
            }`}>
              {rewards?.lineConnected ? '✅ เชื่อมต่อแล้ว' : '⚪ ยังไม่เชื่อมต่อ'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>คลาสเรียนของฉัน ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'quizzes'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-purple-500/30'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-purple-400" />
          <span>แบบทดสอบหลังเรียน ({quizzes.length})</span>
          {userQuizSubmissions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-400/20 text-purple-300 font-bold ml-1">
              ทำแล้ว {userQuizSubmissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ebooks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'ebooks'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-cyan-500/30'
          }`}
        >
          <Book className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
          <span>คลัง E-Book & เอกสาร ({enrolledMaterials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
            activeTab === 'rewards'
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-amber-400/20'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
          <span>แนะนำเพื่อน & คะแนน ({rewards?.points || 0} pts)</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
        </button>

        <button
          onClick={() => setActiveTab('online')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'online'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>คลาสออนไลน์ ({onlineClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-blue-500 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>ประวัติการยืนยัน</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>ตั้งค่าโปรไฟล์</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: LINE NOTIFICATION & REFERRAL & POINTS (Shown in 'rewards' or top of 'all') */}
      {/* ========================================================================= */}
      {(activeTab === 'rewards' || activeTab === 'all') && (
        <div className="space-y-8 mb-10">

          {/* 1. CARD: แจ้งเตือนทาง LINE (Matching user uploaded screenshot 1 & 2) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span>แจ้งเตือนทาง LINE</span>
            </h3>

            <div className="bg-[#f0f7fa] text-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl border border-[#cce4ed] transition-all">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                เชื่อมบัญชี LINE แล้วจะได้รับแจ้งเตือนก่อนถึงคลาส ก่อนงานอีเวนต์ และเมื่อสมัครคอร์สสำเร็จ ทางแชตแทนการรออีเมล
              </p>

              {/* State A: Already Connected */}
              {rewards?.lineConnected ? (
                <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                        <span>เชื่อมบัญชี LINE สำเร็จแล้ว</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Active</span>
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5">
                        ระบบจะส่งข้อความแจ้งเตือนลิงก์เข้าเรียนและคอนเฟิร์มคอร์สผ่าน LINE OA: <strong className="font-semibold">@{lineOaId}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showRewardToast('info', 'ส่งการแจ้งเตือนทดสอบผ่าน LINE เรียบร้อยแล้ว')}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0c627a] border border-[#0c627a]/30 text-xs font-semibold transition"
                    >
                      🧪 ทดสอบแจ้งเตือน
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectLine}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                    >
                      ยกเลิกเชื่อมต่อ
                    </button>
                  </div>
                </div>
              ) : !isConnectingLine ? (
                /* State B: Not Connected - Collapsed Initial View (Screenshot 1) */
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsConnectingLine(true)}
                    className="px-6 py-3 rounded-2xl bg-[#0c627a] hover:bg-[#094c5f] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#0c627a]/25 transition hover:scale-[1.02] cursor-pointer"
                  >
                    <LinkIcon className="w-4 h-4 text-emerald-300" />
                    <span>เชื่อมบัญชี LINE</span>
                    <span className="ml-1 bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                      +10 Point
                    </span>
                  </button>
                </div>
              ) : (
                /* State C: Connecting Step-by-Step Box (Screenshot 2) */
                <div className="mt-5 bg-[#e3eef3] rounded-2xl p-6 border border-[#b8d8e5] text-slate-800 space-y-4 animate-in fade-in duration-300">
                  <div className="text-xs sm:text-sm text-slate-700 space-y-1 font-medium">
                    <p>1. เพิ่ม LINE OA เป็นเพื่อน (ถ้ายังไม่ได้เพิ่ม)</p>
                    <p>2. กดปุ่มด้านล่าง แชตจะเปิดพร้อมโค้ดพิมพ์ไว้ให้ · กดส่งได้เลย</p>
                  </div>

                  {/* Large Spaced Code Display */}
                  <div className="py-4 px-6 bg-white/90 rounded-2xl border border-[#c1deea] text-center my-3 relative group">
                    <div className="text-2xl sm:text-3xl font-black tracking-[0.5em] text-[#0c627a] font-mono select-all">
                      {spacedLineCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyLineCode}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-[#0c627a] hover:bg-slate-100 transition text-xs flex items-center gap-1"
                      title="คัดลอกโค้ด"
                    >
                      {copiedLineCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span className="text-[10px]">{copiedLineCode ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>

                  {/* Primary CTA: ส่งโค้ดเข้า LINE */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (lineOaUrl) {
                          window.open(lineOaUrl, '_blank');
                        } else {
                          window.open(`https://line.me/R/oaMessage/@${lineOaId.replace(/^@/, '')}/?${rewards?.lineNotifyCode || 'CK83DD'}`, '_blank');
                        }
                      }}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#0c627a] hover:bg-[#094c5f] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0c627a]/25 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>ส่งโค้ดเข้า LINE</span>
                    </button>

                    {/* Sub actions */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-1 text-slate-600 font-medium">
                      <a
                        href={lineAddFriendUrl || `https://line.me/ti/p/~${lineOaId.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#0c627a] flex items-center gap-1.5 transition underline"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#0c627a]" />
                        <span>ยังไม่ได้เพิ่มเพื่อน กดที่นี่</span>
                      </a>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleRefreshLineCode}
                        className="hover:text-[#0c627a] flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>ขอโค้ดใหม่</span>
                      </button>
                    </div>

                    {/* Quick Confirm & Award points */}
                    <div className="pt-3 border-t border-[#b8d8e5]/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsConnectingLine(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 underline"
                      >
                        ปิดหน้าต่างนี้
                      </button>
                      <button
                        type="button"
                        disabled={isVerifyingLine}
                        onClick={handleConnectLine}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
                      >
                        {isVerifyingLine ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>ยืนยันว่าส่งโค้ดแล้ว (รับ +10 Point ทันที)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. CARD: แนะนำเพื่อน รับฟรี 1 ชั่วโมง (Matching user uploaded screenshot 1) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>แนะนำเพื่อน รับฟรี 1 ชั่วโมง</span>
            </h3>

            <div className="bg-[#fff8eb] text-slate-900 rounded-3xl p-6 sm:p-7 shadow-xl border border-[#f5dfb8] transition-all">
              
              {/* Card Header & Title */}
              <div className="flex items-start gap-3.5 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#a2601c]/15 text-[#a2601c] flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-[#965416]" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[#6d3a08] tracking-tight">
                    ชวนเพื่อนเรียน รับเครดิตฟรี 1 ชั่วโมง
                  </h4>
                  <p className="text-xs text-[#965416] mt-0.5 font-medium">
                    เพื่อนต้องซื้อครั้งแรกถึงจะได้เครดิต
                  </p>
                </div>
              </div>

              {/* Referral Input Box & Copy Button */}
              <div className="space-y-2 mb-4">
                <label className="block text-xs font-semibold text-[#874910]">
                  ลิงก์ชวนเพื่อนของคุณ
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1 bg-white rounded-2xl border border-[#eed09b] px-4 py-3 font-mono text-xs sm:text-sm text-slate-800 shadow-inner select-all truncate">
                    {referralUrl}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyRefLink}
                    className="px-6 py-3 rounded-2xl bg-[#0c627a] hover:bg-[#094c5f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0c627a]/20 transition shrink-0 cursor-pointer active:scale-95"
                  >
                    {copiedRefLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>คัดลอกลิงก์</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Referral Counter Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-[#eed09b] text-xs font-semibold text-[#6d3a08] shadow-sm">
                <span>เพื่อนที่สมัครผ่านคุณ: <strong className="text-amber-800 font-extrabold">{rewards?.referralCount || 0} คน</strong></span>
                <span className="text-[#eed09b]">•</span>
                <span>ได้เครดิตแล้ว <strong className="text-amber-800 font-extrabold">{rewards?.freeHours || 0} ชม.</strong></span>
              </div>
            </div>
          </div>

          {/* 3. CARD: ระบบคะแนนสะสม & แชร์คลาสเรียนรับ 10 Point */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ระบบคะแนนสะสม & แชร์คลาสเรียน (รับ +10 Point ต่อการแชร์)</span>
              </h3>
              <span className="text-xs text-amber-400 font-mono font-bold">
                คะแนนปัจจุบัน: {rewards?.points || 0} PTS
              </span>
            </div>

            <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              
              {/* Reward Rules summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 shrink-0">
                    ⭐
                  </div>
                  <div>
                    <span className="font-bold block text-white">ลงทะเบียนเรียนคลาส</span>
                    <span className="text-[11px] text-slate-400">รับแต้มสะสม +50 ถึง +250 pts</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center font-black text-amber-400 shrink-0">
                    +10
                  </div>
                  <div>
                    <span className="font-bold block text-white">แชร์คลาสเรียน</span>
                    <span className="text-[11px] text-slate-400">ผ่าน LINE, FB หรือ X (+10 pts)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center font-black text-green-400 shrink-0">
                    +10
                  </div>
                  <div>
                    <span className="font-bold block text-white">เชื่อมต่อ LINE</span>
                    <span className="text-[11px] text-slate-400">รับแจ้งเตือนทันใจ (+10 pts)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center font-black text-rose-400 shrink-0">
                    1 ชม.
                  </div>
                  <div>
                    <span className="font-bold block text-white">ชวนเพื่อนซื้อครั้งแรก</span>
                    <span className="text-[11px] text-slate-400">รับเครดิตเรียนฟรี 1 ชม. เต็ม</span>
                  </div>
                </div>
              </div>

              {/* Class Sharing Showcase */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>เลือกคลาสเรียนเพื่อแชร์สู่ Social Media (รับ +10 Point สะสมทันที)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableClasses.slice(0, 4).map((c) => {
                    const isShared = rewards?.sharedClasses?.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-amber-400/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative border border-white/5">
                            <img
                              src={getSafeCourseImageUrl(c.image)}
                              alt={c.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300">
                                {c.price.toLocaleString()} บาท
                              </span>
                              {isShared && (
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> เคยแชร์แล้ว
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-white truncate mt-0.5">{c.title}</h5>
                          </div>
                        </div>

                        {/* Social Share Buttons */}
                        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5 text-[11px]">
                          <button
                            type="button"
                            disabled={sharingClassId === c.id}
                            onClick={() => handleShareClass(c, 'line')}
                            className="py-1.5 px-2 rounded-xl bg-green-600/20 hover:bg-green-600 text-green-300 hover:text-white border border-green-500/30 font-bold transition flex items-center justify-center gap-1 text-[11px]"
                            title="แชร์เข้า LINE"
                          >
                            <MessageCircle className="w-3 h-3 text-green-400" />
                            <span>LINE</span>
                          </button>

                          <button
                            type="button"
                            disabled={sharingClassId === c.id}
                            onClick={() => handleShareClass(c, 'facebook')}
                            className="py-1.5 px-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 font-bold transition flex items-center justify-center gap-1 text-[11px]"
                            title="แชร์เข้า Facebook"
                          >
                            <span className="font-extrabold">f</span>
                            <span>FB</span>
                          </button>

                          <button
                            type="button"
                            disabled={sharingClassId === c.id}
                            onClick={() => handleShareClass(c, 'x')}
                            className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold transition flex items-center justify-center gap-1 text-[11px]"
                            title="แชร์เข้า X (Twitter)"
                          >
                            <span>𝕏</span>
                            <span>Post</span>
                          </button>

                          <button
                            type="button"
                            disabled={sharingClassId === c.id}
                            onClick={() => handleShareClass(c, 'copy')}
                            className="py-1.5 px-2 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-400/30 font-bold transition flex items-center justify-center gap-1 text-[11px]"
                            title="คัดลอกลิงก์"
                          >
                            <Copy className="w-3 h-3" />
                            <span>คัดลอก</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reward Points History */}
              {rewards?.history && rewards.history.length > 0 && (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>ประวัติการสะสมคะแนนล่าสุด</span>
                  </h5>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {rewards.history.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-black">
                            +{h.points}
                          </span>
                          <span className="text-slate-200">{h.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(h.createdAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: PROFILE SETTINGS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">แก้ไขข้อมูลโปรไฟล์ (Profile Settings)</h3>
              <p className="text-xs text-slate-400">อัปเดตข้อมูลส่วนตัวสำหรับใช้ในการติดต่อและเข้าร่วมคลาส</p>
            </div>
          </div>

          {profileSavedMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อ - นามสกุล (Display Name)</label>
              <input
                type="text"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">เบอร์โทรศัพท์ (Phone Number)</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={e => setProfilePhone(e.target.value)}
                placeholder="081-234-5678"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">อีเมลผู้ใช้งาน (Email)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">คำแนะนำตัว / เป้าหมายการเรียนรู้ (Bio / Learning Goals)</label>
              <textarea
                value={profileBio}
                onChange={e => setProfileBio(e.target.value)}
                rows={3}
                placeholder="เช่น ต้องการนำ AI ไปใช้สร้างคอนเทนต์สำหรับธุรกิจส่วนตัว"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: BOOKINGS LIST (all, online, history) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SECTION: E-BOOKS & MATERIALS LIBRARY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'ebooks' && (
        <div className="space-y-6">
          <div className="bg-[#101c2d] border border-cyan-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-400/10 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Book className="w-5 h-5 text-cyan-400" />
                  <span>คลัง E-Book & เอกสารประกอบการเรียน (Course Materials)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  ดาวน์โหลดคู่มือ E-Book สรุปเนื้อหา และเอกสารประกอบการสอนจากทุกคลาสเรียนที่คุณได้ลงทะเบียนไว้
                </p>
              </div>
              <span className="px-4 py-2 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold shrink-0 self-start sm:self-auto">
                📚 รวมทั้งหมด {enrolledMaterials.length} ไฟล์
              </span>
            </div>
          </div>

          {enrolledMaterials.length === 0 ? (
            <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
              <Book className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-base font-bold text-white mb-1">ยังไม่มีเอกสารหรือ E-Book ในขณะนี้</h4>
              <p className="text-xs text-slate-400 mb-6">
                เมื่อผู้สอนอัปโหลดเอกสารหรือ E-Book ในคลาสที่คุณลงทะเบียน เอกสารและคู่มือจะปรากฏให้ดาวน์โหลดที่นี่โดยอัตโนมัติ
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>กลับสู่รายการคลาสเรียนของฉัน</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledMaterials.map((item) => {
                const info = getAttachmentDownloadInfo(item.attachment.url);

                return (
                  <div
                    key={item.id}
                    className="bg-[#101c2d] border border-white/10 hover:border-cyan-400/40 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between gap-4 group"
                  >
                    <div>
                      {/* Course Header */}
                      <div className="flex items-center gap-3 mb-3.5 pb-3 border-b border-white/5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden border border-white/10 shrink-0">
                          <img
                            src={getSafeCourseImageUrl(item.classItem?.image)}
                            alt={item.classItem?.title || item.booking.classTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-cyan-400 font-semibold block truncate">
                            {item.booking.classTitle}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            รอบวันที่: {item.booking.date}
                          </span>
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                              {item.attachment.type || 'FILE'}
                            </span>
                            {item.attachment.size && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.attachment.size}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                            {item.attachment.name}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={info.viewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>เปิดอ่าน</span>
                        </a>

                        <a
                          href={info.downloadUrl}
                          download={item.attachment.name}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ดาวน์โหลด</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedClassForDetails({ booking: item.booking, classItem: item.classItem })}
                        className="w-full py-1.5 text-[11px] text-slate-400 hover:text-white transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-amber-400" />
                        <span>ดูรายละเอียดคอร์สทั้งหมด</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: POST-CLASS QUIZZES & ASSESSMENTS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="bg-[#101c2d] border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-purple-500/10 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span>ระบบแบบทดสอบ & ประเมินผลหลังเรียน (Assessment & Quizzes)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  ทำแบบทดสอบวัดผลความรู้หลังจบคลาส มี 10 ข้อ เกณฑ์ผ่านชัดเจน ส่งผลการประเมินและเฉลยเข้าอีเมลทันที
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold shrink-0">
                  📝 แบบทดสอบ {quizzes.length} ชุด
                </span>
                <span className="px-4 py-2 rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold shrink-0">
                  🏆 ทำแล้ว {userQuizSubmissions.length} ครั้ง
                </span>
              </div>
            </div>
          </div>

          {quizzes.length === 0 ? (
            <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
              <Award className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h4 className="text-base font-bold text-white mb-1">ยังไม่มีแบบทดสอบในระบบขณะนี้</h4>
              <p className="text-xs text-slate-400 mb-6">
                เมื่อผู้สอนสร้างแบบทดสอบประจำคลาส แบบทดสอบจะปรากฏให้ทำที่นี่พร้อมส่งผลคะแนนเข้าอีเมล
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-amber-400/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>กลับสู่รายการคลาสเรียนของฉัน</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {quizzes.map((quiz) => {
                const latestSub = getLatestSubmissionForQuiz(quiz.id);
                const hasPassed = latestSub?.passed;

                return (
                  <div
                    key={quiz.id}
                    className={`bg-[#101c2d] border rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden ${
                      hasPassed 
                        ? 'border-emerald-500/30 hover:border-emerald-500/50' 
                        : latestSub 
                          ? 'border-amber-400/30 hover:border-amber-400/50' 
                          : 'border-white/10 hover:border-purple-500/40'
                    }`}
                  >
                    <div>
                      {/* Course badge & passing score */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {quiz.classTitle || 'คอร์สเรียน AI'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-slate-400">
                            {quiz.questions?.length || 10} ข้อ
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-amber-400 font-bold">
                            เกณฑ์ผ่าน {quiz.passingScorePercent || 70}%
                          </span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                        <span>{quiz.title}</span>
                      </h4>

                      {quiz.subtitle && (
                        <p className="text-xs text-purple-300/80 mb-2 font-medium">
                          {quiz.subtitle}
                        </p>
                      )}

                      {quiz.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      )}

                      {/* Previous Submission Box */}
                      {latestSub && (
                        <div className={`mt-4 p-3.5 rounded-2xl border text-xs flex flex-col gap-2 ${
                          hasPassed
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1.5">
                              {hasPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                              <span>{hasPassed ? 'ผ่านการประเมินเรียบร้อยแล้ว' : 'ยังไม่ผ่านเกณฑ์การประเมิน'}</span>
                            </span>
                            <span className="font-mono font-black text-sm">
                              {latestSub.score}/{latestSub.totalQuestions} ({latestSub.scorePercent}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/5">
                            <span>ส่งเมื่อ: {new Date(latestSub.submittedAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-emerald-300 flex items-center gap-1">
                              <span>📧 ผลส่งเข้าเมลแล้ว</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-white/10 flex items-center gap-2.5">
                      {latestSub ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setViewingPastSubmission({ quiz, submission: latestSub })}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" />
                            <span>ดูผล & เฉลย</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartQuiz(quiz)}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>ทำใหม่อีกครั้ง</span>
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartQuiz(quiz)}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
                        >
                          <Award className="w-4 h-4" />
                          <span>เริ่มทำแบบทดสอบ (10 ข้อ)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: BOOKINGS LIST (all, online, history) */}
      {/* ========================================================================= */}
      {activeTab !== 'profile' && activeTab !== 'rewards' && activeTab !== 'ebooks' && activeTab !== 'quizzes' && (
        filteredBookings.length === 0 ? (
          <div className="bg-[#101c2d] border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xl">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-white mb-1">ยังไม่มีประวัติการจองคลาสเรียน</h3>
            <p className="text-xs text-slate-400 mb-6">
              เลือกดูตารางคลาสเรียน AI และเวิร์กช็อปที่น่าสนใจเพื่อเริ่มต้นเรียนรู้ได้เลย
            </p>
            <Link
              href="/#classes"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>ดูคลาสเรียนทั้งหมด</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>รายการคลาสเรียนของคุณ</span>
              </h3>
              <span className="text-xs text-slate-400">
                คลิกดูรายละเอียดเพื่ออ่านคู่มือและดาวน์โหลด E-Book ประจำคลาส
              </span>
            </div>

            {filteredBookings.map((b) => {
              const isOnline = b.classType === 'online';
              const isConfirmed = b.bookingStatus === 'confirmed';
              const isPending = b.bookingStatus === 'pending_payment';

              const classInfo = findMatchingClass(b);
              const attachments = classInfo?.attachments || [];

              return (
                <div 
                  key={b.id}
                  className="bg-[#101c2d] border border-white/10 rounded-3xl p-5 sm:p-6 transition-all hover:border-amber-400/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl"
                >
                  {/* Left Column: Image + Details */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
                    {/* Course Image Thumbnail */}
                    <div 
                      onClick={() => setSelectedClassForDetails({ booking: b, classItem: classInfo })}
                      className="w-full sm:w-28 sm:h-28 h-36 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 relative group cursor-pointer shadow-inner"
                      title="คลิกเพื่อดูรายละเอียดคลาสและดาวน์โหลดสื่อการสอน"
                    >
                      <img
                        src={getSafeCourseImageUrl(classInfo?.image)}
                        alt={b.classTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                        <Eye className="w-4 h-4 mr-1 text-amber-400" /> ดูคอร์ส
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {isOnline ? '🌐 คลาสออนไลน์สด' : '🏢 Onsite Workshop'}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isConfirmed 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : isPending 
                              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isConfirmed ? 'ยืนยันเรียบร้อยแล้ว' : isPending ? 'รอตรวจสอบการชำระเงิน' : b.bookingStatus}
                        </span>

                        {isConfirmed && (
                          <span className="bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            รับแต้ม +{Math.round((b.amount || 0) / 10)} pts แล้ว
                          </span>
                        )}

                        <span className="text-[10px] text-slate-500 font-mono">
                          รหัส: {b.id}
                        </span>
                      </div>

                      <h3 
                        onClick={() => setSelectedClassForDetails({ booking: b, classItem: classInfo })}
                        className="text-lg font-bold text-white leading-tight hover:text-amber-400 cursor-pointer transition"
                      >
                        {b.classTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {b.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {b.timeSlot}
                        </span>
                      </div>

                      {/* Online Meeting URL */}
                      {isOnline && (
                        <div className="pt-1">
                          {isConfirmed && b.onlineMeetingUrl ? (
                            <a
                              href={b.onlineMeetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition text-xs font-bold"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>เข้าร่วมห้องเรียนออนไลน์ (Google Meet / Zoom)</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                              <Video className="w-3.5 h-3.5 text-slate-500" />
                              <span>ลิงก์ห้องเรียนจะปรากฏที่นี่หลังแอดมินยืนยันยอดชำระ</span>
                            </div>
                          )}
                        </div>
                      )}

                      {!isOnline && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>สถานที่: เวิร์กช็อปสด Onsite ({classInfo?.location || 'ชั้น 6 M Academy'})</span>
                        </div>
                      )}

                      {/* Attached E-Books / Materials Bar on Card */}
                      {attachments.length > 0 && (
                        <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-amber-400/20 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-amber-300 flex items-center gap-1.5">
                              <Book className="w-3.5 h-3.5 text-amber-400" />
                              <span>เอกสาร & E-Book ประจำคลาส ({attachments.length} ไฟล์)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedClassForDetails({ booking: b, classItem: classInfo })}
                              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                            >
                              ดูทั้งหมด
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {attachments.map((att) => {
                              const info = getAttachmentDownloadInfo(att.url);
                              return (
                                <div key={att.id} className="p-2 rounded-xl bg-slate-900/90 border border-white/5 flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                                      {att.type}
                                    </span>
                                    <span className="truncate text-slate-200 text-[11px] font-medium" title={att.name}>
                                      {att.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <a
                                      href={info.viewUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                      title="เปิดอ่านออนไลน์"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </a>
                                    <a
                                      href={info.downloadUrl}
                                      download={att.name}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                                      title="ดาวน์โหลดไฟล์"
                                    >
                                      <Download className="w-3 h-3" />
                                      <span>โหลด</span>
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions & Price */}
                  <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6 text-right lg:min-w-[200px] flex flex-col justify-between items-stretch lg:items-end gap-3">
                    <div className="flex lg:flex-col justify-between items-center lg:items-end w-full">
                      <span className="text-[10px] text-slate-400 block">ยอดชำระ</span>
                      <span className="text-xl font-extrabold text-amber-400">
                        {b.amount.toLocaleString()} <span className="text-xs font-normal text-slate-300">บาท</span>
                      </span>
                    </div>

                    {/* View Details Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedClassForDetails({ booking: b, classItem: classInfo })}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 active:scale-98 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-400/25 transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-slate-950" />
                      <span>ดูรายละเอียดคลาส & E-Book</span>
                    </button>

                    {/* Post-Class Assessment Button */}
                    {(() => {
                      const linkedQuiz = findQuizForBooking(b) || (quizzes.length > 0 ? quizzes[0] : null);
                      if (!linkedQuiz) return null;
                      const sub = getLatestSubmissionForQuiz(linkedQuiz.id);
                      return (
                        <button
                          type="button"
                          onClick={() => handleStartQuiz(linkedQuiz, b)}
                          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                            sub?.passed
                              ? 'bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 text-purple-200'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5 text-purple-300" />
                          <span>{sub ? `ทำแบบทดสอบซ้ำ (${sub.score}/${sub.totalQuestions})` : '📝 ทำแบบทดสอบหลังเรียน'}</span>
                        </button>
                      );
                    })()}

                    {b.slipUrl && (
                      <button
                        type="button"
                        onClick={() => setViewingSlipBooking(b)}
                        className="text-xs text-slate-400 hover:text-amber-300 underline flex items-center justify-end gap-1 cursor-pointer font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ดูสลิปที่แนบ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLASS DETAILS & E-BOOK DOWNLOADS */}
      {/* ========================================================================= */}
      {selectedClassForDetails && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101c2d] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  selectedClassForDetails.booking.classType === 'online' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedClassForDetails.booking.classType === 'online' ? '🌐 คลาสออนไลน์สด' : '🏢 Onsite Workshop'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  รหัสการจอง: {selectedClassForDetails.booking.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClassForDetails(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Course Banner Cover */}
            <div className="rounded-2xl overflow-hidden relative border border-white/10 bg-slate-900 max-h-56">
              <img
                src={getSafeCourseImageUrl(selectedClassForDetails.classItem?.image)}
                alt={selectedClassForDetails.booking.classTitle}
                className="w-full h-48 sm:h-56 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedClassForDetails.booking.classTitle}
                </h2>
                {selectedClassForDetails.classItem?.subtitle && (
                  <p className="text-xs sm:text-sm text-amber-300 mt-1">
                    {selectedClassForDetails.classItem.subtitle}
                  </p>
                )}
                {(() => {
                  const lvl = getCourseLevelConfig(selectedClassForDetails.classItem?.level);
                  return (
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${lvl.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${lvl.dotColor}`} />
                        <span>ระดับความยาก: {lvl.label} ({lvl.enLabel})</span>
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick Session Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">วันที่เรียน</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {selectedClassForDetails.booking.date}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">เวลาเรียน</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {selectedClassForDetails.booking.timeSlot}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">สถานะคอร์ส</span>
                <span className={`font-bold inline-flex items-center gap-1 ${
                  selectedClassForDetails.booking.bookingStatus === 'confirmed' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedClassForDetails.booking.bookingStatus === 'confirmed' ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                <span className="text-slate-400 block text-[11px] mb-1">ยอดชำระ</span>
                <span className="font-bold text-amber-400">
                  {selectedClassForDetails.booking.amount.toLocaleString()} บาท
                </span>
              </div>
            </div>

            {/* Online link or Onsite address */}
            {selectedClassForDetails.booking.classType === 'online' ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>ห้องเรียนออนไลน์ (Live Session)</span>
                </h4>
                {selectedClassForDetails.booking.bookingStatus === 'confirmed' && selectedClassForDetails.booking.onlineMeetingUrl ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-slate-300 truncate font-mono">
                      {selectedClassForDetails.booking.onlineMeetingUrl}
                    </span>
                    <a
                      href={selectedClassForDetails.booking.onlineMeetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>เข้าร่วมห้องเรียนทันที</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    ลิงก์ห้องเรียน Google Meet / Zoom จะเปิดให้เข้าถึงได้หลังจากได้รับการยืนยันการชำระเงินเรียบร้อยแล้ว
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">สถานที่จัดการอบรม Onsite</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {selectedClassForDetails.classItem?.location || 'NEXUS Bangkok Downtown Campus (ชั้น 6 M Academy)'}
                  </p>
                </div>
              </div>
            )}

            {/* SECTION: DOWNLOAD E-BOOK & MATERIALS */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Book className="w-4 h-4 text-cyan-400" />
                <span>📚 เอกสาร & E-Book ประจำคลาสเรียน (Downloads)</span>
              </h3>

              {selectedClassForDetails.classItem?.attachments && selectedClassForDetails.classItem.attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedClassForDetails.classItem.attachments.map((att) => {
                    const info = getAttachmentDownloadInfo(att.url);
                    return (
                      <div
                        key={att.id}
                        className="p-4 rounded-2xl bg-[#0c1624] border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex flex-col justify-between gap-3 shadow-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                                {att.type || 'E-Book'}
                              </span>
                              {att.size && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {att.size}
                                </span>
                              )}
                            </div>
                            <h5 className="text-xs font-bold text-white line-clamp-2" title={att.name}>
                              {att.name}
                            </h5>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                          <a
                            href={info.viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-400" />
                            <span>เปิดอ่าน</span>
                          </a>

                          <a
                            href={info.downloadUrl}
                            download={att.name}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ดาวน์โหลด</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400">
                  <Book className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  <span>ยังไม่มีเอกสารแนบสำหรับคลาสนี้ ผู้สอนจะอัปโหลดก่อนเริ่มเรียน</span>
                </div>
              )}
            </div>

            {/* Course Description */}
            {selectedClassForDetails.classItem?.description && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>คำอธิบายหลักสูตร (Description)</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 p-4 rounded-2xl border border-white/5 whitespace-pre-line">
                  {selectedClassForDetails.classItem.description}
                </p>
              </div>
            )}

            {/* Topics / Syllabus (สิ่งที่ได้รับ) */}
            {(() => {
              const rawTopics = selectedClassForDetails.classItem?.topics;
              let cleanTopics: string[] = [];
              if (Array.isArray(rawTopics) && rawTopics.length > 0) {
                cleanTopics = rawTopics.filter(t => t && !t.includes('หัวข้อที่ 1') && !t.includes('หัวข้อที่ 2'));
              }
              if (cleanTopics.length === 0 && selectedClassForDetails.classItem?.description) {
                const lines = selectedClassForDetails.classItem.description.split('\n').map(l => l.trim()).filter(Boolean);
                let inTarget = false;
                for (const l of lines) {
                  if (/^(🎯|🎁|✅|หัวข้อ|สิ่งที่คุณจะได้เรียนรู้|สิ่งที่ได้รับ|สิ่งที่จะได้เรียน|เรียนจบแล้ว)/.test(l)) {
                    inTarget = true;
                    continue;
                  }
                  if (inTarget && /^(👨‍💻|📅|🕐|📍|💰|👥|💻|📝|✨)/.test(l)) {
                    inTarget = false;
                    continue;
                  }
                  if (/^(\d+[\.\)]|[-*•✦✅]|(\d{2}\s+[A-Z]+:))/.test(l)) {
                    const clean = l.replace(/^[-*•✦✅\d.)\s]+/, '').trim();
                    if (clean && !cleanTopics.includes(clean)) cleanTopics.push(clean);
                  } else if (inTarget && l.length > 5 && l.length < 120 && !l.includes('http')) {
                    if (!cleanTopics.includes(l)) cleanTopics.push(l);
                  }
                }
              }
              if (cleanTopics.length === 0) return null;

              return (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>สิ่งที่ได้รับและหัวข้อการเรียนรู้ ({cleanTopics.length} ข้อ)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cleanTopics.map((topic, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Tools Used */}
            {selectedClassForDetails.classItem?.toolsUsed && selectedClassForDetails.classItem.toolsUsed.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>เครื่องมือและ AI ที่ใช้ฝึกปฏิบัติ (Tools & Tech)</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClassForDetails.classItem.toolsUsed.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-slate-900 border border-amber-400/30 text-amber-300 text-xs font-semibold"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {selectedClassForDetails.classItem?.prerequisites && (
              <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>สิ่งที่ต้องเตรียมตัวก่อนเข้าเรียน (Prerequisites)</span>
                </h4>
                <p className="text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  {selectedClassForDetails.classItem.prerequisites}
                </p>
              </div>
            )}

            {/* Post-Class Assessment Section in Details Modal */}
            {(() => {
              const modalQuiz = findQuizForBooking(selectedClassForDetails.booking) || (quizzes.length > 0 ? quizzes[0] : null);
              if (!modalQuiz) return null;
              const sub = getLatestSubmissionForQuiz(modalQuiz.id);
              return (
                <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <span>แบบทดสอบวัดผลหลังเรียน (Assessment & Quiz)</span>
                          <span className="text-[10px] text-purple-300 font-normal">({modalQuiz.questions?.length || 10} ข้อ)</span>
                        </h4>
                        <p className="text-[11px] text-purple-200/80">เกณฑ์ผ่าน {modalQuiz.passingScorePercent || 70}% • มีเฉลยและส่งผลคะแนนเข้าอีเมล</p>
                      </div>
                    </div>
                    {sub && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                        sub.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {sub.passed ? `✅ ผ่าน (${sub.score}/${sub.totalQuestions})` : `⚠️ ได้ ${sub.score}/${sub.totalQuestions}`}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const quizToTake = modalQuiz;
                      const bookingForQuiz = selectedClassForDetails.booking;
                      setSelectedClassForDetails(null);
                      handleStartQuiz(quizToTake, bookingForQuiz);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>{sub ? `ทำแบบทดสอบอีกครั้ง (คะแนนล่าสุด ${sub.score}/${sub.totalQuestions})` : 'เริ่มทำแบบทดสอบหลังเรียนทันที (10 ข้อ)'}</span>
                  </button>
                </div>
              );
            })()}

            {/* Footer Close */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClassForDetails(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: View Slip for Student */}
      {viewingSlipBooking && viewingSlipBooking.slipUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101c2d] border border-white/15 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>สลิปหลักฐานการโอนเงิน</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  รหัสการจอง: <span className="text-amber-400 font-mono font-bold">{viewingSlipBooking.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSlipBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-3 border border-white/10 flex items-center justify-center max-h-[60vh] overflow-auto">
              <img
                src={viewingSlipBooking.slipUrl}
                alt={`Slip for booking ${viewingSlipBooking.id}`}
                className="max-h-[55vh] max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400">
                ยอดเงิน: <strong className="text-amber-400 font-bold">{viewingSlipBooking.amount.toLocaleString()} บาท</strong>
              </span>
              <a
                href={viewingSlipBooking.slipUrl}
                download={`slip-${viewingSlipBooking.id}.png`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>ดาวน์โหลดรูป</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TAKE POST-CLASS ASSESSMENT (QUIZ) */}
      {/* ========================================================================= */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101c2d] border border-purple-500/30 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {activeQuiz.classTitle || 'คอร์สเรียน AI'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    เกณฑ์ผ่าน {activeQuiz.passingScorePercent || 70}%
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">
                  {activeQuiz.title}
                </h3>
                {activeQuiz.subtitle && (
                  <p className="text-xs text-slate-300 mt-1">
                    {activeQuiz.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('ต้องการยกเลิกการทำแบบทดสอบหรือไม่?')) {
                    setActiveQuiz(null);
                  }
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Student & Progress Bar */}
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-400">
                  ผู้เข้าทดสอบ: <strong className="text-white">{user?.name || 'ผู้เรียน'}</strong> ({user?.email})
                </span>
                {(() => {
                  const answeredCount = activeQuiz.questions.filter((_, idx) => quizAnswers[idx] !== undefined && quizAnswers[idx] !== -1).length;
                  const total = activeQuiz.questions.length;
                  const pct = Math.round((answeredCount / (total || 1)) * 100);
                  return (
                    <span className="font-bold text-purple-300">
                      ตอบแล้ว {answeredCount}/{total} ข้อ ({pct}%)
                    </span>
                  );
                })()}
              </div>
              {(() => {
                const answeredCount = activeQuiz.questions.filter((_, idx) => quizAnswers[idx] !== undefined && quizAnswers[idx] !== -1).length;
                const total = activeQuiz.questions.length;
                const pct = Math.round((answeredCount / (total || 1)) * 100);
                return (
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => {
                const currentAnswer = quizAnswers[qIdx];
                const isAnswered = currentAnswer !== undefined && currentAnswer !== -1;

                return (
                  <div
                    key={q.id || qIdx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAnswered 
                        ? 'bg-slate-900/90 border-purple-500/40' 
                        : 'bg-slate-900/50 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isAnswered ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white pt-0.5 leading-relaxed">
                        {q.question}
                      </h4>
                    </div>

                    {/* Choices */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-0 sm:ml-10">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = currentAnswer === optIdx;
                        const label = String.fromCharCode(65 + optIdx); // A, B, C, D

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => {
                              setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                            }}
                            className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-500/10 font-medium'
                                : 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/20'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800 text-slate-400 border border-white/10'
                            }`}>
                              {label}
                            </span>
                            <span className="flex-1 leading-snug">{opt}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400">
                * ตรวจคะแนนทันที พร้อมแสดงเฉลยและส่งผลคะแนนเข้าอีเมลของคุณ
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('ต้องการยกเลิกการทำแบบทดสอบหรือไม่?')) {
                      setActiveQuiz(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex-1 sm:flex-initial cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isSubmittingQuiz}
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition disabled:opacity-50 flex-1 sm:flex-initial cursor-pointer"
                >
                  {isSubmittingQuiz ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่ง & ประมวลผล...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>ส่งแบบทดสอบ & ดูผลคะแนน</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSESSMENT RESULT & REVIEW */}
      {/* ========================================================================= */}
      {quizResultModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101c2d] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Score Card */}
            <div className={`p-6 rounded-3xl border text-center space-y-3 ${
              quizResultModal.passed
                ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/40 text-emerald-200'
                : 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/40 text-rose-200'
            }`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mx-auto text-3xl">
                {quizResultModal.passed ? '🏆' : '📝'}
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase inline-block mb-2 ${
                  quizResultModal.passed 
                    ? 'bg-emerald-500 text-slate-950' 
                    : 'bg-rose-500 text-white'
                }`}>
                  {quizResultModal.passed ? '🎉 ยินดีด้วย! ผ่านการประเมิน' : '⚠️ ไม่ผ่านเกณฑ์ (เกณฑ์ผ่าน ' + quizResultModal.passingScorePercent + '%)'}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {quizResultModal.submission.quizTitle}
                </h3>
              </div>

              {/* Big Score Display */}
              <div className="py-2">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                  {quizResultModal.score}
                </span>
                <span className="text-xl sm:text-2xl font-medium text-slate-400 font-mono">
                  {' '}/ {quizResultModal.totalQuestions} คะแนน
                </span>
                <div className="text-base font-bold text-amber-400 mt-1">
                  คิดเป็น {quizResultModal.scorePercent}%
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 max-w-md mx-auto flex items-center justify-center gap-2">
                <span>📧</span>
                <span>ระบบได้ส่งผลการประเมินอย่างละเอียดไปยังอีเมล <strong className="text-white">{quizResultModal.submission.userEmail}</strong> เรียบร้อยแล้ว</span>
              </div>
            </div>

            {/* Detailed Question Review */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>เฉลยคำตอบและคำอธิบาย (Question Review)</span>
              </h4>

              {quizResultModal.questionReview.map((item, idx) => {
                const userLetter = item.userAnswer >= 0 ? String.fromCharCode(65 + item.userAnswer) : '-';
                const correctLetter = String.fromCharCode(65 + item.correctOptionIndex);

                return (
                  <div
                    key={item.id || idx}
                    className={`p-4 rounded-2xl border text-xs space-y-3 ${
                      item.isCorrect 
                        ? 'bg-slate-900/60 border-emerald-500/30' 
                        : 'bg-slate-900/60 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${
                          item.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <h5 className="font-bold text-white leading-relaxed">
                          {item.question}
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                        item.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {item.isCorrect ? 'ถูกต้อง +1' : 'ตอบผิด 0'}
                      </span>
                    </div>

                    {/* Answers Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        item.isCorrect
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                      }`}>
                        <span>คำตอบของคุณ: <strong>{userLetter}. {item.options[item.userAnswer] || 'ไม่ได้ตอบ'}</strong></span>
                        {item.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                      </div>

                      {!item.isCorrect && (
                        <div className="p-2.5 rounded-xl border bg-emerald-950/30 border-emerald-500/30 text-emerald-200 flex items-center justify-between">
                          <span>คำตอบที่ถูกต้อง: <strong>{correctLetter}. {item.options[item.correctOptionIndex]}</strong></span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {item.explanation && (
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-slate-300 text-[11px] leading-relaxed">
                        <span className="font-bold text-amber-400 mr-1.5">💡 คำอธิบายเฉลย:</span>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const q = quizzes.find(item => item.id === quizResultModal.submission.quizId);
                  setQuizResultModal(null);
                  if (q) handleStartQuiz(q);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ทำแบบทดสอบอีกครั้ง (Retake)</span>
              </button>
              <button
                type="button"
                onClick={() => setQuizResultModal(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW PAST SUBMISSION DETAILS */}
      {/* ========================================================================= */}
      {viewingPastSubmission && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101c2d] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  viewingPastSubmission.submission.passed 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {viewingPastSubmission.submission.passed ? '✅ ผ่านการประเมิน' : '⚠️ ไม่ผ่านเกณฑ์'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  ผลการประเมิน: {viewingPastSubmission.quiz.title}
                </h3>
                <p className="text-xs text-slate-400">
                  ส่งเมื่อ {new Date(viewingPastSubmission.submission.submittedAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })} • ได้ {viewingPastSubmission.submission.score}/{viewingPastSubmission.submission.totalQuestions} คะแนน ({viewingPastSubmission.submission.scorePercent}%)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingPastSubmission(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-3">
              {viewingPastSubmission.quiz.questions.map((q, idx) => {
                const userAns = viewingPastSubmission.submission.answers[idx];
                const userLetter = userAns !== undefined && userAns >= 0 ? String.fromCharCode(65 + userAns) : '-';
                const userChoiceText = userAns !== undefined && userAns >= 0 ? q.options[userAns] : 'ไม่ได้ตอบ';

                return (
                  <div key={q.id || idx} className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 text-xs space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-purple-400 shrink-0">ข้อ {idx + 1}:</span>
                      <span className="text-white font-medium">{q.question}</span>
                    </div>
                    <div className="text-[11px] text-slate-300 pl-6">
                      คำตอบที่คุณเลือก: <strong className="text-amber-300">{userLetter}. {userChoiceText}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const q = viewingPastSubmission.quiz;
                  setViewingPastSubmission(null);
                  handleStartQuiz(q);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ทำแบบทดสอบอีกครั้ง</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingPastSubmission(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

