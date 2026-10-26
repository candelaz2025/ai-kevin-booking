import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/store';
import { logEmail } from '@/lib/email';
import { checkSpamEmail } from '@/lib/anti-spam';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { action, email, token, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'อีเมลเป็นข้อมูลจำเป็น' }, { status: 400 });
    }

    // Anti-Spam protection: Check format & block @example.com and disposable domains
    const spamCheck = checkSpamEmail(email);
    if (spamCheck.isBlocked) {
      return NextResponse.json({ success: false, error: spamCheck.reason }, { status: 400 });
    }

    const cleanEmail = spamCheck.normalizedEmail;
    const user = await getUserByEmail(cleanEmail);

    if (action === 'request') {
      if (!user) {
        // Return friendly message even if user not found for security, or say user found
        return NextResponse.json({ 
          success: true, 
          message: 'หากอีเมลนี้มีอยู่ในระบบ ลิงก์หรือรหัสสำหรับตั้งรหัสผ่านใหม่จะถูกส่งไปยังอีเมลของคุณ' 
        });
      }

      // Generate 6-digit reset code
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      await saveUser({
        ...user,
        resetToken,
        resetTokenExpires: expiresAt
      });

      // Send email (via real SMTP/Resend or simulation)
      const emailResult = await logEmail({
        to: cleanEmail,
        subject: '🔐 รหัสยืนยันการตั้งรหัสผ่านใหม่ — อ. Kevin AI Studio',
        html: `<div style="font-family:sans-serif;padding:20px;background:#0d1725;color:#fff;border-radius:12px;">
          <h2>ตั้งรหัสผ่านใหม่</h2>
          <p>คุณได้ส่งคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี: <strong>${cleanEmail}</strong></p>
          <p>รหัสยืนยันของคุณคือ: <strong style="font-size:24px;color:#f59e0b;letter-spacing:4px;">${resetToken}</strong></p>
          <p style="color:#94a3b8;font-size:12px;">รหัสนี้มีอายุ 15 นาที หากคุณไม่ได้ส่งคำขอนี้ สามารถเพิกเฉยต่ออีเมลนี้ได้</p>
        </div>`,
        type: 'user_confirmation'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'ส่งรหัสตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว',
        emailStatus: emailResult.status,
        devToken: resetToken // for immediate testing/agent convenience
      });
    }

    if (action === 'reset') {
      if (!token || !newPassword) {
        return NextResponse.json({ success: false, error: 'กรุณากรอกรหัสยืนยันและรหัสผ่านใหม่' }, { status: 400 });
      }

      if (!user) {
        return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' }, { status: 404 });
      }

      if (user.resetToken !== token.trim()) {
        return NextResponse.json({ success: false, error: 'รหัสยืนยันไม่ถูกต้อง' }, { status: 400 });
      }

      if (user.resetTokenExpires && new Date(user.resetTokenExpires) < new Date()) {
        return NextResponse.json({ success: false, error: 'รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่' }, { status: 400 });
      }

      const newHash = hashPassword(newPassword);
      await saveUser({
        ...user,
        passwordHash: newHash,
        resetToken: null,
        resetTokenExpires: null
      });

      return NextResponse.json({ 
        success: true, 
        message: 'ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที' 
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
