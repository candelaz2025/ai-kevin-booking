import nodemailer from 'nodemailer';
import { Booking } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface EmailLog {
  id: string;
  to: string;
  recipient?: string;
  subject: string;
  html: string;
  sentAt: string;
  type: 'admin_alert' | 'user_confirmation' | 'meeting_link' | 'payment_reminder' | 'test';
  status?: 'sent' | 'simulated' | 'failed';
  error?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __app_email_logs: EmailLog[] | undefined;
}

/**
 * Check if real SMTP or Resend is configured
 */
export function isSmtpConfigured(): boolean {
  const hasUser = Boolean(process.env.SMTP_USER || process.env.GMAIL_USER);
  const hasPass = Boolean(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  return (hasUser && hasPass) || hasResend;
}

/**
 * Get all email dispatch logs (with Supabase persistence + memory fallback)
 */
export async function getEmailLogs(): Promise<EmailLog[]> {
  // 1. Try Supabase first for serverless persistence across Vercel lambdas
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          to: d.recipient || d.to || '',
          recipient: d.recipient || d.to || '',
          subject: d.subject || '',
          html: d.html || '',
          type: (d.type as any) || 'user_confirmation',
          sentAt: d.sent_at || new Date().toISOString(),
          status: 'sent'
        }));
      }
    } catch (err) {
      console.error('Failed to get email logs from Supabase:', err);
    }
  }

  // 2. Fallback to in-memory store
  if (!global.__app_email_logs) {
    global.__app_email_logs = [];
  }
  return global.__app_email_logs;
}

/**
 * Internal email dispatcher: sends via Resend or Nodemailer SMTP, or falls back to simulation
 */
async function dispatchEmail(
  to: string, 
  subject: string, 
  html: string
): Promise<{ success: boolean; status: 'sent' | 'simulated' | 'failed'; error?: string }> {
  const cleanTo = (to || '').trim();
  if (!cleanTo || !cleanTo.includes('@')) {
    console.warn(`[EMAIL SKIPPED] Invalid recipient: "${to}"`);
    return { success: false, status: 'failed', error: 'Invalid recipient email address' };
  }

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const fromAddr = process.env.EMAIL_FROM || 'อ. Kevin AI Studio <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [cleanTo],
          subject: subject,
          html: html,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }
      console.log(`[RESEND EMAIL SENT] To: ${cleanTo} | ID: ${data.id}`);
      return { success: true, status: 'sent' };
    } catch (err: any) {
      console.error('[Resend Error]', err);
      return { success: false, status: 'failed', error: err.message };
    }
  }

  // 2. Nodemailer SMTP (Gmail App Password or Custom SMTP)
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (smtpUser && smtpPass) {
    try {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 465;
      const isSecure = port === 465;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false
        }
      });

      let from = process.env.EMAIL_FROM || `"อ. Kevin AI Studio" <${smtpUser}>`;
      if ((from.startsWith('"') && from.endsWith('"') && (from.match(/"/g) || []).length > 2) ||
          (from.startsWith("'") && from.endsWith("'"))) {
        from = from.slice(1, -1);
      }

      await transporter.sendMail({
        from,
        to: cleanTo,
        subject,
        html,
      });

      console.log(`[SMTP EMAIL SENT] To: ${cleanTo} | Subject: ${subject}`);
      return { success: true, status: 'sent' };
    } catch (err: any) {
      console.error(`[SMTP ERROR] To: ${cleanTo} | Error:`, err);
      return { success: false, status: 'failed', error: err.message || 'SMTP dispatch failed' };
    }
  }

  // 3. Fallback: Simulation Mode
  console.log(`[EMAIL SIMULATED] To: ${to} | Subject: ${subject} (No SMTP configured, logged to database)`);
  return { success: true, status: 'simulated' };
}

/**
 * Log and send email
 */
export async function logEmail(entry: Omit<EmailLog, 'id' | 'sentAt'>): Promise<EmailLog> {
  const logId = `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const sentAt = new Date().toISOString();

  // Dispatch real email or simulation
  const dispatch = await dispatchEmail(entry.to, entry.subject, entry.html);

  const newLog: EmailLog = {
    ...entry,
    id: logId,
    recipient: entry.to,
    sentAt,
    status: dispatch.status,
    error: dispatch.error
  };

  // Persist to Supabase email_logs
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('email_logs').insert({
        id: logId,
        recipient: entry.to,
        subject: entry.subject,
        html: entry.html,
        type: entry.type || 'user_confirmation'
      });
    } catch (err) {
      console.error('Failed to persist email log to Supabase:', err);
    }
  }

  // Keep in memory
  if (!global.__app_email_logs) {
    global.__app_email_logs = [];
  }
  global.__app_email_logs.unshift(newLog);

  return newLog;
}

/**
 * Send test email
 */
export async function testSendEmail(to: string) {
  const subject = '🧪 [ทดสอบระบบอีเมล] ยืนยันการเชื่อมต่อระบบสำเร็จ — อ. Kevin AI Studio';
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #047857; margin-top: 0;">🎉 ระบบอีเมลพร้อมใช้งานแล้ว!</h2>
      <p style="color: #334155;">นี่คืออีเมลทดสอบจากระบบจองคลาส <strong>อ. Kevin AI Studio</strong></p>
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; color: #065f46; font-weight: bold;">สถานะการส่ง: สำเร็จ</p>
        <p style="margin: 4px 0 0 0; color: #047857; font-size: 13px;">เวลาส่ง: ${new Date().toLocaleString('th-TH')}</p>
        <p style="margin: 4px 0 0 0; color: #047857; font-size: 13px;">ผู้รับ: ${to}</p>
      </div>
      <p style="color: #64748b; font-size: 13px;">ระบบพร้อมส่งแจ้งเตือนการจอง, อนุมัติการชำระเงิน, เลื่อนรอบเรียน และลิงก์รีเซ็ตรหัสผ่านให้นักเรียนทุกคนแล้ว</p>
    </div>
  `;
  return await logEmail({
    to,
    subject,
    html,
    type: 'test'
  });
}

/**
 * Send notification to Admin when a new booking is created
 */
export async function sendAdminNewBookingEmail(booking: Booking) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ai-kevin-workshop.com';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';
  const isPayLater = Boolean(booking.isPayLater7Days || booking.paymentMethod === 'pay_later_7days');
  const subject = isPayLater
    ? `⏰ [จองสิทธิ์ใน 7 วัน] รหัส ${booking.id} - ${booking.classTitle} (รอการชำระเงิน)`
    : `🔔 [แจ้งเตือนการจองใหม่] รหัส ${booking.id} - ${booking.classTitle} (รอการอนุมัติ)`;
  const dueDateStr = booking.paymentDueAt ? new Date(booking.paymentDueAt).toLocaleDateString('th-TH') : '';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">
        ${isPayLater ? '⏰ มีการจองสิทธิ์คลาสใหม่ (ชำระเงินใน 7 วัน)' : '🔔 มีการจองคลาสใหม่เข้ามาในระบบ'}
      </h2>
      <p style="color: #475569;">
        คุณ <strong>${booking.userName}</strong> ได้ทำการจองคลาสเรียน ${isPayLater ? 'และเลือกชำระเงินภายใน 7 วัน' : 'และรอการอนุมัติการชำระเงินจากคุณ'}:
      </p>
      
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>รหัสการจอง:</strong> <span style="font-family: monospace; font-weight: bold; color: #2563eb;">${booking.id}</span></p>
        <p style="margin: 4px 0;"><strong>คลาสเรียน:</strong> ${booking.classTitle} (${booking.classType === 'online' ? '🌐 ออนไลน์' : '🏢 Onsite'})</p>
        <p style="margin: 4px 0;"><strong>วันและเวลา:</strong> ${booking.date} เวลา ${booking.timeSlot}</p>
        <p style="margin: 4px 0;"><strong>ชื่อผู้เรียน:</strong> ${booking.userName}</p>
        <p style="margin: 4px 0;"><strong>อีเมล:</strong> ${booking.userEmail}</p>
        <p style="margin: 4px 0;"><strong>เบอร์โทร:</strong> ${booking.userPhone}</p>
        <p style="margin: 4px 0;"><strong>ยอดเงินที่ต้องชำระ:</strong> <strong style="color: #d97706; font-size: 16px;">${booking.amount.toLocaleString()} บาท</strong></p>
        <p style="margin: 4px 0;"><strong>รูปแบบการชำระ:</strong> ${
          isPayLater 
            ? `<span style="color: #b45309; font-weight: bold;">⏰ จองสิทธิ์ไว้ก่อน (ชำระภายใน 7 วัน ${dueDateStr ? `• กำหนดก่อน ${dueDateStr}` : ''})</span>`
            : (booking.paymentMethod === 'stripe' ? 'บัตรเครดิต (Stripe)' : 'PromptPay QR Code')
        }</p>
        ${booking.slipUrl ? `<p style="margin: 6px 0;"><strong>หลักฐานการโอนเงิน (สลิป):</strong> แนบสลิปเรียบร้อยแล้ว</p>` : ''}
      </div>

      <p style="margin-top: 24px; text-align: center;">
        <a href="${appUrl}/admin" style="background-color: #f59e0b; color: #0f172a; font-weight: bold; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          👉 เข้าสู่ระบบ Admin เพื่อจัดการรายการนี้
        </a>
      </p>
      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 16px;">
        คุณสามารถกดเข้าสู่ระบบเพื่อตรวจสอบสลิป, ยืนยันรับเงิน (Approve) พร้อมส่งข้อความแจ้งเตือน หรือปฏิเสธ (Reject) ได้ทันที
      </p>
    </div>
  `;

  return await logEmail({
    to: adminEmail,
    subject,
    html,
    type: 'admin_alert'
  });
}

/**
 * Send notification to Student immediately upon booking submission (pending verification)
 */
export async function sendUserBookingReceivedEmail(booking: Booking) {
  const subject = `📋 [ได้รับข้อมูลการจองแล้ว] รหัส ${booking.id} - คลาส ${booking.classTitle} (รอการตรวจสอบชำระเงิน)`;
  const isOnline = booking.classType === 'online';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <span style="background-color: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #fde68a;">
          ⏳ ได้รับข้อมูลการจองแล้ว · รอการตรวจสอบ
        </span>
        <h2 style="color: #0f172a; margin-top: 12px; margin-bottom: 4px; font-size: 20px;">
          ขอบคุณที่ลงทะเบียนเรียนกับ อ. Kevin ครับ
        </h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          ระบบได้รับข้อมูลการจองคลาสเรียนและหลักฐานการชำระเงินของคุณเรียบร้อยแล้ว
        </p>
      </div>

      <div style="padding: 20px 0;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">
          เรียนคุณ <strong>${booking.userName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          ทางทีมงานได้รับข้อมูลการสมัครคลาสเรียนเรียบร้อยแล้ว ขณะนี้แอดมินกำลังตรวจสอบความถูกต้องของสลิปหลักฐานการโอนเงิน โดยเมื่อการตรวจสอบเสร็จสิ้น คุณจะได้รับอีเมลยืนยันสิทธิ์เข้าเรียน (Approve) พร้อมลิงก์ห้องเรียนและเอกสารประกอบการเรียนทันทีครับ
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">รายละเอียดการจองของคุณ:</h4>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 35%;">รหัสการจอง:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #2563eb;">${booking.id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">คลาสเรียน:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${booking.classTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">รูปแบบ:</td>
              <td style="padding: 6px 0; font-weight: 600;">${isOnline ? '🌐 คลาสออนไลน์สด (Live Session)' : '🏢 Onsite Workshop'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">วันและเวลา:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${booking.date} เวลา ${booking.timeSlot}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">ยอดเงิน:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #d97706; font-size: 15px;">${booking.amount.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">ช่องทางชำระ:</td>
              <td style="padding: 6px 0;">PromptPay QR Code</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">สถานะปัจจุบัน:</td>
              <td style="padding: 6px 0;"><span style="color: #b45309; font-weight: 600;">รอแอดมินตรวจสอบการชำระเงิน</span></td>
            </tr>
          </table>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin: 16px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
            💡 <strong>คำแนะนำ:</strong> คุณสามารถเข้าสู่ระบบเพื่อตรวจสอบสถานะการจอง, ดาวน์โหลด E-Book และเอกสารบทเรียนประจำคลาสได้ตลอดเวลาที่ Dashboard ผู้เรียน
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${appUrl}/dashboard" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            เปิดดูรายละเอียดใน Dashboard
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">อ. Kevin AI Studio & Academy · ติดต่อสอบถาม: kevinenjoy2025@gmail.com</p>
        <p style="margin: 0;">อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ</p>
      </div>
    </div>
  `;

  return await logEmail({
    to: booking.userEmail,
    subject,
    html,
    type: 'user_confirmation'
  });
}

/**
 * Send confirmation and details (including online meeting link and custom approval message) to Student
 */
export async function sendUserBookingConfirmationEmail(booking: Booking, customMessage?: string) {
  const subject = `🎉 [ยืนยันการลงทะเบียน & รับเงินแล้ว] รหัส ${booking.id} - คลาส ${booking.classTitle} กับ อ. Kevin`;
  const isOnline = booking.classType === 'online';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #047857; margin-top: 0; margin-bottom: 8px;">🎉 ยืนยันการชำระเงินและสิทธิ์เข้าเรียนเรียบร้อยแล้ว!</h2>
      <p style="color: #334155; font-size: 15px;">เรียนคุณ <strong>${booking.userName}</strong>,</p>
      
      <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin: 16px 0;">
        <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
          ${customMessage || 'เราได้ตรวจสอบการโอนเงินของคุณเรียบร้อยแล้ว ขอบคุณที่ไว้วางใจลงทะเบียนเรียนกับ อ. Kevin ครับ'}
        </p>
      </div>

      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #1e293b;">รายละเอียดคลาสเรียน</h3>
        <p style="margin: 4px 0;"><strong>รหัสการจอง:</strong> <span style="font-family: monospace;">${booking.id}</span></p>
        <p style="margin: 4px 0;"><strong>คลาส:</strong> ${booking.classTitle}</p>
        <p style="margin: 4px 0;"><strong>วันที่:</strong> ${booking.date} | เวลา ${booking.timeSlot}</p>
        <p style="margin: 4px 0;"><strong>ยอดเงินที่ชำระ:</strong> <strong style="color: #047857;">${booking.amount.toLocaleString()} บาท</strong></p>
        <p style="margin: 4px 0;"><strong>รูปแบบ:</strong> ${isOnline ? '🌐 คลาสออนไลน์ (Online Live)' : '🏢 Onsite Workshop'}</p>
        
        ${isOnline && booking.onlineMeetingUrl ? `
          <div style="margin-top: 15px; padding: 12px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">🔗 ลิงก์ห้องเรียนออนไลน์ (Google Meet / Zoom):</p>
            <p style="margin: 6px 0 0 0;"><a href="${booking.onlineMeetingUrl}" style="color: #059669; word-break: break-all; font-weight: 600;">${booking.onlineMeetingUrl}</a></p>
          </div>
        ` : ''}

        ${!isOnline ? `
          <div style="margin-top: 15px; padding: 12px; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 6px;">
            <p style="margin: 0; color: #1e40af; font-weight: bold;">📍 สถานที่จัดเวิร์กช็อป:</p>
            <p style="margin: 6px 0 0 0; color: #1e3a8a;">Online via Google Meet & Live Studio</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">* กรุณาเตรียมแล็ปท็อป (Notebook) มาใช้ฝึกปฏิบัติตลอดคลาส</p>
          </div>
        ` : ''}
      </div>

      <p style="color: #64748b; font-size: 13px;">คุณสามารถตรวจสอบประวัติการจองและดาวน์โหลดเอกสารประกอบการเรียนได้ตลอดเวลาที่ Dashboard ของผู้เรียน</p>
      <p style="margin-top: 20px; text-align: center;">
        <a href="${appUrl}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          เข้าสู่ระบบดูคลาสที่ Dashboard
        </a>
      </p>
    </div>
  `;

  return await logEmail({
    to: booking.userEmail,
    subject,
    html,
    type: isOnline ? 'meeting_link' : 'user_confirmation'
  });
}

/**
 * Send rejection notification with explanation to Student
 */
export async function sendUserBookingRejectedEmail(booking: Booking, rejectReason: string = 'หลักฐานการโอนเงินไม่ถูกต้อง หรือคลาสเรียนเต็มแล้ว') {
  const subject = `⚠️ [แจ้งเตือนการจองคลาส] รหัส ${booking.id} - ${booking.classTitle}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #b91c1c; margin-top: 0; margin-bottom: 8px;">⚠️ แจ้งสถานะการจองคลาสเรียน</h2>
      <p style="color: #334155; font-size: 15px;">เรียนคุณ <strong>${booking.userName}</strong>,</p>
      
      <p style="color: #475569;">
        ทางทีมงาน อ. Kevin ขออภัยที่ต้องแจ้งให้ทราบว่า การจองคลาส <strong>${booking.classTitle}</strong> (รหัส ${booking.id}) ยังไม่สามารถอนุมัติได้ในขณะนี้
      </p>

      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px 0; color: #991b1b; font-size: 14px;">เหตุผลและข้อความจากผู้ดูแลระบบ:</h4>
        <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${rejectReason}</p>
      </div>

      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px;">
        <p style="margin: 4px 0;"><strong>รหัสการจอง:</strong> <span style="font-family: monospace;">${booking.id}</span></p>
        <p style="margin: 4px 0;"><strong>คลาส:</strong> ${booking.classTitle}</p>
        <p style="margin: 4px 0;"><strong>รอบวันเวลา:</strong> ${booking.date} (${booking.timeSlot})</p>
        <p style="margin: 4px 0;"><strong>ยอดชำระ:</strong> ${booking.amount.toLocaleString()} บาท</p>
      </div>

      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
        หากเกิดข้อผิดพลาดเกี่ยวกับหลักฐานการโอนเงิน หรือต้องการจองรอบใหม่ ท่านสามารถเข้าสู่ระบบเพื่อแนบสลิปใหม่ หรือเลือกจองรอบที่สะดวกได้อีกครั้งครับ
      </p>

      <p style="margin-top: 24px; text-align: center;">
        <a href="${appUrl}/booking" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          ไปยังหน้าจองคลาสเรียนใหม่
        </a>
      </p>
    </div>
  `;

  return await logEmail({
    to: booking.userEmail,
    subject,
    html,
    type: 'user_confirmation'
  });
}

/**
 * Send notification to Admin when user completes payment (or verified)
 */
export async function sendAdminPaymentReceivedEmail(booking: Booking) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ai-kevin-workshop.com';
  const subject = `💰 [รับชำระเงินเรียบร้อย] ยอด ${booking.amount.toLocaleString()} บาท จากคุณ ${booking.userName} (รหัส ${booking.id})`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
      <h2 style="color: #047857; margin-bottom: 8px;">💵 ยืนยันการรับชำระเงินสำเร็จ</h2>
      <p style="color: #334155;">ระบบได้รับการชำระเงินสำหรับการจองคลาสเรียนเรียบร้อยแล้ว:</p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 4px 0;"><strong>รหัสการจอง:</strong> ${booking.id}</p>
        <p style="margin: 4px 0;"><strong>คลาสเรียน:</strong> ${booking.classTitle}</p>
        <p style="margin: 4px 0;"><strong>ชื่อผู้เรียน:</strong> ${booking.userName} (${booking.userEmail})</p>
        <p style="margin: 4px 0;"><strong>เบอร์โทรศัพท์:</strong> ${booking.userPhone}</p>
        <p style="margin: 4px 0;"><strong>ยอดเงินที่ได้รับ:</strong> <span style="color: #047857; font-size: 18px; font-weight: bold;">${booking.amount.toLocaleString()} บาท</span></p>
        <p style="margin: 4px 0;"><strong>ช่องทาง:</strong> ${booking.paymentMethod === 'stripe' ? 'Stripe (บัตรเครดิตออนไลน์)' : 'โอนผ่าน PromptPay QR'}</p>
        <p style="margin: 4px 0;"><strong>วันที่ชำระ:</strong> ${new Date().toLocaleString('th-TH')}</p>
      </div>

      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app'}/admin" style="background-color: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
          เปิดระบบหลังบ้าน Admin เพื่อดูข้อมูล
        </a>
      </p>
    </div>
  `;

  return await logEmail({
    to: adminEmail,
    subject,
    html,
    type: 'admin_alert'
  });
}

/**
 * Send notification to student when class is rescheduled by admin
 */
export async function sendUserClassRescheduledEmail(
  booking: Booking, 
  newDate: string, 
  newTimeSlot: string, 
  reason?: string
) {
  const subject = `⚠️ [แจ้งเลื่อนรอบเรียน] คลาส ${booking.classTitle} โดย อ. Kevin`;
  const isOnline = booking.classType === 'online';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f59e0b; border-radius: 8px;">
      <h2 style="color: #b45309; margin-bottom: 8px;">🔔 แจ้งเลื่อนรอบวันและเวลาเรียน</h2>
      <p style="color: #475569;">เรียนคุณ <strong>${booking.userName}</strong>,</p>
      <p style="color: #475569;">
        อ. Kevin ขอแจ้งปรับเปลี่ยนรอบเวลาเรียนสำหรับคลาส <strong>${booking.classTitle}</strong> (รหัสการจอง: ${booking.id}) ดังนี้:
      </p>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0; color: #dc2626; text-decoration: line-through;">
          <strong>รอบเดิม:</strong> ${booking.date} เวลา ${booking.timeSlot}
        </p>
        <p style="margin: 6px 0 4px 0; color: #047857; font-size: 16px; font-weight: bold;">
          👉 รอบใหม่: ${newDate} เวลา ${newTimeSlot}
        </p>
        ${reason ? `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #fde68a; font-size: 13px; color: #78350f;">
            <strong>เหตุผลที่เลื่อน:</strong> ${reason}
          </div>
        ` : ''}
      </div>

      ${isOnline && booking.onlineMeetingUrl ? `
        <div style="padding: 12px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #065f46; font-weight: bold;">🔗 ลิงก์ห้องเรียนออนไลน์ (Google Meet / Zoom):</p>
          <p style="margin: 6px 0 0 0;"><a href="${booking.onlineMeetingUrl}" style="color: #059669; word-break: break-all;">${booking.onlineMeetingUrl}</a></p>
        </div>
      ` : ''}

      <p style="color: #64748b; font-size: 13px;">
        หากคุณไม่สะดวกในรอบวันเวลาใหม่ สามารถติดต่อทีมงานหรือส่งข้อความผ่าน Dashboard เพื่อขอเลือกวันอื่นได้ตลอดเวลาครับ
      </p>

      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app'}/dashboard" style="background-color: #b45309; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
          เข้าสู่ระบบดูคลาสที่ Dashboard
        </a>
      </p>
    </div>
  `;

  return await logEmail({
    to: booking.userEmail,
    subject,
    html,
    type: 'user_confirmation'
  });
}

/**
 * Send password reset email generated by Admin to Student
 */
export async function sendAdminResetPasswordEmail(userEmail: string, userName: string, tempPassword: string) {
  const subject = `🔐 [แจ้งรหัสผ่านใหม่] อ. Kevin AI Studio ได้รีเซ็ตรหัสผ่านบัญชีของคุณแล้ว`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #3b82f6; border-radius: 8px;">
      <h2 style="color: #1d4ed8; margin-bottom: 8px;">🔑 แจ้งข้อมูลรหัสผ่านใหม่</h2>
      <p style="color: #475569;">เรียนคุณ <strong>${userName}</strong>,</p>
      <p style="color: #475569;">ผู้ดูแลระบบ (Admin) ได้ทำการรีเซ็ตรหัสผ่านสำหรับบัญชีเข้าใช้งานของคุณเรียบร้อยแล้ว:</p>

      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>อีเมลเข้าสู่ระบบ:</strong> ${userEmail}</p>
        <p style="margin: 6px 0;"><strong>รหัสผ่านใหม่:</strong> <code style="background: #1e293b; color: #facc15; padding: 4px 10px; border-radius: 4px; font-size: 16px; font-weight: bold;">${tempPassword}</code></p>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">* เมื่อเข้าสู่ระบบแล้ว คุณสามารถเปลี่ยนรหัสผ่านได้ที่หน้าตั้งค่าโปรไฟล์</p>
      </div>

      <p style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app'}/login" style="background-color: #1d4ed8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
          เข้าสู่ระบบด้วยรหัสผ่านใหม่
        </a>
      </p>
    </div>
  `;

  return await logEmail({
    to: userEmail,
    subject,
    html,
    type: 'user_confirmation'
  });
}

/**
 * Send welcome email to new student upon registration
 */
export async function sendUserWelcomeEmail(user: { email: string; name: string }) {
  const subject = `🎉 [ยินดีต้อนรับสู่ kevinaiagent.tech] บัญชีของคุณพร้อมใช้งานแล้ว`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <h2 style="color: #0f172a; margin-top: 8px; margin-bottom: 4px; font-size: 22px;">
          ยินดีต้อนรับสู่ kevinaiagent.tech! 🚀
        </h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          สถาบันพัฒนาทักษะ AI ยุคใหม่เพื่อการใช้งานจริงในธุรกิจและชีวิตประจำวัน
        </p>
      </div>

      <div style="padding: 20px 0;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">
          สวัสดีคุณ <strong>${user.name}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          บัญชีของคุณได้ถูกสร้างขึ้นเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบเพื่อเลือกดูคลาสเรียน AI, จองรอบเรียนสด, ดาวน์โหลด E-Book และสะสมแต้มแลกชั่วโมงเรียนฟรีได้ทันทีครับ
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">ข้อมูลบัญชีของคุณ:</h4>
          <p style="margin: 4px 0; font-size: 13px;"><strong>ชื่อผู้ใช้งาน:</strong> ${user.name}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>อีเมลเข้าสู่ระบบ:</strong> ${user.email}</p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${appUrl}/#classes" style="background-color: #f59e0b; color: #0f172a; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
            สำรวจคลาสเรียน AI ทั้งหมด
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">อ. Kevin AI Studio & Academy</p>
        <p style="margin: 0;">ติดต่อสอบถาม: kevinenjoy2025@gmail.com</p>
      </div>
    </div>
  `;

  return await logEmail({
    to: user.email,
    subject,
    html,
    type: 'user_confirmation'
  });
}

/**
 * Send quiz and post-class assessment result email to student
 */
export async function sendQuizResultEmail(params: {
  userEmail: string;
  userName: string;
  quizTitle: string;
  classTitle?: string;
  score: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  passingScorePercent: number;
}) {
  const {
    userEmail,
    userName,
    quizTitle,
    classTitle,
    score,
    totalQuestions,
    scorePercent,
    passed,
    passingScorePercent
  } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';
  const statusEmoji = passed ? '🎉' : '📚';
  const statusLabel = passed ? 'ผ่านเกณฑ์การประเมิน (PASSED)' : 'ยังไม่ผ่านเกณฑ์ (NEEDS IMPROVEMENT)';
  const badgeBg = passed ? '#10b981' : '#f59e0b';
  const scoreColor = passed ? '#059669' : '#d97706';

  const subject = `${statusEmoji} [แจ้งผลการทดสอบ & ประเมิน] ${quizTitle} — คะแนนของคุณ: ${score}/${totalQuestions} (${scorePercent}%)`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <span style="display: inline-block; padding: 4px 14px; border-radius: 9999px; background-color: ${badgeBg}; color: #ffffff; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px;">
          ${statusLabel}
        </span>
        <h2 style="color: #0f172a; margin: 0 0 6px 0; font-size: 22px; font-weight: 800;">
          ผลการทดสอบ & ประเมินผลหลังเรียน
        </h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          สถาบัน kevinaiagent.tech • อ. Kevin AI Studio
        </p>
      </div>

      <div style="padding: 24px 0;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">
          เรียนคุณ <strong>${userName}</strong>,
        </p>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          คุณได้ทำแบบทดสอบวัดความรู้และประเมินผลการเรียนรู้เรียบร้อยแล้ว รายละเอียดผลคะแนนของคุณมีดังนี้:
        </p>

        <!-- Score Showcase Box -->
        <div style="background-color: #f8fafc; border: 2px solid ${passed ? '#a7f3d0' : '#fde68a'}; border-radius: 16px; padding: 24px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">
            คะแนนที่ทำได้ (Your Score)
          </p>
          <div style="font-size: 48px; font-weight: 900; color: ${scoreColor}; line-height: 1.2; margin: 10px 0;">
            ${score} <span style="font-size: 24px; color: #94a3b8; font-weight: 400;">/ ${totalQuestions}</span>
          </div>
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #334155;">
            คิดเป็น <span style="color: ${scoreColor};">${scorePercent}%</span> (เกณฑ์ผ่าน: ${passingScorePercent}%)
          </p>
        </div>

        <!-- Details Info Table -->
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">ชุดแบบทดสอบ:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${quizTitle}</td>
            </tr>
            ${classTitle ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">คลาสเรียนที่เกี่ยวข้อง:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${classTitle}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #64748b;">อีเมลผู้เข้าสอบ:</td>
              <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">สถานะการประเมิน:</td>
              <td style="padding: 8px 0; font-weight: bold; color: ${scoreColor};">${statusLabel}</td>
            </tr>
          </table>
        </div>

        ${passed ? `
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #065f46; line-height: 1.5;">
              🌟 <strong>ขอแสดงความยินดีด้วยครับ!</strong> คุณมีความรู้ความเข้าใจในเนื้อหาหลักสูตรตามมาตรฐานของ kevinaiagent.tech สามารถนำทักษะและ AI Workflows ที่ได้เรียนรู้ไปประยุกต์ใช้งานได้ทันที
            </p>
          </div>
        ` : `
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
              💡 <strong>คำแนะนำ:</strong> สามารถกลับมาทบทวนเอกสารประกอบการสอน / E-Book ใน Dashboard และทดลองทำแบบทดสอบใหม่อีกครั้งเพื่อพัฒนาความเข้าใจให้ดียิ่งขึ้นครับ
            </p>
          </div>
        `}

        <div style="text-align: center; margin-top: 28px;">
          <a href="${appUrl}/dashboard" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            เข้าสู่ Dashboard เพื่อดูรายละเอียดและเฉลย
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">อ. Kevin AI Studio & Academy</p>
        <p style="margin: 0;">หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม ติดต่อ: kevinenjoy2025@gmail.com</p>
      </div>
    </div>
  `;

  return await logEmail({
    to: userEmail,
    subject,
    html,
    type: 'user_confirmation'
  });
}

/**
 * 7-Day Pay Later Notification Email
 * Sent when student registers with "จองสิทธิ์ไว้ก่อน (ชำระภายใน 7 วัน)"
 */
export async function sendUserPayLater7DaysEmail(booking: Booking) {
  const isOnline = booking.classType === 'online';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';
  
  // Calculate or format due date (default 7 days from creation)
  const dueDate = booking.paymentDueAt ? new Date(booking.paymentDueAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const formattedDueDate = dueDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const subject = `⏰ [จองสิทธิ์สำเร็จ] รหัส ${booking.id} - ${booking.classTitle} (กรุณาชำระเงินภายใน 7 วัน)`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <span style="background-color: #fef3c7; color: #b45309; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #fde68a;">
          ⏰ จองสิทธิ์ที่นั่งไว้ก่อน · รอการชำระเงินภายใน 7 วัน
        </span>
        <h2 style="color: #0f172a; margin-top: 14px; margin-bottom: 4px; font-size: 20px; font-weight: 800;">
          ยืนยันการจองสิทธิ์คลาสเรียนเรียบร้อยแล้ว
        </h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          สิทธิ์ที่นั่งของคุณถูกล็อคไว้เรียบร้อยแล้ว กรุณาดำเนินการชำระเงินภายในระยะเวลาที่กำหนด
        </p>
      </div>

      <div style="padding: 20px 0;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">
          เรียนคุณ <strong>${booking.userName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          ระบบได้รับข้อมูลการจองคอร์สเรียนของคุณเรียบร้อยแล้ว โดยคุณได้เลือกช่องทาง <strong>จองสิทธิ์ไว้ก่อน / ชำระเงินภายใน 7 วัน</strong> ที่นั่งของคุณได้รับการสำรองไว้ชั่วคราวแล้วครับ
        </p>

        <!-- Due Date Warning Notice Box -->
        <div style="background-color: #fff1f2; border: 1.5px solid #f43f5e; border-radius: 12px; padding: 16px 18px; margin: 18px 0;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <strong style="color: #be123c; font-size: 15px;">⚠️ เงื่อนไขการชำระเงินและกำหนดเส้นตาย (Deadline):</strong>
          </div>
          <p style="margin: 0 0 6px 0; font-size: 14px; color: #9f1239; font-weight: bold;">
            กรุณาชำระเงินและแนบสลิปก่อน: <span style="background-color: #ffe4e6; padding: 2px 8px; border-radius: 6px; font-size: 15px;">${formattedDueDate} น.</span>
          </p>
          <p style="margin: 0; font-size: 12px; color: #be123c; line-height: 1.5;">
            * หากพ้นกำหนด 7 วันแล้วระบบยังไม่ได้รับยอดชำระและหลักฐานการโอนเงิน <strong>ระบบจะทำการตัดชื่อและยกเลิกสิทธิ์การจองอัตโนมัติ</strong> เพื่อเปิดโอกาสให้ผู้เรียนท่านอื่นในลำดับถัดไปทันที
          </p>
        </div>

        <!-- Booking Details Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">สรุปรายการจองของคุณ:</h4>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 38%;">รหัสการจอง:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #2563eb;">${booking.id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">คลาสเรียน:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${booking.classTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">รูปแบบ:</td>
              <td style="padding: 6px 0; font-weight: 600;">${isOnline ? '🌐 คลาสออนไลน์สด (Live Session)' : '🏢 Onsite Workshop'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">วันและเวลาเรียน:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${booking.date} เวลา ${booking.timeSlot}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">ยอดที่ต้องชำระ:</td>
              <td style="padding: 6px 0; font-weight: 900; color: #d97706; font-size: 17px;">${booking.amount.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">สถานะปัจจุบัน:</td>
              <td style="padding: 6px 0;"><span style="color: #b45309; font-weight: 700; background-color: #fef3c7; padding: 2px 8px; border-radius: 4px;">รอการชำระเงินใน 7 วัน</span></td>
            </tr>
          </table>
        </div>

        <!-- Payment Instructions -->
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: bold;">
            💳 ข้อมูลช่องทางการชำระเงิน (PromptPay & โอนผ่านธนาคาร):
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #15803d;">
            • <strong>พร้อมเพย์ (PromptPay):</strong> 091-746-2444<br>
            • <strong>ชื่อบัญชี:</strong> นาย สรเชษฐ์ (อ. เควิน)<br>
            • <strong>ธนาคาร:</strong> กสิกรไทย (KBANK)
          </p>
          <p style="margin: 0; font-size: 12px; color: #166534;">
            เมื่อชำระเงินเรียบร้อยแล้ว สามารถกดเข้าสู่ระบบผ่านลิงก์ด้านล่างเพื่ออัปโหลดภาพสลิปได้ทันที
          </p>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin-top: 26px;">
          <a href="${appUrl}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
            💳 เข้าสู่ Dashboard เพื่อชำระเงินและแนบสลิป
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">อ. Kevin AI Studio & Academy</p>
        <p style="margin: 0;">หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม ติดต่อ: kevinenjoy2025@gmail.com หรือโทร 091-746-2444</p>
      </div>
    </div>
  `;

  return await logEmail({
    to: booking.userEmail,
    subject,
    html,
    type: 'payment_reminder'
  });
}

/**
 * Auto-Cancellation Notice Email
 * Sent when 7-day payment window expires without payment
 */
export async function sendUserBookingAutoCancelledEmail(booking: Booking) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-kevin-booking.vercel.app';
  const subject = `❌ [แจ้งยกเลิกสิทธิ์การจองอัตโนมัติ] รหัส ${booking.id} - ${booking.classTitle} (เกินกำหนดชำระ 7 วัน)`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
        <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #fecaca;">
          ❌ ยกเลิกสิทธิ์อัตโนมัติ · เกินกำหนดชำระเงิน 7 วัน
        </span>
        <h2 style="color: #0f172a; margin-top: 14px; margin-bottom: 4px; font-size: 20px; font-weight: 800;">
          แจ้งยกเลิกสิทธิ์การจองคอร์สเรียน
        </h2>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          ระบบได้ทำการตัดชื่อและปล่อยสิทธิ์ที่นั่งคืนสู่ระบบเรียบร้อยแล้ว
        </p>
      </div>

      <div style="padding: 20px 0;">
        <p style="margin: 0 0 16px 0; font-size: 15px;">
          เรียนคุณ <strong>${booking.userName}</strong>,
        </p>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569; line-height: 1.6;">
          เนื่องจากรายการจองคอร์สเรียนรหัส <strong>${booking.id} (${booking.classTitle})</strong> ได้ครบกำหนดระยะเวลาการจอง 7 วัน โดยระบบยังไม่ได้รับการแจ้งชำระเงินหรือแนบหลักฐานการโอนเงิน ระบบจึงได้ดำเนินการ <strong>ยกเลิกสิทธิ์การจองและตัดชื่อออกจากระบบอัตโนมัติ</strong> เพื่อเปิดโอกาสให้ผู้เรียนท่านอื่นในลำดับถัดไปตามนโยบายของ Academy ครับ
        </p>

        <!-- Booking Details Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 15px;">ข้อมูลการจองที่ถูกยกเลิก:</h4>
          <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 38%;">รหัสการจอง:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace; color: #64748b;">${booking.id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">คลาสเรียน:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${booking.classTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">ยอดค้างชำระเดิม:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #64748b;">${booking.amount.toLocaleString()} บาท</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">สถานะ:</td>
              <td style="padding: 6px 0;"><span style="color: #991b1b; font-weight: 700; background-color: #fee2e2; padding: 2px 8px; border-radius: 4px;">ยกเลิกอัตโนมัติ (Expired)</span></td>
            </tr>
          </table>
        </div>

        <p style="margin: 16px 0 0 0; font-size: 13px; color: #475569; line-height: 1.6;">
          หากคุณยังคงสนใจเข้าร่วมคลาสเรียน สามารถเข้าไปตรวจสอบรอบเรียนและทำการลงทะเบียนใหม่ได้ตลอดเวลาผ่านหน้าเว็บไซต์ครับ
        </p>

        <!-- Action Button -->
        <div style="text-align: center; margin-top: 26px;">
          <a href="${appUrl}/booking" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;">
            🔍 ตรวจสอบรอบเรียนและสมัครใหม่
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
        <p style="margin: 0 0 4px 0;">อ. Kevin AI Studio & Academy</p>
        <p style="margin: 0;">หากมีข้อสงสัยหรือต้องการสอบถามเพิ่มเติม ติดต่อ: kevinenjoy2025@gmail.com หรือโทร 091-746-2444</p>
      </div>
    </div>
  `;

  return await logEmail({
    to: booking.userEmail,
    subject,
    html,
    type: 'payment_reminder'
  });
}


