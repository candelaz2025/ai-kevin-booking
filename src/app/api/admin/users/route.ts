import { NextResponse } from 'next/server';
import { getAllUsers, saveUser, deleteUser, getUserByEmail } from '@/lib/store';
import { sendAdminResetPasswordEmail } from '@/lib/email';
import { checkSpamEmail } from '@/lib/anti-spam';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { email, name, phone, bio, role, action } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Action: Reset Password
    if (action === 'reset_password') {
      const tempPassword = 'AI' + Math.floor(100000 + Math.random() * 900000);
      const newHash = hashPassword(tempPassword);

      const updated = {
        ...existingUser,
        passwordHash: newHash,
        resetToken: null,
        resetTokenExpires: null
      };

      await saveUser(updated);

      // Send email to student (real SMTP or simulation)
      const emailResult = await sendAdminResetPasswordEmail(
        existingUser.email,
        existingUser.name || 'ผู้เรียน',
        tempPassword
      ).catch((err) => {
        console.error('Failed to send reset password email:', err);
        return null;
      });

      return NextResponse.json({
        success: true,
        message: `รีเซ็ตรหัสผ่านสำเร็จและส่งรหัสผ่านชั่วคราว (${tempPassword}) ไปยัง ${existingUser.email} เรียบร้อยแล้ว`,
        tempPassword,
        emailStatus: emailResult?.status || 'sent'
      });
    }

    // Action: Edit Profile (including changing Email, Name, Phone, Bio, Role, and custom Password)
    const newEmail = (body.newEmail || body.emailToUpdate || body.email).trim().toLowerCase();

    // Check if new email is different and validate against spam domains
    if (newEmail !== existingUser.email.toLowerCase()) {
      const spamCheck = checkSpamEmail(newEmail);
      if (spamCheck.isBlocked) {
        return NextResponse.json({ success: false, error: spamCheck.reason }, { status: 400 });
      }
      const emailTaken = await getUserByEmail(newEmail);
      if (emailTaken) {
        return NextResponse.json({ success: false, error: 'อีเมลใหม่นี้มีอยู่ในระบบแล้ว กรุณาใช้อีเมลอื่น' }, { status: 400 });
      }
    }

    let finalRewards = existingUser.rewards;
    if (body.points !== undefined) {
      const { ensureUserRewards } = await import('@/lib/store');
      finalRewards = ensureUserRewards(newEmail, existingUser.rewards);
      const newPoints = Math.max(0, Number(body.points));
      const delta = newPoints - (finalRewards.points || 0);
      finalRewards.points = newPoints;
      if (delta !== 0) {
        if (!finalRewards.history) finalRewards.history = [];
        finalRewards.history.unshift({
          id: `rew-admin-${Date.now()}`,
          action: 'admin_adjustment',
          points: delta,
          description: body.reason || `แอดมินปรับคะแนนสะสม (${delta >= 0 ? '+' : ''}${delta} Point)`,
          createdAt: new Date().toISOString()
        });
      }
    }

    const updated = {
      ...existingUser,
      email: newEmail,
      name: name !== undefined ? name.trim() : existingUser.name,
      phone: phone !== undefined ? phone.trim() : existingUser.phone,
      bio: bio !== undefined ? bio.trim() : existingUser.bio,
      role: role !== undefined ? role : existingUser.role,
      rewards: finalRewards,
      passwordHash: body.newPassword ? hashPassword(body.newPassword) : existingUser.passwordHash
    };

    // If email changed, remove the old record from local cache to avoid duplicates
    if (newEmail !== existingUser.email.toLowerCase()) {
      const users: any[] = (global as any).__app_users || [];
      const oldIdx = users.findIndex(u => u.email.toLowerCase() === existingUser.email.toLowerCase());
      if (oldIdx >= 0) {
        users.splice(oldIdx, 1);
        (global as any).__app_users = users;
      }
    }

    await saveUser(updated);

    return NextResponse.json({
      success: true,
      message: 'อัปเดตข้อมูลสมาชิกเรียบร้อยแล้ว',
      data: updated
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'User id is required' }, { status: 400 });
    }

    await deleteUser(id);
    return NextResponse.json({ success: true, message: 'ลบบัญชีสมาชิกเรียบร้อยแล้ว' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
