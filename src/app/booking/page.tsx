'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCart, CartItem } from '@/lib/cart-context';
import CalendarPicker from '@/components/CalendarPicker';
import PaymentSection from '@/components/PaymentSection';
import { 
  ClassItem, 
  PaymentMethod, 
  formatClassDuration, 
  isClassFree, 
  getCourseLevelConfig, 
  COURSE_LEVELS 
} from '@/lib/types';
import { getSafeCourseImageUrl } from '@/lib/image-utils';
import { checkSpamEmail } from '@/lib/anti-spam';
import { 
  ArrowLeft, 
  ArrowRight,
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  UserCheck,
  Pencil,
  Check,
  Gift,
  Search,
  ShoppingCart,
  Trash2,
  Calendar,
  CreditCard,
  Mail,
  Hourglass,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Info,
  HelpCircle,
  AlertCircle,
  Users,
  User,
  Building,
  Plus,
  Minus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateGroupDiscount } from '@/lib/cart-context';

// 6 Core Steps as explicitly requested by user
type FlowStep = 'find' | 'select' | 'cart' | 'confirm' | 'payment' | 'waiting';

interface CreatedBookingSummary {
  id: string;
  classTitle: string;
  date: string;
  timeSlot: string;
  amount: number;
  userEmail: string;
  userName: string;
  bookingStatus: string;
  paymentMethod?: string;
  paymentDueAt?: string;
  onlineMeetingUrl?: string;
  bookingType?: 'individual' | 'private_group';
  attendeeCount?: number;
  groupName?: string;
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClassId = searchParams.get('classId');
  const initialStepParam = searchParams.get('step') as FlowStep | null;
  const dateParam = searchParams.get('date');
  const slotParam = searchParams.get('slot');

  const { user } = useAuth();
  const { 
    items: cartItems, 
    addItem, 
    removeItem, 
    updateItemSlot, 
    updateItemAttendees,
    clearCart, 
    totalAmount, 
    totalPoints, 
    totalItems,
    isInCart 
  } = useCart();

  // Active step in the 6-step flow
  const [currentStep, setCurrentStep] = useState<FlowStep>('find');

  // Master classes catalog
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Step 1: Find courses filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'online' | 'onsite'>('all');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  // Step 2: Selected class details & schedule selection
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Private Group Booking State
  const [bookingType, setBookingType] = useState<'individual' | 'private_group'>('individual');
  const [attendeeCount, setAttendeeCount] = useState<number>(1);
  const [groupName, setGroupName] = useState<string>('');
  const [additionalAttendees, setAdditionalAttendees] = useState<string>('');

  // Live Group Discount calculation for currently selected class in Step 2
  const selectedDiscount = useMemo(() => {
    if (bookingType !== 'private_group') return { percent: 0, label: 'ราคาปกติ' };
    return calculateGroupDiscount(attendeeCount);
  }, [bookingType, attendeeCount]);

  const selectedCalculatedPrice = useMemo(() => {
    if (!selectedClass) return 0;
    if (isClassFree(selectedClass)) return 0;
    const unit = selectedClass.price || 0;
    const count = bookingType === 'private_group' ? Math.max(2, attendeeCount) : 1;
    const subtotal = unit * count;
    const discountAmount = Math.round((subtotal * selectedDiscount.percent) / 100);
    return Math.max(0, subtotal - discountAmount);
  }, [selectedClass, bookingType, attendeeCount, selectedDiscount]);

  const selectedDiscountAmount = useMemo(() => {
    if (!selectedClass || isClassFree(selectedClass) || bookingType !== 'private_group') return 0;
    const unit = selectedClass.price || 0;
    const count = Math.max(2, attendeeCount);
    return Math.round((unit * count * selectedDiscount.percent) / 100);
  }, [selectedClass, bookingType, attendeeCount, selectedDiscount]);

  // Step 4: Student info
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [lineId, setLineId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Returning student detection
  const [isReturningStudent, setIsReturningStudent] = useState<boolean>(false);
  const [previousBookingsCount, setPreviousBookingsCount] = useState<number>(0);
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);
  const [isLoadingPreviousData, setIsLoadingPreviousData] = useState<boolean>(false);

  // Step 5 & 6: Booking submission results
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBookings, setCreatedBookings] = useState<CreatedBookingSummary[]>([]);
  const isAnyPayLater = createdBookings.some(b => b.paymentMethod === 'pay_later_7days');
  const sampleDue = createdBookings.find(b => b.paymentDueAt)?.paymentDueAt;
  const payLaterDueDateStr = sampleDue 
    ? new Date(sampleDue).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });

  // Feedback Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Lookup returning student data
  const lookupPreviousStudentData = useCallback(async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) return;
    const clean = targetEmail.trim().toLowerCase();
    setIsLoadingPreviousData(true);

    try {
      const bookingsRes = await fetch(`/api/bookings?userEmail=${encodeURIComponent(clean)}`);
      const bookingsData = await bookingsRes.json();

      let profilePhone = '';
      try {
        const profileRes = await fetch(`/api/user/profile?email=${encodeURIComponent(clean)}`);
        const profileData = await profileRes.json();
        if (profileData.success && profileData.user?.phone) {
          profilePhone = profileData.user.phone;
        }
      } catch {}

      if (bookingsData.success && Array.isArray(bookingsData.data) && bookingsData.data.length > 0) {
        const list = bookingsData.data;
        const latest = list[0];

        setIsReturningStudent(true);
        setPreviousBookingsCount(list.length);
        setIsEditingInfo(false);

        if (latest.userName) setUserName(latest.userName);
        if (latest.userEmail) setUserEmail(latest.userEmail);
        if (latest.userPhone || profilePhone) setUserPhone(latest.userPhone || profilePhone);
        if (latest.lineId) setLineId(latest.lineId);

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

  // Fetch classes on mount
  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          const list: ClassItem[] = data.data;
          setClasses(list);

          // Route initial step based on query params
          if (initialStepParam === 'cart') {
            setCurrentStep('cart');
          } else if (initialClassId) {
            const found = list.find(c => c.id === initialClassId);
            if (found) {
              setSelectedClass(found);
              const initDate = dateParam || (found.availableDates?.length > 0 ? found.availableDates[0] : new Date().toISOString().slice(0, 10));
              setSelectedDate(initDate);
              const initSlot = slotParam || (found.timeSlots?.length > 0 ? found.timeSlots[0] : '13:00 - 16:00');
              setSelectedTimeSlot(initSlot);
              setCurrentStep('select');
            } else {
              setCurrentStep('find');
            }
          } else {
            setCurrentStep('find');
          }
        }
      })
      .catch(err => {
        console.error('Failed to load classes:', err);
      })
      .finally(() => setLoadingClasses(false));
  }, [initialClassId, initialStepParam, dateParam, slotParam]);

  // Load cached student contact info or auth session
  useEffect(() => {
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

    if (user?.email) {
      setUserEmail(user.email);
      if (user.name) setUserName(prev => prev || user.name);
      lookupPreviousStudentData(user.email);
    }
  }, [user, lookupPreviousStudentData]);

  // Check email on blur for returning student auto-fill
  const handleEmailBlur = () => {
    if (userEmail && userEmail.includes('@') && !isReturningStudent) {
      lookupPreviousStudentData(userEmail);
    }
  };

  // Filter courses for Step 1
  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classes.filter(c => {
      // Level filter
      if (selectedLevelFilter !== 'all' && (c.level || 'beginner') !== selectedLevelFilter) {
        return false;
      }
      // Type filter
      if (selectedTypeFilter !== 'all' && c.type !== selectedTypeFilter) {
        return false;
      }
      // Price filter
      if (selectedPriceFilter === 'free' && !isClassFree(c)) return false;
      if (selectedPriceFilter === 'paid' && isClassFree(c)) return false;

      // Text search query
      if (q) {
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const subtitleMatch = (c.subtitle || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const toolsMatch = (c.toolsUsed || []).some(t => t.toLowerCase().includes(q));
        const topicsMatch = (c.topics || []).some(t => t.toLowerCase().includes(q));
        return titleMatch || subtitleMatch || descMatch || toolsMatch || topicsMatch;
      }
      return true;
    });
  }, [classes, searchQuery, selectedLevelFilter, selectedTypeFilter, selectedPriceFilter]);

  // Action: Choose class to inspect and configure schedule (Step 1 -> Step 2)
  const handleChooseClass = (cls: ClassItem) => {
    setSelectedClass(cls);
    const initDate = cls.availableDates?.length > 0 ? cls.availableDates[0] : new Date().toISOString().slice(0, 10);
    setSelectedDate(initDate);
    const initSlot = cls.timeSlots?.length > 0 ? cls.timeSlots[0] : '13:00 - 16:00';
    setSelectedTimeSlot(initSlot);
    setCurrentStep('select');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Quick Add to Cart with default slot
  const handleQuickAddToCart = (cls: ClassItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultDate = cls.availableDates?.length > 0 ? cls.availableDates[0] : new Date().toISOString().slice(0, 10);
    const defaultSlot = cls.timeSlots?.length > 0 ? cls.timeSlots[0] : '13:00 - 16:00';

    addItem({
      classId: cls.id,
      classTitle: cls.title,
      subtitle: cls.subtitle,
      classType: cls.type,
      price: isClassFree(cls) ? 0 : cls.price,
      isFree: isClassFree(cls),
      rewardPoints: cls.rewardPoints ?? Math.round((cls.price || 0) / 10),
      image: cls.image,
      date: defaultDate,
      timeSlot: defaultSlot,
      durationText: formatClassDuration(cls),
      level: cls.level || 'beginner'
    });

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    showToast(`🛒 เพิ่ม "${cls.title}" ลงในตะกร้าแล้ว!`);
  };

  // Action: Add current selected class & slot to Cart (Step 2 -> Step 3)
  const handleAddSelectedToCart = () => {
    if (!selectedClass) return;
    const finalDate = selectedDate || (selectedClass.availableDates?.[0] || new Date().toISOString().slice(0, 10));
    const finalSlot = selectedTimeSlot || (selectedClass.timeSlots?.[0] || '13:00 - 16:00');
    const isFree = isClassFree(selectedClass);
    const unit = isFree ? 0 : selectedClass.price;
    const isGroup = bookingType === 'private_group';
    const count = isGroup ? Math.max(2, attendeeCount) : 1;
    const discountPercent = isGroup && !isFree ? selectedDiscount.percent : 0;
    const discountAmount = isGroup && !isFree ? selectedDiscountAmount : 0;
    const finalItemPrice = isFree ? 0 : (isGroup ? selectedCalculatedPrice : unit);

    addItem({
      classId: selectedClass.id,
      classTitle: selectedClass.title,
      subtitle: selectedClass.subtitle,
      classType: selectedClass.type,
      price: finalItemPrice,
      unitPrice: unit,
      isFree,
      rewardPoints: Math.round(finalItemPrice / 10),
      image: selectedClass.image,
      date: finalDate,
      timeSlot: finalSlot,
      durationText: formatClassDuration(selectedClass),
      level: selectedClass.level || 'beginner',
      bookingType,
      attendeeCount: count,
      groupName: isGroup ? groupName : undefined,
      discountPercent,
      discountAmount
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    showToast(`🛒 เพิ่ม "${selectedClass.title}" ${isGroup ? `(Private กลุ่ม ${count} ท่าน)` : ''} ลงในตะกร้าเรียบร้อย`);
    setCurrentStep('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Instant Buy / Checkout (Step 2 -> Step 4 directly)
  const handleInstantCheckout = () => {
    if (!selectedClass) return;
    const finalDate = selectedDate || (selectedClass.availableDates?.[0] || new Date().toISOString().slice(0, 10));
    const finalSlot = selectedTimeSlot || (selectedClass.timeSlots?.[0] || '13:00 - 16:00');
    const isFree = isClassFree(selectedClass);
    const unit = isFree ? 0 : selectedClass.price;
    const isGroup = bookingType === 'private_group';
    const count = isGroup ? Math.max(2, attendeeCount) : 1;
    const discountPercent = isGroup && !isFree ? selectedDiscount.percent : 0;
    const discountAmount = isGroup && !isFree ? selectedDiscountAmount : 0;
    const finalItemPrice = isFree ? 0 : (isGroup ? selectedCalculatedPrice : unit);

    addItem({
      classId: selectedClass.id,
      classTitle: selectedClass.title,
      subtitle: selectedClass.subtitle,
      classType: selectedClass.type,
      price: finalItemPrice,
      unitPrice: unit,
      isFree,
      rewardPoints: Math.round(finalItemPrice / 10),
      image: selectedClass.image,
      date: finalDate,
      timeSlot: finalSlot,
      durationText: formatClassDuration(selectedClass),
      level: selectedClass.level || 'beginner',
      bookingType,
      attendeeCount: count,
      groupName: isGroup ? groupName : undefined,
      discountPercent,
      discountAmount
    });

    setCurrentStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Step 4 Confirm Information -> Step 5 Payment
  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      alert('ตะกร้าของคุณว่างเปล่า กรุณาเลือกคอร์สเรียนก่อน');
      setCurrentStep('find');
      return;
    }

    if (!userName.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุลของผู้เรียน');
      return;
    }
    if (!userEmail.trim() || !userEmail.includes('@')) {
      alert('กรุณากรอกอีเมลที่ถูกต้องสำหรับรับลิงก์เรียนและอีเมลยืนยัน');
      return;
    }
    if (!userPhone.trim()) {
      alert('กรุณากรอกเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }

    const spamCheck = checkSpamEmail(userEmail);
    if (spamCheck.isBlocked) {
      alert(spamCheck.reason || 'ไม่อนุญาตให้ใช้อีเมลชั่วคราวในการจอง กรุณาใช้อีเมลจริง');
      return;
    }

    // Save info in cache
    try {
      localStorage.setItem('ai_kevin_last_student_info', JSON.stringify({
        userName,
        userEmail,
        userPhone,
        lineId
      }));
    } catch {}

    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Step 5 Payment Submission -> Step 6 Waiting Confirmation
  const handleExecutePayment = async (method: PaymentMethod, slipUrl?: string, stripeId?: string) => {
    if (isSubmitting) return;
    if (cartItems.length === 0) {
      alert('ไม่มีคอร์สในตะกร้า');
      setCurrentStep('find');
      return;
    }

    setIsSubmitting(true);
    const storedRef = typeof window !== 'undefined' ? (localStorage.getItem('kevin_ai_referrer') || searchParams.get('ref')) : null;

    try {
      const results: CreatedBookingSummary[] = [];

      // Process each course in the cart
      for (const item of cartItems) {
        const payload = {
          classId: item.classId,
          classTitle: item.classTitle,
          classType: item.classType,
          date: item.date,
          timeSlot: item.timeSlot,
          userId: user?.id || 'guest',
          userName,
          userEmail,
          userPhone,
          lineId,
          notes: notes ? `${notes} (คอร์ส: ${item.classTitle})` : '',
          amount: item.isFree ? 0 : item.price,
          paymentMethod: method,
          slipUrl: item.isFree ? 'FREE_ENROLLMENT' : slipUrl,
          stripePaymentIntentId: stripeId,
          referredBy: storedRef || undefined,
          bookingType: item.bookingType || 'individual',
          attendeeCount: item.attendeeCount || 1,
          groupName: groupName || item.groupName || undefined,
          additionalAttendees: additionalAttendees || undefined,
          unitPrice: item.unitPrice || item.price,
          groupDiscountPercent: item.discountPercent || 0,
          groupDiscountAmount: item.discountAmount || 0
        };

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success && data.data) {
          results.push({
            id: data.data.id,
            classTitle: data.data.classTitle || item.classTitle,
            date: data.data.date || item.date,
            timeSlot: data.data.timeSlot || item.timeSlot,
            amount: data.data.amount ?? (item.isFree ? 0 : item.price),
            userEmail: data.data.userEmail || userEmail,
            userName: data.data.userName || userName,
            bookingStatus: data.data.bookingStatus || 'pending_payment',
            paymentMethod: data.data.paymentMethod,
            paymentDueAt: data.data.paymentDueAt,
            onlineMeetingUrl: data.data.onlineMeetingUrl,
            bookingType: data.data.bookingType || item.bookingType || 'individual',
            attendeeCount: data.data.attendeeCount || item.attendeeCount || 1,
            groupName: data.data.groupName || item.groupName || groupName
          });
        }
      }

      if (results.length > 0) {
        setCreatedBookings(results);
        clearCart(); // clear cart on success
        setCurrentStep('waiting');
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.5 }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Sync phone to profile if user is logged in
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
        alert('เกิดข้อผิดพลาดในการบันทึกการจอง กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err: any) {
      alert(`ไม่สามารถทำรายการได้: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper Header Configuration
  const STEPS_NAV: { key: FlowStep; stepNum: number; title: string; subtitle: string }[] = [
    { key: 'find', stepNum: 1, title: 'หาคอร์ส', subtitle: 'ค้นหา & กรอง' },
    { key: 'select', stepNum: 2, title: 'เลือกคอร์ส', subtitle: 'รอบวัน & เวลา' },
    { key: 'cart', stepNum: 3, title: 'ตะกร้าคอร์ส', subtitle: `${totalItems} รายการ` },
    { key: 'confirm', stepNum: 4, title: 'ยืนยันคอร์ส', subtitle: 'ข้อมูลผู้เรียน' },
    { key: 'payment', stepNum: 5, title: 'ชำระเงิน', subtitle: totalAmount === 0 ? 'ฟรี 0.-' : 'สแกน QR / บัตร' },
    { key: 'waiting', stepNum: 6, title: 'รอผลยืนยัน', subtitle: 'อีเมลตอบกลับ' }
  ];

  const currentStepIndex = STEPS_NAV.findIndex(s => s.key === currentStep);

  if (loadingClasses) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070d18] text-slate-300">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
        <p className="text-sm font-medium">กำลังเตรียมระบบจองคลาสเรียน...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 pb-24">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-400/40 text-amber-300 shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & 6-Step Visual Stepper */}
      <div className="border-b border-white/10 bg-[#0c1524]/90 backdrop-blur-xl sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Link 
                  href="/" 
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>กลับสู่หน้าหลัก</span>
                </Link>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-bold text-amber-400 tracking-wide uppercase">
                  Kevin AI Booking Flow
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
                <span>จองคลาสเรียน AI กับ อ. Kevin</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  Step {currentStepIndex + 1}/6
                </span>
              </h1>
            </div>

            {/* Quick Cart Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep('cart')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  currentStep === 'cart'
                    ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20'
                    : 'bg-slate-900 text-slate-300 hover:text-white border-white/10 hover:border-amber-400/40'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>ตะกร้าคอร์ส</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-mono font-bold">
                  {totalItems}
                </span>
                {totalAmount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-400 border-l border-white/10 pl-2">
                    ฿{totalAmount.toLocaleString()}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2 pt-1 overflow-x-auto scrollbar-none">
            {STEPS_NAV.map((s, idx) => {
              const isActive = s.key === currentStep;
              const isPast = idx < currentStepIndex;
              const canClick = isPast || (s.key === 'cart' && totalItems > 0) || (s.key === 'find');

              return (
                <button
                  key={s.key}
                  disabled={!canClick && !isActive}
                  onClick={() => {
                    if (canClick) setCurrentStep(s.key);
                  }}
                  className={`text-left p-2 sm:p-2.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#15233c] border-amber-400 shadow-lg shadow-amber-400/10 ring-1 ring-amber-400/30'
                      : isPast
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/30 cursor-pointer'
                        : 'bg-slate-900/30 border-white/5 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : isPast
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-white/10 text-slate-400'
                    }`}>
                      {isPast ? '✓' : s.stepNum}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
                      {s.stepNum}/6
                    </span>
                  </div>
                  <div className="truncate">
                    <div className={`text-xs font-bold truncate ${isActive ? 'text-amber-300' : isPast ? 'text-white' : 'text-slate-400'}`}>
                      {s.title}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate hidden md:block">
                      {s.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Flow Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* ==================================================================== */}
        {/* STEP 1: หาคอร์ส (SEARCH & BROWSE COURSES)                           */}
        {/* ==================================================================== */}
        {currentStep === 'find' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header + Search Bar */}
            <div className="bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    ขั้นตอนที่ 1 · ค้นหาคอร์สเรียน AI
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    เลือกหลักสูตรที่ตรงกับเป้าหมายของคุณ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    ครอบคลุมทั้งคลาสเรียนฟรี, การสร้างคอนเทนต์ด้วย AI, วิดีโอสั้น, AI Agent และเวิร์กช็อปตัวต่อตัว
                  </p>
                </div>

                {totalItems > 0 && (
                  <button
                    onClick={() => setCurrentStep('cart')}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 shrink-0 self-start md:self-auto transition"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>ไปดูตะกร้า ({totalItems} คอร์ส) →</span>
                  </button>
                )}
              </div>

              {/* Live Search Input */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อคอร์ส, เครื่องมือ AI เช่น ChatGPT, Midjourney, Kling, Veo, ComfyUI, หรือหัวข้อที่สนใจ..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    ล้างการค้นหา
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="space-y-3 pt-1">
                {/* Level Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                  <span className="text-slate-400 font-semibold shrink-0">ระดับ:</span>
                  <button
                    onClick={() => setSelectedLevelFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition font-medium whitespace-nowrap ${
                      selectedLevelFilter === 'all'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {Object.entries(COURSE_LEVELS).map(([lvlKey, config]) => (
                    <button
                      key={lvlKey}
                      onClick={() => setSelectedLevelFilter(lvlKey)}
                      className={`px-3 py-1.5 rounded-xl transition font-medium whitespace-nowrap border ${
                        selectedLevelFilter === lvlKey
                          ? 'bg-amber-400 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-white/5'
                      }`}
                    >
                      {config.label} ({config.enLabel})
                    </button>
                  ))}
                </div>

                {/* Format & Price Quick Toggles */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-white/5">
                  <span className="text-slate-400 font-semibold shrink-0">รูปแบบ:</span>
                  <button
                    onClick={() => setSelectedTypeFilter('all')}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedTypeFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setSelectedTypeFilter('online')}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedTypeFilter === 'online' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 คลาสออนไลน์
                  </button>
                  <button
                    onClick={() => setSelectedTypeFilter('onsite')}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedTypeFilter === 'onsite' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🏢 Onsite Workshop
                  </button>

                  <span className="text-slate-600 mx-1">•</span>

                  <span className="text-slate-400 font-semibold shrink-0">ราคา:</span>
                  <button
                    onClick={() => setSelectedPriceFilter('all')}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedPriceFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setSelectedPriceFilter('free')}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedPriceFilter === 'free' ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎁 คอร์สเรียนฟรี (0 บาท)
                  </button>
                  <button
                    onClick={() => setSelectedPriceFilter('paid')}
                    className={`px-3 py-1 rounded-lg transition ${
                      selectedPriceFilter === 'paid' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    💎 คอร์สพรีเมียม
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map(c => {
                const inCart = isInCart(c.id);
                const isFree = isClassFree(c);
                const lvl = getCourseLevelConfig(c.level);

                return (
                  <div
                    key={c.id}
                    className="bg-[#0e1828] border border-white/10 rounded-3xl overflow-hidden hover:border-amber-400/50 shadow-xl transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Course Image */}
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                        <Image
                          src={getSafeCourseImageUrl(c.image)}
                          alt={c.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1828] via-transparent to-black/30 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${
                            c.type === 'online'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}>
                            {c.type === 'online' ? '🌐 คลาสออนไลน์' : '🏢 Onsite Workshop'}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md backdrop-blur-md ${lvl.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${lvl.dotColor}`} />
                            <span>{lvl.label}</span>
                          </span>
                        </div>

                        {/* Free badge */}
                        {isFree && (
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                              <Gift className="w-3.5 h-3.5" />
                              เรียนฟรี (FREE 0.-)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {formatClassDuration(c)}
                          </span>
                          <span>•</span>
                          <span className="text-amber-300 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            +{c.rewardPoints ?? Math.round(c.price / 10)} แต้ม
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                          {c.title}
                        </h3>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {c.subtitle || c.description}
                        </p>

                        {/* Tools tags */}
                        {c.toolsUsed && c.toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {c.toolsUsed.slice(0, 4).map((tool, i) => (
                              <span key={i} className="text-[10px] font-mono bg-slate-900 border border-white/5 px-2 py-0.5 rounded-md text-slate-300">
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-5 sm:p-6 pt-0 border-t border-white/5 mt-2 flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">ราคาค่าลงทะเบียน</span>
                        <div className="text-right">
                          {isFree ? (
                            <span className="text-lg font-black text-emerald-400">ฟรี 0 <span className="text-xs font-normal text-slate-400">บาท</span></span>
                          ) : (
                            <span className="text-lg font-black text-amber-400">{c.price.toLocaleString()} <span className="text-xs font-normal text-slate-400">บาท</span></span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleChooseClass(c)}
                          className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition flex items-center justify-center gap-1"
                        >
                          <span>เลือกรอบเรียน</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={e => handleQuickAddToCart(c, e)}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                            inCart
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10 hover:border-amber-400/30'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
                          <span>{inCart ? 'ในตะกร้าแล้ว' : '+ ตะกร้า'}</span>
                        </button>
                      </div>

                      <Link
                        href={`/courses/${c.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/5 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 font-semibold text-[11px] transition flex items-center justify-center gap-1.5 text-center"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ดูเนื้อหาคอร์ส & วิดีโอตัวอย่าง</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredClasses.length === 0 && (
              <div className="py-20 text-center bg-[#0e1828] border border-white/10 rounded-3xl p-8 text-slate-400 space-y-3">
                <Search className="w-12 h-12 mx-auto text-slate-600" />
                <h4 className="text-base font-bold text-white">ไม่พบคอร์สเรียนที่ตรงกับคำค้นหา &ldquo;{searchQuery}&rdquo;</h4>
                <p className="text-xs text-slate-400">ลองล้างตัวกรอง หรือค้นหาด้วยคีย์เวิร์ดอื่น</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedLevelFilter('all'); setSelectedTypeFilter('all'); setSelectedPriceFilter('all'); }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: เลือกคอร์ส & รอบวันเวลา (SELECT COURSE & SCHEDULE)           */}
        {/* ==================================================================== */}
        {currentStep === 'select' && selectedClass && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('find')}
                className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← กลับไปเลือกคอร์สอื่น (ขั้นตอนที่ 1)</span>
              </button>

              <span className="text-xs font-mono text-slate-500">
                ขั้นตอนที่ 2: เลือกรอบวันและเวลาเรียน
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Full Course Summary & Details (6 Cols) */}
              <div className="lg:col-span-6 bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                
                {/* Header Image */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <Image
                    src={getSafeCourseImageUrl(selectedClass.image)}
                    alt={selectedClass.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-md ${
                      selectedClass.type === 'online'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                    }`}>
                      {selectedClass.type === 'online' ? '🌐 คลาสออนไลน์ (Google Meet / Zoom)' : '🏢 Onsite Workshop (เรียนสดในห้อง)'}
                    </span>
                  </div>

                  {isClassFree(selectedClass) && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-emerald-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Gift className="w-3.5 h-3.5" />
                        สิทธิ์เรียนฟรี (0 บาท)
                      </span>
                    </div>
                  )}
                </div>

                {/* Course Metadata */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {formatClassDuration(selectedClass)}
                    </span>
                    <span>•</span>
                    <span className="text-amber-300 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      +{selectedClass.rewardPoints ?? Math.round(selectedClass.price / 10)} แต้มสะสม
                    </span>
                    <span>•</span>
                    <span>{getCourseLevelConfig(selectedClass.level).label}</span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {selectedClass.title}
                  </h2>
                  {selectedClass.subtitle && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      {selectedClass.subtitle}
                    </p>
                  )}
                </div>

                {/* Topics Covered */}
                {selectedClass.topics && selectedClass.topics.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      หัวข้อที่คุณจะได้เรียนรู้ (What You Will Learn):
                    </span>
                    <ul className="grid grid-cols-1 gap-2 text-xs text-slate-300">
                      {selectedClass.topics.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tools Used */}
                {selectedClass.toolsUsed && selectedClass.toolsUsed.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                      เครื่องมือ AI ที่ใช้ในคลาส:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedClass.toolsUsed.map((tool, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-slate-200">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                {selectedClass.description && (
                  <div className="pt-2 border-t border-white/5 space-y-1">
                    <span className="text-xs font-bold text-slate-400 block">
                      รายละเอียดคอร์สเพิ่มเติม:
                    </span>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      {selectedClass.description}
                    </p>
                  </div>
                )}

              </div>

              {/* Right Column: Calendar & Time Slots Picker (6 Cols) */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Calendar Picker Card */}
                <div className="bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                      เลือกรอบวันและเวลาเรียน
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      กำหนดตารางเรียนที่สะดวก
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      สามารถเลือกวันในปฏิทิน และรอบเวลาที่เปิดสอน (Online / Onsite)
                    </p>
                  </div>

                  <CalendarPicker
                    selectedClass={selectedClass}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    onSelectSlot={(d, s) => {
                      setSelectedDate(d);
                      setSelectedTimeSlot(s);
                    }}
                  />

                  {/* Booking Type Selection: Individual vs Private Group */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>รูปแบบการจองเรียน (Booking Type)</span>
                      </label>
                      {bookingType === 'private_group' && selectedDiscount.percent > 0 && !isClassFree(selectedClass) && (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          🎉 ได้รับส่วนลดกลุ่ม {selectedDiscount.percent}%
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Option 1: Individual */}
                      <button
                        type="button"
                        onClick={() => {
                          setBookingType('individual');
                          setAttendeeCount(1);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                          bookingType === 'individual'
                            ? 'bg-amber-400/10 border-amber-400 text-white shadow-lg shadow-amber-400/10'
                            : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className={`w-4 h-4 ${bookingType === 'individual' ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">จองเรียนเดี่ยว</span>
                        </div>
                        <p className="text-[11px] text-slate-400">1 ท่าน (ราคาปกติ)</p>
                        {bookingType === 'individual' && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </button>

                      {/* Option 2: Private Group */}
                      <button
                        type="button"
                        onClick={() => {
                          setBookingType('private_group');
                          if (attendeeCount < 2) setAttendeeCount(3);
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition relative cursor-pointer ${
                          bookingType === 'private_group'
                            ? 'bg-gradient-to-br from-amber-400/15 to-emerald-500/10 border-amber-400 text-white shadow-lg shadow-amber-400/15'
                            : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Users className={`w-4 h-4 ${bookingType === 'private_group' ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="text-xs font-bold">Private กลุ่ม</span>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-medium">ทีม/องค์กร (ลดสูงสุด 20%)</p>
                        {bookingType === 'private_group' && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    </div>

                    {/* Private Group Controls */}
                    {bookingType === 'private_group' && (
                      <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-400/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Attendee Stepper */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-bold text-white block">จำนวนผู้เรียนในกลุ่ม:</span>
                            <span className="text-[11px] text-slate-400 block">เลือกตั้งแต่ 2 ถึง 30 ท่าน</span>
                          </div>

                          <div className="flex items-center gap-3 bg-slate-900 border border-white/10 rounded-xl p-1.5 self-start sm:self-auto">
                            <button
                              type="button"
                              disabled={attendeeCount <= 2}
                              onClick={() => setAttendeeCount(prev => Math.max(2, prev - 1))}
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-sm transition"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span className="w-16 text-center font-black text-amber-400 text-sm">
                              {attendeeCount} ท่าน
                            </span>

                            <button
                              type="button"
                              disabled={attendeeCount >= 30}
                              onClick={() => setAttendeeCount(prev => Math.min(30, prev + 1))}
                              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-sm transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Group Discount Tier Badges */}
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className={`p-2 rounded-xl text-center border transition ${
                            attendeeCount >= 2 && attendeeCount <= 4
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-white/5 text-slate-400'
                          }`}>
                            <span className="text-[10px] block">2–4 ท่าน</span>
                            <strong className="text-xs block text-emerald-400">ลด 10%</strong>
                          </div>
                          <div className={`p-2 rounded-xl text-center border transition ${
                            attendeeCount >= 5 && attendeeCount <= 9
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-white/5 text-slate-400'
                          }`}>
                            <span className="text-[10px] block">5–9 ท่าน</span>
                            <strong className="text-xs block text-emerald-400">ลด 15%</strong>
                          </div>
                          <div className={`p-2 rounded-xl text-center border transition ${
                            attendeeCount >= 10
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-white/5 text-slate-400'
                          }`}>
                            <span className="text-[10px] block">10+ ท่าน</span>
                            <strong className="text-xs block text-emerald-400">ลด 20%</strong>
                          </div>
                        </div>

                        {/* Optional Company / Team Name */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-amber-400" />
                            <span>ชื่อบริษัท / ทีม / องค์กร (ทางเลือก)</span>
                          </label>
                          <input
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="เช่น ทีม Digital Marketing, บจก. AI Innovate"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Slot Recap */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block">รอบเรียนที่คุณเลือก:</span>
                          <strong className="text-xs sm:text-sm text-white font-bold block">
                            {selectedDate || 'กรุณาเลือกวัน'} ({selectedTimeSlot || 'กรุณาเลือกรอบเวลา'})
                          </strong>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">
                          {bookingType === 'private_group' ? `ยอดรวม (${attendeeCount} ท่าน)` : 'ราคา (1 ท่าน)'}
                        </span>
                        <strong className={`text-base sm:text-lg font-extrabold ${isClassFree(selectedClass) ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isClassFree(selectedClass) 
                            ? 'ฟรี 0.-' 
                            : `฿${(bookingType === 'private_group' ? selectedCalculatedPrice : selectedClass.price).toLocaleString()}`}
                        </strong>
                      </div>
                    </div>

                    {bookingType === 'private_group' && !isClassFree(selectedClass) && (
                      <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                        <div className="space-x-1">
                          <span>ราคาต่อท่าน: <strong>฿{selectedClass.price.toLocaleString()}</strong> × {attendeeCount} ท่าน</span>
                        </div>
                        {selectedDiscount.percent > 0 && (
                          <span className="text-emerald-400 font-bold">
                            ประหยัด ฿{selectedDiscountAmount.toLocaleString()} (-{selectedDiscount.percent}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Step 2 */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={handleAddSelectedToCart}
                      className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-950" />
                      <span>เพิ่มลงตะกร้า (Add to Cart) →</span>
                    </button>

                    <button
                      onClick={handleInstantCheckout}
                      className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>⚡ จองและไปยืนยันข้อมูลทันที (Buy Now)</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: แอดคอร์สในตะกร้า (CART REVIEW & MANAGEMENT)                   */}
        {/* ==================================================================== */}
        {currentStep === 'cart' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  ขั้นตอนที่ 3 · ตรวจสอบตะกร้าคอร์สเรียน
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>ตะกร้าคอร์สของคุณ ({totalItems} รายการ)</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  ตรวจสอบคอร์สที่ต้องการเรียน รอบวันเวลา หรือเพิ่มคอร์สอื่นในคำสั่งซื้อเดียวกัน
                </p>
              </div>

              <button
                onClick={() => setCurrentStep('find')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <span>＋ ค้นหาคอร์สอื่นเพิ่ม (ขั้นตอนที่ 1)</span>
              </button>
            </div>

            {/* If Cart is empty */}
            {cartItems.length === 0 ? (
              <div className="bg-[#0e1828] border border-white/10 rounded-3xl p-12 text-center text-slate-400 space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center mx-auto">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">ตะกร้าของคุณยังว่างเปล่า</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  คุณยังไม่ได้เพิ่มคอร์สเรียนลงในตะกร้า สามารถเริ่มจากขั้นตอนที่ 1 เพื่อค้นหาคอร์สที่ต้องการ
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setCurrentStep('find')}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition"
                  >
                    🔍 ไปค้นหาคอร์สเรียน (เริ่มขั้นตอนที่ 1) →
                  </button>
                </div>
              </div>
            ) : (
              /* Cart Items List + Order Summary */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left: Cart Items List (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {cartItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-[#0e1828] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                          <Image
                            src={getSafeCourseImageUrl(item.image)}
                            alt={item.classTitle}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.classType === 'online'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {item.classType === 'online' ? '🌐 ออนไลน์' : '🏢 Onsite'}
                            </span>

                            {item.bookingType === 'private_group' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>Private กลุ่ม ({item.attendeeCount || 1} ท่าน)</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>เรียนเดี่ยว</span>
                              </span>
                            )}

                            {item.discountPercent && item.discountPercent > 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                ลด {item.discountPercent}%
                              </span>
                            ) : null}

                            <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              +{item.rewardPoints} แต้ม
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white truncate">
                            {item.classTitle}
                          </h4>

                          <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>รอบ: <strong>{item.date}</strong> ({item.timeSlot})</span>
                          </div>

                          {/* Private Group seat adjuster in cart */}
                          {item.bookingType === 'private_group' && !item.isFree && (
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                              <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-lg p-1">
                                <span className="text-[11px] text-slate-400 pl-1.5">ผู้เรียน:</span>
                                <button
                                  type="button"
                                  disabled={(item.attendeeCount || 2) <= 2}
                                  onClick={() => updateItemAttendees(item.id, Math.max(2, (item.attendeeCount || 2) - 1))}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-xs"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="font-bold text-amber-400 text-xs px-1">
                                  {item.attendeeCount || 2} ท่าน
                                </span>
                                <button
                                  type="button"
                                  disabled={(item.attendeeCount || 2) >= 30}
                                  onClick={() => updateItemAttendees(item.id, Math.min(30, (item.attendeeCount || 2) + 1))}
                                  className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center font-bold text-xs"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {item.groupName && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                  ทีม: <strong className="text-slate-200">{item.groupName}</strong>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Price & Remove */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5 shrink-0 gap-2">
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block sm:hidden">ราคา</span>
                          {item.bookingType === 'private_group' && !item.isFree && item.discountPercent && item.discountPercent > 0 ? (
                            <span className="text-[10px] text-slate-400 block line-through">
                              ฿{((item.unitPrice || item.price) * (item.attendeeCount || 1)).toLocaleString()}
                            </span>
                          ) : null}
                          <strong className={`text-base font-black ${item.isFree ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {item.isFree ? 'ฟรี 0 บาท' : `฿${item.price.toLocaleString()}`}
                          </strong>
                          {item.bookingType === 'private_group' && !item.isFree && (
                            <span className="text-[10px] text-emerald-400 block font-semibold">
                              (เฉลี่ย ฿{Math.round(item.price / (item.attendeeCount || 1)).toLocaleString()}/ท่าน)
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          title="ลบออกจากตะกร้า"
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden">ลบ</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add more button */}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setCurrentStep('find')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold inline-flex items-center gap-2 transition"
                    >
                      <span>＋ ต้องการเลือกคอร์สอื่นเพิ่มเติม</span>
                    </button>
                  </div>
                </div>

                {/* Right: Order Summary (5 Cols) */}
                <div className="lg:col-span-5 bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                  <div className="pb-4 border-b border-white/10">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                      สรุปยอดคำสั่งซื้อ (Order Summary)
                    </span>
                    <h3 className="text-lg font-black text-white">
                      รวมทั้งสิ้น {totalItems} คอร์ส
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>รวมราคาคอร์สเรียน</span>
                      <span className="font-semibold text-white">฿{totalAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>แต้มสะสมที่จะได้รับรวม</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        +{totalPoints} แต้ม
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span>ส่วนลด / คูปอง</span>
                      <span className="text-emerald-400 font-medium">0 บาท</span>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">ยอดชำระสุทธิ</span>
                      <strong className={`text-2xl font-black ${totalAmount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {totalAmount === 0 ? 'ฟรี 0 บาท' : `฿${totalAmount.toLocaleString()}`}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200/90 leading-relaxed">
                    💡 <strong>คำแนะนำ:</strong> เมื่อกดไปขั้นตอนถัดไป คุณจะได้กรอกข้อมูลผู้เรียนเพื่อรับลิงก์ห้องเรียน และเลือกวิธีชำระเงิน
                  </div>

                  {/* Proceed to Step 4 */}
                  <button
                    onClick={() => {
                      setCurrentStep('confirm');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>ยืนยันคอร์ส & กรอกข้อมูลผู้เรียน (ขั้นตอนที่ 4)</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: ยืนยันคอร์ส & ข้อมูลผู้เรียน (CONFIRM & STUDENT FORM)         */}
        {/* ==================================================================== */}
        {currentStep === 'confirm' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('cart')}
                className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← กลับไปแก้ไขตะกร้าคอร์ส (ขั้นตอนที่ 3)</span>
              </button>

              <span className="text-xs font-mono text-slate-500">
                ขั้นตอนที่ 4: ยืนยันข้อมูลผู้เรียน
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Student Contact Form (7 Cols) */}
              <div className="lg:col-span-7 bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                      ข้อมูลสำหรับลงทะเบียน
                    </span>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <span>👤 ข้อมูลผู้เรียน (Student Information)</span>
                    </h3>
                  </div>

                  {isReturningStudent && (
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>นักเรียนเดิม (รอบที่ {previousBookingsCount + 1})</span>
                    </span>
                  )}
                </div>

                {isLoadingPreviousData && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 py-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังค้นหาข้อมูลนักเรียนจากการจองรอบก่อน...</span>
                  </div>
                )}

                {/* Returning Student Auto-fill Banner */}
                {isReturningStudent && !isEditingInfo ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-amber-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            ยินดีต้อนรับกลับ คุณ {userName} 👋
                          </p>
                          <p className="text-[11px] text-slate-300">
                            ดึงข้อมูลจากการจองครั้งก่อนให้อัตโนมัติ สามารถไปขั้นตอนชำระเงินได้ทันที
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition shrink-0"
                      >
                        <Pencil className="w-3 h-3 text-amber-400" />
                        <span>แก้ไข</span>
                      </button>
                    </div>

                    <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">ชื่อ - นามสกุล:</span>
                        <strong className="text-white text-sm font-semibold">{userName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">อีเมล (รับลิงก์เรียน):</span>
                        <strong className="text-amber-300 font-mono text-xs">{userEmail}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">เบอร์โทรศัพท์:</span>
                        <strong className="text-white font-mono text-xs">{userPhone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Line ID:</span>
                        <strong className="text-slate-200 text-xs">{lineId || '-'}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        หัวข้อหรือโจทย์ AI ที่สนใจเพิ่มเติมในรอบนี้ (ถ้ามี)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="เช่น ปรึกษาเรื่องสร้างโมเดล LoRA หรือทำ Workflow วิดีโอ AI ในธุรกิจ"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                ) : (
                  /* Standard Input Form */
                  <div className="space-y-4">
                    {isReturningStudent && (
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <span className="text-xs text-amber-400 font-semibold">แก้ไขข้อมูลผู้เรียนสำหรับรอบนี้:</span>
                        <button
                          type="button"
                          onClick={() => setIsEditingInfo(false)}
                          className="text-xs text-slate-400 hover:text-white underline"
                        >
                          ยกเลิก / ใช้ข้อมูลเดิม
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        ชื่อ - นามสกุลผู้เรียน <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        placeholder="เช่น นาย สมชาย ใจดี"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          อีเมล (สำหรับรับลิงก์เรียนและเมลยืนยัน) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={userEmail}
                          onBlur={handleEmailBlur}
                          onChange={e => setUserEmail(e.target.value)}
                          placeholder="student@gmail.com"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          เบอร์โทรศัพท์ <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={userPhone}
                          onChange={e => setUserPhone(e.target.value)}
                          placeholder="08X-XXX-XXXX"
                          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Line ID (สำหรับส่งลิงก์เรียนสำรองและประสานงานด่วน)
                      </label>
                      <input
                        type="text"
                        value={lineId}
                        onChange={e => setLineId(e.target.value)}
                        placeholder="ID Line ของผู้เรียน"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Private Group Additional Team Information */}
                    {cartItems.some(i => i.bookingType === 'private_group') && (
                      <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/30 space-y-3 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                            ข้อมูลสำหรับ Private กลุ่ม (ทีม / องค์กร)
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            ชื่อบริษัท / ชื่อทีม / กลุ่มองค์กร (Company / Team Name)
                          </label>
                          <input
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            placeholder="เช่น ทีม AI Content & Marketing, บริษัท อินโนเวชั่น จำกัด"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            รายชื่อหรืออีเมลผู้ร่วมเรียนในกลุ่ม (ทางเลือก)
                          </label>
                          <textarea
                            rows={2}
                            value={additionalAttendees}
                            onChange={e => setAdditionalAttendees(e.target.value)}
                            placeholder="เช่น นาย สมศักดิ์ (somsak@company.com), นางสาว วรรณา (wanna@company.com)"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                          />
                          <span className="text-[11px] text-slate-400 block mt-1">
                            * สามารถระบุเพิ่มเติม หรือส่งให้แอดมินทาง LINE/Email ภายหลังได้
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        โจทย์ AI หรือเป้าหมายที่ต้องการโฟกัสเป็นพิเศษ
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="เช่น อยากเรียนเพื่อนำไปใช้ในงานโปรดักชัน หรือทำโมเดลตัวละคร 9:16"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Order Confirmation Summary (5 Cols) */}
              <div className="lg:col-span-5 bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="pb-4 border-b border-white/10">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                    ตรวจสอบรายการคอร์ส
                  </span>
                  <h3 className="text-lg font-black text-white">
                    ยืนยันรายการในคำสั่งซื้อ
                  </h3>
                </div>

                {/* Courses Mini List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {cartItems.map(item => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="truncate pr-2">{item.classTitle}</span>
                        <span className={item.isFree ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'}>
                          {item.isFree ? 'ฟรี' : `฿${item.price.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-amber-400" />
                          <span>{item.date} ({item.timeSlot})</span>
                        </span>
                        {item.bookingType === 'private_group' && (
                          <span className="text-amber-300 font-bold text-[10px] bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                            👥 {item.attendeeCount || 1} ท่าน
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>จำนวนคอร์สทั้งหมด</span>
                    <span className="font-bold text-white">{totalItems} คอร์ส</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>แต้มสะสมที่จะได้รับ</span>
                    <span className="font-bold text-amber-400">+{totalPoints} แต้ม</span>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">ยอดชำระสุทธิ</span>
                    <strong className={`text-2xl font-black ${totalAmount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {totalAmount === 0 ? 'ฟรี 0 บาท' : `฿${totalAmount.toLocaleString()}`}
                    </strong>
                  </div>
                </div>

                {/* Submit to Step 5 */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{totalAmount === 0 ? 'ยืนยันลงทะเบียนฟรี (ขั้นตอนที่ 5) →' : 'ไปขั้นตอนชำระเงิน (ขั้นตอนที่ 5) →'}</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 5: ชำระเงิน (PAYMENT: PROMPTPAY QR / STRIPE / FREE)              */}
        {/* ==================================================================== */}
        {currentStep === 'payment' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('confirm')}
                className="text-xs font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← กลับไปแก้ไขข้อมูลผู้เรียน (ขั้นตอนที่ 4)</span>
              </button>

              <span className="text-xs font-mono text-slate-500">
                ขั้นตอนที่ 5: ชำระเงิน & แจ้งโอนเงิน
              </span>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Order Recap Banner */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1828] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    ยอดชำระคำสั่งซื้อ #{cartItems.length} คอร์ส
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
                    ผู้ลงทะเบียน: <span className="text-amber-300">{userName}</span> ({userEmail})
                  </h3>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block">ยอดรวมทั้งสิ้น</span>
                  <strong className={`text-2xl font-black ${totalAmount === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {totalAmount === 0 ? 'ฟรี 0 บาท' : `฿${totalAmount.toLocaleString()}`}
                  </strong>
                </div>
              </div>

              {/* Payment Section Component */}
              <PaymentSection
                amount={totalAmount}
                isFree={totalAmount === 0}
                isSubmitting={isSubmitting}
                onPaymentSuccess={handleExecutePayment}
                bookingSummary={{
                  className: cartItems.map(i => i.classTitle).join(', '),
                  date: cartItems[0]?.date || '',
                  timeSlot: cartItems[0]?.timeSlot || '',
                  userName
                }}
              />

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 6: รอการยืนยันแล้วเมลตอบกลับจาก ADMIN (WAITING & TIMELINE)      */}
        {/* ==================================================================== */}
        {currentStep === 'waiting' && createdBookings.length > 0 && (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 text-center">
            
            {/* Success Icon */}
            <div className={`w-20 h-20 ${isAnyPayLater ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-blue-500/10' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'} rounded-3xl flex items-center justify-center mx-auto border shadow-2xl`}>
              {isAnyPayLater ? <Clock className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
            </div>

            <div>
              <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${isAnyPayLater ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'} border`}>
                ขั้นตอนที่ 6 / 6: {isAnyPayLater ? 'บันทึกการจองสิทธิ์ใน 7 วันเรียบร้อย' : 'บันทึกข้อมูลและส่งแจ้งเตือนเรียบร้อย'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
                {isAnyPayLater ? '🎉 จองสิทธิ์สำเร็จ! รอการชำระเงินภายใน 7 วัน' : '🎉 บันทึกการจองสำเร็จแล้ว!'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
                ระบบได้ส่งอีเมลสรุปข้อมูลไปยัง <strong className="text-amber-300">{createdBookings[0]?.userEmail}</strong> และแจ้งเตือนแอดมินเรียบร้อยแล้ว
              </p>
            </div>

            {/* 7-Day Pay Later Alert Box */}
            {isAnyPayLater && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-rose-950/40 border border-blue-400/40 text-left space-y-2.5 shadow-2xl">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>สิทธิ์ที่นั่งของคุณถูกล็อคไว้ 7 วัน (ถึงวันที่ {payLaterDueDateStr})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ระบบได้ส่งข้อมูลการโอนเงิน (พร้อมเพย์ & เลขบัญชี) ไปยังอีเมลของคุณเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบและแนบสลิปผ่านหน้า <strong>Dashboard</strong> ได้ตลอดเวลาภายใน 7 วัน
                </p>
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium">
                  ⚠️ <strong>เงื่อนไขสำคัญ:</strong> หากไม่ชำระเงินและแนบสลิปภายใน 7 วัน (ก่อนวันที่ {payLaterDueDateStr}) ระบบจะตัดชื่อและยกเลิกสิทธิ์อัตโนมัติ เพื่อเปิดรับผู้เรียนท่านถัดไป
                </div>
              </div>
            )}

            {/* 4-Stage Visual Status Timeline Tracker (Admin Email Response Flow) */}
            <div className="bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-6">
              
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>ไทม์ไลน์การยืนยันและรับลิงก์ห้องเรียน (Status Timeline)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ระบบส่งอีเมลยืนยันผลจากแอดมินโดยตรง เมื่อตรวจสอบสลิปและความถูกต้องแล้ว
                </p>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-4">
                
                {/* Stage 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-md">
                    ✓
                  </div>
                  <div className="flex-1">
                    <strong className="text-xs sm:text-sm font-bold text-white block">
                      1. บันทึกคำขอจองคอร์สสำเร็จ (Booking Recorded)
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ระบบสร้างรหัสการจอง: {createdBookings.map(b => b.id).join(', ')} และเก็บข้อมูลลงฐานข้อมูลแล้ว
                    </span>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-8 h-8 rounded-full ${isAnyPayLater ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-slate-950'} font-black flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-md`}>
                    {isAnyPayLater ? '⏰' : '✓'}
                  </div>
                  <div className="flex-1">
                    <strong className="text-xs sm:text-sm font-bold text-white block">
                      {isAnyPayLater 
                        ? '2. จองสิทธิ์ไว้ก่อน 7 วัน (Seat Reserved for 7 Days)' 
                        : '2. แนบหลักฐานการชำระเงินเรียบร้อย (Payment Submitted)'}
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {isAnyPayLater 
                        ? `สำรองที่นั่งเรียบร้อย กรุณาชำระเงินและแนบสลิปก่อนวันที่ ${payLaterDueDateStr}`
                        : (totalAmount === 0 ? 'สิทธิ์ลงทะเบียนฟรี 100% (ไม่ต้องชำระเงิน)' : 'สลิปโอนเงิน PromptPay ถูกส่งเข้าสู่ระบบการตรวจสอบ')}
                    </span>
                  </div>
                </div>

                {/* Stage 3 (Active) */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-md shadow-amber-400/20">
                    ⏳
                  </div>
                  <div className="flex-1">
                    <strong className="text-xs sm:text-sm font-bold text-amber-300 block flex items-center gap-1.5">
                      <span>{isAnyPayLater ? '3. รอการแนบสลิป & การตรวจสอบจากแอดมิน' : '3. กำลังดำเนินการ: แอดมินกำลังตรวจสอบความถูกต้อง & ยอดเงิน'}</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    </strong>
                    <span className="text-[11px] text-slate-300 block mt-0.5 leading-relaxed">
                      {isAnyPayLater 
                        ? 'เมื่อคุณชำระเงินและแนบสลิปผ่าน Dashboard หรือส่งให้แอดมิน แอดมินจะดำเนินการอนุมัติสิทธิ์ทันที' 
                        : 'แอดมินได้รับแจ้งเตือนทางอีเมลและระบบจัดการหลังบ้านแล้ว (ปกติใช้เวลาประมาณ 15–30 นาที ในเวลาทำการ)'}
                    </span>
                  </div>
                </div>

                {/* Stage 4 (Next) */}
                <div className="flex items-start gap-3.5 opacity-80">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 text-slate-400 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    ✉️
                  </div>
                  <div className="flex-1">
                    <strong className="text-xs sm:text-sm font-bold text-slate-300 block">
                      4. แอดมินส่งอีเมลตอบกลับยืนยันคอร์ส พร้อมลิงก์ห้องเรียนเข้า Inbox ของคุณ
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      เมื่อแอดมินกดยืนยัน ระบบจะส่งอีเมลฉบับทางการพร้อมลิงก์ Google Meet / รายละเอียดการเดินทาง และเอกสารเรียน
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bookings Summary Cards */}
            <div className="bg-[#0e1828] border border-white/10 rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                รายละเอียดคอร์สที่คุณลงทะเบียนไว้:
              </h3>

              <div className="space-y-3">
                {createdBookings.map((b, idx) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          รหัสการจอง: {b.id}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {b.classTitle}
                        </h4>
                        {b.bookingType === 'private_group' && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Private กลุ่ม ({b.attendeeCount || 1} ท่าน)</span>
                            </span>
                            {b.groupName && (
                              <span className="text-[11px] text-slate-300">
                                ทีม: <strong className="text-white">{b.groupName}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 self-start sm:self-auto">
                        {b.amount === 0 ? 'ฟรี 0.-' : `฿${b.amount.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[11px] block">รอบวันเวลา:</span>
                        <span>{b.date} ({b.timeSlot})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">สถานะปัจจุบัน:</span>
                        <span className="text-amber-400 font-semibold">
                          {b.bookingStatus === 'confirmed' ? '✓ ยืนยันแล้ว' : '⏳ รอแอดมินตรวจสอบ'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  หากไม่พบอีเมลในกล่องข้อความหลัก โปรดตรวจสอบในโฟลเดอร์ <strong>Junk / Spam</strong> หรือสามารถดูอัปเดตสถานะแบบเรียลไทม์ได้ที่หน้า <strong>Dashboard</strong> ของคุณตลอดเวลา
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition text-center"
              >
                ดูประวัติการจองใน Dashboard
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition text-center"
              >
                กลับสู่หน้าหลัก
              </Link>

              <a
                href="https://line.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs transition text-center flex items-center justify-center gap-1.5"
              >
                <span>สอบถามแอดมินทาง LINE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}

export default function BookingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#070d18] text-amber-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <BookingContent />
    </React.Suspense>
  );
}
