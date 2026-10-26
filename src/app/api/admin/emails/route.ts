import { NextResponse } from 'next/server';
import { getEmailLogs, logEmail, isSmtpConfigured, testSendEmail } from '@/lib/email';
import { getBookings } from '@/lib/store';

export async function GET() {
  try {
    const logs = await getEmailLogs();
    const smtpConfigured = isSmtpConfigured();
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || null;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const resendConfigured = Boolean(process.env.RESEND_API_KEY);

    return NextResponse.json({ 
      success: true, 
      data: logs,
      smtpConfigured,
      smtpDetails: {
        provider: resendConfigured ? 'Resend API' : smtpConfigured ? 'Nodemailer SMTP' : 'Simulation Mode',
        host: smtpHost,
        user: smtpUser,
        from: process.env.EMAIL_FROM || (smtpUser ? `"อ. Kevin AI Studio" <${smtpUser}>` : null)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, bookingId, customMessage, to, subject, html } = body;

    // Action 1: Test Email Send
    if (action === 'test') {
      const recipient = (to || process.env.ADMIN_EMAIL || 'kevinenjoy2025@gmail.com').trim();
      const testResult = await testSendEmail(recipient);
      return NextResponse.json({ 
        success: true, 
        message: testResult.status === 'sent' 
          ? `ส่งอีเมลทดสอบไปยัง ${recipient} สำเร็จ!` 
          : `บันทึกอีเมลทดสอบแล้ว (โหมดจำลอง — กรุณาตั้งค่า SMTP_PASS เพื่อส่งเมลจริง)`,
        data: testResult 
      });
    }

    // Action 2: Custom Email Dispatch directly
    if (action === 'custom' || (to && subject)) {
      if (!to || !subject) {
        return NextResponse.json({ success: false, error: 'Recipient (to) and subject are required' }, { status: 400 });
      }

      const emailResult = await logEmail({
        to: to.trim(),
        subject: subject.trim(),
        html: html || `<div style="font-family:sans-serif;padding:20px;">${customMessage || ''}</div>`,
        type: 'admin_alert'
      });

      return NextResponse.json({ success: true, data: emailResult });
    }

    // Action 3: Dispatch to Booking Student
    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'bookingId or recipient email is required' }, { status: 400 });
    }

    const bookings = await getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const emailSubject = `[แจ้งเตือนด่วนจาก อ. Kevin] คลาส ${booking.classTitle}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">ข้อความจาก อ. Kevin ถึงคุณ ${booking.userName}</h2>
        <p style="white-space: pre-line; background: #f8fafc; padding: 15px; border-radius: 6px;">${customMessage || 'ขอแจ้งรายละเอียดเพิ่มเติมเกี่ยวกับคลาสเรียน'}</p>
        
        ${booking.onlineMeetingUrl ? `
          <div style="margin-top: 15px; padding: 12px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">🔗 ลิงก์ห้องเรียนออนไลน์:</p>
            <p style="margin: 6px 0 0 0;"><a href="${booking.onlineMeetingUrl}" style="color: #059669;">${booking.onlineMeetingUrl}</a></p>
          </div>
        ` : ''}

        <p style="margin-top: 20px; color: #64748b; font-size: 13px;">วันและเวลาเรียน: ${booking.date} เวลา ${booking.timeSlot}</p>
      </div>
    `;

    const sent = await logEmail({
      to: booking.userEmail,
      subject: emailSubject,
      html: emailHtml,
      type: 'meeting_link'
    });

    return NextResponse.json({ success: true, data: sent });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
