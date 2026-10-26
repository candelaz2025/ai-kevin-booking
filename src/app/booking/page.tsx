'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import CalendarPicker from '@/components/CalendarPicker';
import PaymentSection from '@/components/PaymentSection';
import { ClassItem, PaymentMethod, formatClassDuration, isClassFree, getCourseLevelConfig } from '@/lib/types';
import { getSafeCourseImageUrl } from '@/lib/image-utils';
import { checkSpamEmail } from '@/lib/anti-spam';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  UserCheck,
  Pencil,
  Check,
  RotateCcw,
  Gift
} from 'lucide-react';
import confetti from 'canvas-confetti';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get('classId') || 'ai-content-workshop';
  const dateParam = searchParams.get('date');
  const slotParam = searchParams.get('slot');

  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [lineId, setLineId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Returning Student States (สำหรับผู้เรียนที่เคยจองแล้ว รอบ 2 ขึ้นไป)
  const [isReturningStudent, setIsReturningStudent] = useState<boolean>(false);
  const [previousBookingsCount, setPreviousBookingsCount] = useState<number>(0);
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [isLoadingPreviousData, setIsLoadingPreviousData] = useState<boolean>(false);

  // Booking result state
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Function to look up returning student data from previous bookings and profile
  const lookupPreviousStudentData = useCallback(async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) return;
    const clean = targetEmail.trim().toLowerCase();
    setIsLoadingPreviousData(true);

    try {
      // 1. Fetch previous bookings for this student
      const bookingsRes = await fetch(`/api/bookings?userEmail=${encodeURIComponent(clean)}`);
      const bookingsData = await bookingsRes.json();

      let profilePhone = '';
      try {
        const profileRes = await fetch(`/api/user/profile?email=${encodeURIComponent(clean)}`);
        const profileData = await profileRes.json();
        if (profileData.success && profileData.user?.phone) {
          profilePhone = profileData.user.phone;
        }
      } catch {
        // ignore profile error
      }

      if (bookingsData.success && Array.isArray(bookingsData.data) && bookingsData.data.length > 0) {
        const list = bookingsData.data;
        const latest = list[0]; // Most recent booking

        setIsReturningStudent(true);
        setPreviousBookingsCount(list.length);
        setIsEditingInfo(false);

        if (latest.userName) setUserName(latest.userName);
        if (latest.userEmail) setUserEmail(latest.userEmail);
        if (latest.userPhone || profilePhone) setUserPhone(latest.userPhone || profilePhone);
        if (latest.lineId) setLineId(latest.lineId);

        // Cache for quick load in localStorage
        try {
          localStorage.setItem('ai_kevin_last_student_info', JSON.stringify({
            userName: latest.userName,
            userEmail: latest.userEmail,
            userPhone: latest.userPhone || profilePhone,
            lineId: latest.lineId || ''
          }));
        } catch {}
      }
    } catch (err) {
      console.error('Error looking up previous student data:', err);
    } finally {
      setIsLoadingPreviousData(false);
    }
  }, []);

  // Fetch classes
  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setClasses(data.data);
          const found = data.data.find((c: ClassItem) => c.id === classIdParam) || data.data[0];
          setSelectedClass(found);
          const initialDate = dateParam || (found.availableDates?.length > 0 ? found.availableDates[0] : new Date().toISOString().slice(0, 10));
          setSelectedDate(initialDate);
          const initialSlot = slotParam || (found.timeSlots?.length > 0 ? found.timeSlots[0] : '13:00 - 16:00');
          setSelectedTimeSlot(initialSlot);
        }
      })
      .finally(() => setLoadingClasses(false));
  }, [classIdParam, dateParam, slotParam]);

  // Capture referral code from URL if present
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      try {
        localStorage.setItem('kevin_ai_referrer', refParam.trim());
      } catch {}
    }
  }, [searchParams]);

  // Sync user info from auth & detect returning student
  useEffect(() => {
    // 1. Try local storage cache first for instant pre-fill
    try {
      const cached = localStorage.getItem('ai_kevin_last_student_info');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.userEmail) {
          setUserName(prev => prev || parsed.userName || '');
          setUserEmail(prev => prev || parsed.userEmail || '');
          setUserPhone(prev => prev || parsed.userPhone || '');
          setLineId(prev => prev || parsed.lineId || '');
        }
      }
    } catch {}

    // 2. If logged in, fetch live bookings to check for 2nd round booking
    if (user?.email) {
      setUserEmail(user.email);
      if (user.name) setUserName(prev => prev || user.name);
      lookupPreviousStudentData(user.email);
    }
  }, [user, lookupPreviousStudentData]);

  // Check email when user finishes typing email (for non-logged in users)
  const handleEmailBlur = () => {
    if (userEmail && userEmail.includes('@') && !isReturningStudent) {
      lookupPreviousStudentData(userEmail);
    }
  };

  const handleSelectSlot = (date: string, timeSlot: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
  };

  const handlePayment = async (method: PaymentMethod, slipUrl?: string, stripeId?: string) => {
    // Prevent double submissions / multiple clicks
    if (isSubmitting) return;

    if (!selectedClass || !selectedDate || !selectedTimeSlot) {
      alert('กรุณาเลือกวันและเวลาที่ต้องการเรียนก่อนดำเนินการ');
      return;
    }
    if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล, อีเมล และเบอร์โทรศัพท์');
      return;
    }

    // Anti-Spam protection: Check email format and block @example.com or disposable emails
    const spamCheck = checkSpamEmail(userEmail);
    if (spamCheck.isBlocked) {
      alert(spamCheck.reason || 'ไม่อนุญาตให้ใช้อีเมล @example.com หรืออีเมลชั่วคราวในการจอง กรุณาใช้อีเมลจริง');
      return;
    }

    setIsSubmitting(true);
    try {
      const storedRef = typeof window !== 'undefined' ? (localStorage.getItem('kevin_ai_referrer') || searchParams.get('ref')) : null;
      const payload = {
        classId: selectedClass.id,
        classTitle: selectedClass.title,
        classType: selectedClass.type,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        userId: user?.id || 'guest',
        userName,
        userEmail,
        userPhone,
        lineId,
        notes,
        amount: isClassFree(selectedClass) ? 0 : selectedClass.price,
        paymentMethod: method,
        slipUrl: isClassFree(selectedClass) ? 'FREE_ENROLLMENT' : slipUrl,
        stripePaymentIntentId: stripeId,
        referredBy: storedRef || undefined
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setCreatedBooking(data.data);
        setBookingSuccess(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Save contact info in localStorage for instant retrieval on next booking
        try {
          localStorage.setItem('ai_kevin_last_student_info', JSON.stringify({
            userName,
            userEmail,
            userPhone,
            lineId
          }));
        } catch {}

        // If student is logged in, sync phone to their user profile
        if (user?.email && userPhone) {
          fetch('/api/user/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: userName,
              phone: userPhone
            })
          }).catch(() => {});
        }
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err: any) {
      alert(`ไม่สามารถทำรายการได้: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (bookingSuccess && createdBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">
          {createdBooking.bookingStatus === 'confirmed' ? '🎉 ยืนยันการจองและชำระเงินสำเร็จแล้ว!' : '📋 บันทึกการจองเรียบร้อยแล้ว!'}
        </h1>
        <p className="text-slate-300 max-w-md mx-auto mb-8 text-sm">
          รหัสการจอง: <span className="font-mono font-bold text-amber-400">{createdBooking.id}</span>
          <br />
          ระบบได้ส่งอีเมลแจ้งเตือนไปยังแอดมิน และส่งรายละเอียดไปยังอีเมล <span className="text-white font-medium">{createdBooking.userEmail}</span> แล้ว
        </p>

        {/* Info card */}
        <div className="bg-[#101c2d] border border-white/10 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-4 mb-8">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400">คลาสเรียน</span>
            <span className="text-sm font-bold text-white">{createdBooking.classTitle}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400">วันและเวลานัดหมาย</span>
            <span className="text-sm font-semibold text-amber-400">{createdBooking.date} ({createdBooking.timeSlot})</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400">วิธีชำระเงิน</span>
            <span className="text-sm text-slate-200">
              {createdBooking.paymentMethod === 'stripe' ? 'บัตรเครดิต (Stripe)' : 'PromptPay QR Code'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400">สถานะ</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              createdBooking.bookingStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              {createdBooking.bookingStatus === 'confirmed' ? 'ยืนยันแล้ว' : 'รอตรวจสอบการชำระเงิน'}
            </span>
          </div>

          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs text-slate-400">แต้มสะสมที่จะได้รับจากคลาสนี้</span>
            <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              +{selectedClass?.rewardPoints ?? Math.round((createdBooking.amount || 0) / 10)} แต้ม
            </span>
          </div>

          {createdBooking.onlineMeetingUrl && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-4">
              <span className="text-xs text-emerald-400 font-bold block mb-1">🔗 ลิงก์ห้องเรียนออนไลน์ (Google Meet / Zoom):</span>
              <a 
                href={createdBooking.onlineMeetingUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-300 underline font-mono break-all"
              >
                {createdBooking.onlineMeetingUrl}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-400/20 transition-all text-sm"
          >
            ดูประวัติการจองใน Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all text-sm"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารวมคลาส
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
          จองคลาสเรียน AI กับ อ. Kevin
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          เลือกคลาส วันที่ว่างในปฏิทิน กรอกข้อมูลผู้เรียน และเลือกวิธีชำระเงิน
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Class Selection & Calendar (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Class Select dropdown / radio */}
          <div className="bg-[#101c2d] border border-white/10 rounded-2xl p-6 shadow-xl">
            <label className="block text-xs font-semibold text-slate-300 mb-3">
              1. เลือกหลักสูตร / คลาสเรียนที่ต้องการ
            </label>
            <div className="space-y-3">
              {classes.map(c => {
                const isSelected = selectedClass?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClass(c);
                      const nextDate = c.availableDates?.length > 0 ? c.availableDates[0] : (selectedDate || new Date().toISOString().slice(0, 10));
                      setSelectedDate(nextDate);
                      if (c.timeSlots?.length > 0) setSelectedTimeSlot(c.timeSlots[0]);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-400/10'
                        : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                      {(() => {
                        const imgSrc = getSafeCourseImageUrl(c.image);
                        const isDataUrl = imgSrc.startsWith('data:');
                        return (
                          <Image
                            src={imgSrc}
                            alt={c.title}
                            fill
                            unoptimized={isDataUrl}
                            className="object-cover"
                          />
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.type === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {c.type === 'online' ? '🌐 คลาสออนไลน์' : '🏢 Onsite Workshop'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          • <Clock className="w-3 h-3 text-amber-400" /> {formatClassDuration(c)}
                        </span>
                        {(() => {
                          const lvl = getCourseLevelConfig(c.level);
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${lvl.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${lvl.dotColor}`} />
                              <span>ระดับ{lvl.label}</span>
                            </span>
                          );
                        })()}
                        {isClassFree(c) && (
                          <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Gift className="w-3 h-3 text-emerald-400" />
                            เรียนฟรี (FREE)
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{c.title}</h4>
                      {c.subtitle && (
                        <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{c.subtitle}</p>
                      )}
                      {isSelected && c.description && (
                        <div className="mt-2 pt-2 border-t border-white/10 text-[11px] text-slate-300 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto pr-1">
                          {c.description}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="font-extrabold text-sm">
                          {isClassFree(c) ? (
                            <span className="text-emerald-400 text-base font-extrabold">
                              ฟรี 0 <span className="text-xs font-normal text-slate-300">บาท</span>
                            </span>
                          ) : (
                            <span className="text-amber-400">
                              {c.price.toLocaleString()} <span className="text-xs font-normal text-slate-300">บาท</span>
                            </span>
                          )}
                        </div>
                        <span className="bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          รับ +{c.rewardPoints ?? Math.round(c.price / 10)} แต้ม
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar picker */}
          <div>
            <CalendarPicker
              selectedClass={selectedClass}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              onSelectSlot={handleSelectSlot}
            />
          </div>

        </div>

        {/* Right Column: User Details & Payment (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Student Info Form */}
          <div className="bg-[#101c2d] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>👤</span> ข้อมูลผู้เรียน
              </h3>
              {isReturningStudent && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>นักเรียนเดิม (จองรอบที่ {previousBookingsCount + 1})</span>
                </span>
              )}
            </div>

            {isLoadingPreviousData && (
              <div className="flex items-center gap-2 text-xs text-amber-400 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังดึงข้อมูลผู้เรียนจากการจองครั้งก่อน...</span>
              </div>
            )}

            {/* Case 1: Returning Student Display Card (ไม่ต้องกรอกซ้ำ ดึงข้อมูลเดิมมาโชว์ทันที) */}
            {isReturningStudent && !isEditingInfo ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        ยินดีต้อนรับกลับคุณ {userName} 👋
                      </p>
                      <p className="text-[11px] text-slate-300">
                        ดึงข้อมูลจากการจองครั้งก่อนให้อัตโนมัติ สามารถเลือกวันและชำระเงินได้ทันที
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingInfo(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                    title="ต้องการเปลี่ยนเบอร์ หรือ Line ID"
                  >
                    <Pencil className="w-3 h-3 text-amber-400" />
                    <span>แก้ไข</span>
                  </button>
                </div>

                {/* Info Grid */}
                <div className="bg-slate-900/70 border border-white/5 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[11px]">ชื่อ - นามสกุล:</span>
                    <strong className="text-white text-sm block font-medium">{userName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[11px]">อีเมล (รับลิงก์เรียน):</span>
                    <strong className="text-amber-300 font-mono text-xs block">{userEmail}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[11px]">เบอร์โทรศัพท์:</span>
                    <strong className="text-white font-mono text-xs block">{userPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 text-[11px]">Line ID:</span>
                    <strong className="text-slate-200 text-xs block">{lineId || '-'}</strong>
                  </div>
                </div>

                {/* Notes for this booking */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    หัวข้อหรือโจทย์ AI ที่สนใจเพิ่มเติมในรอบนี้ (ถ้ามี)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="เช่น สอบถามเรื่องต่อ API จากรอบที่แล้ว หรือปรึกษาโปรเจกต์งานส่วนตัว"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ) : (
              /* Case 2: Form Inputs (สำหรับผู้เรียนใหม่ หรือกดปุ่มแก้ไขข้อมูล) */
              <div className="space-y-3">
                {isReturningStudent && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                    <span className="text-xs text-amber-400 font-semibold">แก้ไขข้อมูลผู้เรียนสำหรับรอบนี้:</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingInfo(false)}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      ยกเลิก / ใช้ข้อมูลเดิม
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อ - นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">อีเมล (รับลิงก์เรียน) *</label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onBlur={handleEmailBlur}
                      onChange={e => setUserEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">เบอร์โทรศัพท์ *</label>
                    <input
                      type="tel"
                      required
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Line ID (ถ้ามี)</label>
                  <input
                    type="text"
                    value={lineId}
                    onChange={e => setLineId(e.target.value)}
                    placeholder="ID Line สำหรับประสานงานด่วน"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">หัวข้อหรือโจทย์ AI ที่สนใจเป็นพิเศษ</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="เช่น ต้องการสร้าง AI ช่วยตอบแชท หรือทำภาพโฆษณาสินค้า"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          {selectedClass && (
            <PaymentSection
              amount={isClassFree(selectedClass) ? 0 : selectedClass.price}
              isFree={isClassFree(selectedClass)}
              isSubmitting={isSubmitting}
              onPaymentSuccess={handlePayment}
              bookingSummary={{
                className: selectedClass.title,
                date: selectedDate,
                timeSlot: selectedTimeSlot,
                userName
              }}
            />
          )}

        </div>

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>}>
      <BookingContent />
    </React.Suspense>
  );
}
