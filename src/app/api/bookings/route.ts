import { NextResponse } from 'next/server';
import { getBookings, saveBooking, addNotification, getClasses, processReferralPurchase, applyReferralCode, addRewardPoints } from '@/lib/store';
import { 
  sendAdminNewBookingEmail, 
  sendUserBookingReceivedEmail,
  sendUserBookingConfirmationEmail,
  sendAdminPaymentReceivedEmail 
} from '@/lib/email';
import { Booking } from '@/lib/types';
import { checkSpamEmail } from '@/lib/anti-spam';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail');
  const userId = searchParams.get('userId');

  const list = await getBookings({
    userEmail: userEmail || undefined,
    userId: userId || undefined
  });

  return NextResponse.json({ success: true, data: list });
}

// Fast in-memory deduplication cache: key -> { timestamp, booking }
const recentBookingsCache = new Map<string, { timestamp: number; booking: Booking }>();

// Cleanup stale entries older than 60s periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of recentBookingsCache.entries()) {
    if (now - value.timestamp > 60000) {
      recentBookingsCache.delete(key);
    }
  }
}, 30000);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Anti-Spam protection: Disallow bookings with @example.com or disposable emails
    if (body.userEmail) {
      const spamCheck = checkSpamEmail(body.userEmail);
      if (spamCheck.isBlocked) {
        return NextResponse.json({ 
          success: false, 
          error: spamCheck.reason || 'ไม่อนุญาตให้ใช้อีเมล @example.com หรืออีเมลชั่วคราวในการจอง กรุณาใช้อีเมลจริง' 
        }, { status: 400 });
      }
      body.userEmail = spamCheck.normalizedEmail;
    } else {
      return NextResponse.json({ success: false, error: 'กรุณากรอกอีเมลสำหรับการจองคลาส' }, { status: 400 });
    }

    // Fast deduplication check using in-memory cache to prevent redundant remote DB round-trip
    const dedupKey = `${body.userEmail || ''}_${body.classId || ''}_${body.date || ''}_${body.timeSlot || ''}`;
    const recentCached = recentBookingsCache.get(dedupKey);
    if (recentCached && (Date.now() - recentCached.timestamp < 15000)) {
      return NextResponse.json({ success: true, data: recentCached.booking, deduplicated: true });
    }

    // Resolve class details quickly (will use memory cache if populated)
    const classes = await getClasses();
    const classItem = classes.find(c => c.id === body.classId);

    const bookingId = `BK-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;

    let finalSlipUrl = body.slipUrl || '';
    // If slipUrl is a Base64 data URL, automatically upload to Google Drive folder 'slipcoursekevin'
    if (finalSlipUrl.startsWith('data:image')) {
      try {
        const { uploadBase64ToGoogleDrive } = await import('@/lib/gdrive');
        const uploaded = await uploadBase64ToGoogleDrive({
          dataUrl: finalSlipUrl,
          fileName: `slip-${bookingId}-${Date.now()}.png`,
          folderType: 'slip'
        });
        if (uploaded.directDownloadUrl) {
          finalSlipUrl = uploaded.directDownloadUrl;
        }
      } catch (uploadErr) {
        console.warn('Google Drive slip upload fallback:', uploadErr);
        // keep existing data URL if drive upload fails so slip is not lost
      }
    }

    const isFreeCourse = (classItem && (classItem.isFree || classItem.price === 0)) || Number(body.amount) === 0 || body.slipUrl === 'FREE_ENROLLMENT';
    const bookingAmount = isFreeCourse ? 0 : (classItem ? classItem.price : Number(body.amount) || 499);

    const newBooking: Booking = {
      id: bookingId,
      classId: body.classId,
      classTitle: classItem ? classItem.title : body.classTitle || 'คลาสเรียน AI',
      classType: classItem ? classItem.type : (body.classType || 'onsite'),
      date: body.date,
      timeSlot: body.timeSlot,
      userId: body.userId || 'guest-user',
      userName: body.userName,
      userEmail: body.userEmail,
      userPhone: body.userPhone,
      lineId: body.lineId || '',
      notes: body.notes || '',
      amount: bookingAmount,
      paymentMethod: 'promptpay_qr',
      paymentStatus: isFreeCourse ? 'verified' : 'pending',
      slipUrl: isFreeCourse ? 'FREE_ENROLLMENT' : finalSlipUrl,
      bookingStatus: isFreeCourse ? 'confirmed' : 'pending_payment',
      onlineMeetingUrl: classItem?.onlineMeetingUrl || '',
      createdAt: new Date().toISOString(),
      confirmedAt: isFreeCourse ? new Date().toISOString() : undefined
    };

    // Store in recent dedup cache immediately
    recentBookingsCache.set(dedupKey, { timestamp: Date.now(), booking: newBooking });

    // Save booking to Supabase and update local cache
    await saveBooking(newBooking);

    // Attribute referral if referral code was passed
    if (body.referredBy && newBooking.userEmail) {
      applyReferralCode(newBooking.userEmail, body.referredBy).catch(console.error);
    }

    // Fire in-app alert asynchronously so user doesn't wait for extra roundtrip
    addNotification({
      type: 'new_booking',
      title: `จองคลาสใหม่: ${newBooking.id}`,
      message: `คุณ ${newBooking.userName} ได้ทำการจอง ${newBooking.classTitle} (${newBooking.amount.toLocaleString()} บาท)`,
      read: false,
      bookingId: newBooking.id
    }).catch(console.error);

    // Dispatch emails (awaited via Promise.allSettled so Vercel lambda doesn't terminate before socket completes)
    const emailTasks: Promise<any>[] = [
      sendAdminNewBookingEmail(newBooking).catch(console.error),
      sendUserBookingReceivedEmail(newBooking).catch(console.error)
    ];

    if (newBooking.bookingStatus === 'confirmed') {
      emailTasks.push(sendUserBookingConfirmationEmail(newBooking).catch(console.error));
      emailTasks.push(sendAdminPaymentReceivedEmail(newBooking).catch(console.error));
      if (newBooking.userEmail) {
        processReferralPurchase(newBooking.userEmail).catch(console.error);
        const pts = classItem?.rewardPoints ?? Math.round(newBooking.amount / 10);
        if (pts > 0) {
          addRewardPoints(
            newBooking.userEmail,
            'course_reward',
            pts,
            `ได้รับแต้มสะสมจากการลงเรียนคลาส ${newBooking.classTitle} (+${pts} Point)`
          ).catch(console.error);
        }
      }
    }

    await Promise.allSettled(emailTasks);

    return NextResponse.json({ success: true, data: newBooking });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
