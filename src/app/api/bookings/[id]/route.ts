import { NextResponse } from 'next/server';
import { getBookings, saveBooking, deleteBooking, addNotification, processReferralPurchase, getClasses, addRewardPoints } from '@/lib/store';
import { 
  sendUserBookingConfirmationEmail, 
  sendAdminPaymentReceivedEmail, 
  sendUserClassRescheduledEmail,
  sendUserBookingRejectedEmail
} from '@/lib/email';
import { Booking } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bookings = await getBookings();
  const booking = bookings.find(b => b.id === id);
  if (!booking) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: booking });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const bookings = await getBookings();
    const existing = bookings.find(b => b.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const effectiveStatus = body.bookingStatus || body.status;
    const wasConfirmed = existing.bookingStatus === 'confirmed';
    const updated: Booking = {
      ...existing,
      ...body,
      bookingStatus: (effectiveStatus as any) || existing.bookingStatus,
      id
    };

    // 1. Confirm and verify payment (Approve)
    const emailTasks: Promise<any>[] = [];

    // 1. Approve Booking
    if (effectiveStatus === 'confirmed') {
      updated.confirmedAt = new Date().toISOString();
      updated.paymentStatus = 'verified';
      updated.bookingStatus = 'confirmed';
      if (body.approvalMessage || body.message) {
        updated.approvalMessage = body.approvalMessage || body.message;
      }

      emailTasks.push(sendUserBookingConfirmationEmail(updated, body.approvalMessage || body.message).catch(console.error));
      emailTasks.push(sendAdminPaymentReceivedEmail(updated).catch(console.error));

      if (!wasConfirmed && updated.userEmail) {
        processReferralPurchase(updated.userEmail).catch(console.error);
        getClasses().then(classes => {
          const classItem = classes.find(c => c.id === updated.classId);
          const pts = classItem?.rewardPoints ?? Math.round(updated.amount / 10);
          if (pts > 0) {
            addRewardPoints(
              updated.userEmail,
              'course_reward',
              pts,
              `ได้รับแต้มสะสมจากการลงเรียนคลาส ${updated.classTitle} (+${pts} Point)`
            ).catch(console.error);
          }
        }).catch(console.error);
      }

      addNotification({
        type: 'booking_confirmed',
        title: `อนุมัติคลาสสำเร็จ & บันทึกรับเงิน: ${updated.id}`,
        message: `อนุมัติคลาสเรียนและส่งอีเมลยืนยันการรับเงินให้คุณ ${updated.userName} (${updated.userEmail}) เรียบร้อยแล้ว`,
        read: false,
        bookingId: updated.id
      }).catch(console.error);
    }

    // 2. Reject Booking
    if (effectiveStatus === 'rejected') {
      updated.bookingStatus = 'rejected';
      updated.paymentStatus = 'failed';
      updated.rejectReason = body.rejectReason || body.reason || 'หลักฐานการโอนเงินไม่ถูกต้อง หรือคลาสเรียนเต็มแล้ว';

      emailTasks.push(sendUserBookingRejectedEmail(updated, updated.rejectReason || 'หลักฐานการโอนเงินไม่ถูกต้อง หรือคลาสเรียนเต็มแล้ว').catch(console.error));

      addNotification({
        type: 'booking_confirmed',
        title: `ปฏิเสธการจองคลาส: ${updated.id}`,
        message: `ปฏิเสธการจองของคุณ ${updated.userName} และส่งอีเมลแจ้งเหตุผล (${updated.rejectReason}) ไปยังผู้เรียนแล้ว`,
        read: false,
        bookingId: updated.id
      }).catch(console.error);
    }

    // 3. Reschedule class flow
    const isDateChanged = body.date && body.date !== existing.date;
    const isTimeSlotChanged = body.timeSlot && body.timeSlot !== existing.timeSlot;
    if (isDateChanged || isTimeSlotChanged || effectiveStatus === 'rescheduled') {
      updated.bookingStatus = 'rescheduled';
      updated.originalDate = existing.originalDate || existing.date;
      updated.originalTimeSlot = existing.originalTimeSlot || existing.timeSlot;
      updated.rescheduledReason = body.rescheduledReason || body.reason || existing.rescheduledReason || 'ปรับเปลี่ยนตามตารางสอนของ อ. Kevin';

      emailTasks.push(sendUserClassRescheduledEmail(
        updated,
        updated.date,
        updated.timeSlot,
        updated.rescheduledReason
      ).catch(console.error));

      addNotification({
        type: 'booking_confirmed',
        title: `เลื่อนรอบเรียน: ${updated.id}`,
        message: `ส่งอีเมลแจ้งเลื่อนรอบเรียนเป็น ${updated.date} (${updated.timeSlot}) ไปยังคุณ ${updated.userName} (${updated.userEmail}) เรียบร้อยแล้ว`,
        read: false,
        bookingId: updated.id
      }).catch(console.error);
    }

    if (body.slipUrl && body.slipUrl !== existing.slipUrl) {
      addNotification({
        type: 'payment_slip_uploaded',
        title: `แนบสลิปชำระเงินใหม่: ${updated.id}`,
        message: `คุณ ${updated.userName} ได้แนบหลักฐานการโอนเงิน กรุณาตรวจสอบยอด ${updated.amount.toLocaleString()} บาท`,
        read: false,
        bookingId: updated.id
      }).catch(console.error);
    }

    if (body.onlineMeetingUrl && body.onlineMeetingUrl !== existing.onlineMeetingUrl && updated.bookingStatus === 'confirmed') {
      emailTasks.push(sendUserBookingConfirmationEmail(updated).catch(console.error));
    }

    await saveBooking(updated);
    if (emailTasks.length > 0) {
      await Promise.allSettled(emailTasks);
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export const PUT = PATCH;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookings = await getBookings();
    const existing = bookings.find(b => b.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const success = await deleteBooking(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 });
    }

    addNotification({
      type: 'booking_confirmed',
      title: `ลบรายการจอง: ${existing.id}`,
      message: `แอดมินได้ทำการลบรายการจองของ ${existing.userName} (${existing.classTitle}) ออกจากระบบเรียบร้อยแล้ว`,
      read: true,
      bookingId: existing.id
    }).catch(console.error);

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

