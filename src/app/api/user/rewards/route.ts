import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser, addRewardPoints, ensureUserRewards, getAllUsers, getSiteSettings } from '@/lib/store';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email parameter required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(cleanEmail);
    const settings = await getSiteSettings();

    const rawLineId = settings?.footerLineId || 'Candelaz';
    const cleanLineId = rawLineId.replace(/^@/, '');

    const currentRewards = ensureUserRewards(cleanEmail, user?.rewards);

    // Build LINE direct link with prefilled message code (e.g. CK83DD)
    const lineNotifyCode = currentRewards.lineNotifyCode || `CK${Math.floor(1000 + Math.random() * 9000)}`;
    const lineOaUrl = `https://line.me/R/oaMessage/@${cleanLineId}/?${encodeURIComponent(lineNotifyCode)}`;
    const lineAddFriendUrl = `https://line.me/ti/p/~${cleanLineId}`;

    return NextResponse.json({
      success: true,
      data: {
        rewards: currentRewards,
        lineOaId: rawLineId,
        lineNotifyCode,
        lineOaUrl,
        lineAddFriendUrl
      }
    });
  } catch (err: any) {
    console.error('Error fetching rewards:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, action, classId, classTitle, platform, refCode } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await getUserByEmail(cleanEmail);

    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'user',
        provider: 'credentials',
        createdAt: new Date().toISOString()
      };
    }

    const currentRewards = ensureUserRewards(cleanEmail, user.rewards);

    // Action 1: Connect LINE (+10 points)
    if (action === 'connect_line') {
      const alreadyConnected = currentRewards.lineConnected;
      currentRewards.lineConnected = true;

      let pointsAwarded = 0;
      if (!alreadyConnected) {
        currentRewards.points = (currentRewards.points || 0) + 10;
        pointsAwarded = 10;
        if (!currentRewards.history) currentRewards.history = [];
        currentRewards.history.unshift({
          id: `rew-line-${Date.now()}`,
          action: 'connect_line',
          points: 10,
          description: 'เชื่อมต่อบัญชี LINE สำเร็จ (+10 Point)',
          createdAt: new Date().toISOString()
        });
      }

      user.rewards = currentRewards;
      await saveUser(user);

      return NextResponse.json({
        success: true,
        message: pointsAwarded > 0 
          ? 'เชื่อมต่อบัญชี LINE สำเร็จ! คุณได้รับ +10 คะแนนสะสม' 
          : 'เชื่อมต่อบัญชี LINE เรียบร้อยแล้ว',
        pointsAwarded,
        rewards: currentRewards
      });
    }

    // Action 2: Disconnect LINE
    if (action === 'disconnect_line') {
      currentRewards.lineConnected = false;
      user.rewards = currentRewards;
      await saveUser(user);

      return NextResponse.json({
        success: true,
        message: 'ยกเลิกการเชื่อมต่อ LINE เรียบร้อยแล้ว',
        rewards: currentRewards
      });
    }

    // Action 3: Generate New LINE verification code
    if (action === 'generate_line_code') {
      const seed = Math.floor(1000 + Math.random() * 9000);
      currentRewards.lineNotifyCode = `CK${seed}`;
      user.rewards = currentRewards;
      await saveUser(user);

      return NextResponse.json({
        success: true,
        lineNotifyCode: currentRewards.lineNotifyCode,
        rewards: currentRewards
      });
    }

    // Action 4: Share Class via Social Media (+10 points)
    if (action === 'share_class') {
      const pName = platform === 'line' ? 'LINE' : platform === 'facebook' ? 'Facebook' : platform === 'x' ? 'X / Twitter' : 'Social Media';
      const cTitle = classTitle || 'คลาสเรียน AI Masterclass';

      currentRewards.points = (currentRewards.points || 0) + 10;
      if (!currentRewards.sharedClasses) currentRewards.sharedClasses = [];
      if (classId && !currentRewards.sharedClasses.includes(classId)) {
        currentRewards.sharedClasses.push(classId);
      }

      if (!currentRewards.history) currentRewards.history = [];
      currentRewards.history.unshift({
        id: `rew-share-${Date.now()}`,
        action: 'share_class',
        points: 10,
        description: `แชร์คลาส "${cTitle}" ผ่าน ${pName} (+10 Point)`,
        createdAt: new Date().toISOString()
      });
      currentRewards.history = currentRewards.history.slice(0, 50);

      user.rewards = currentRewards;
      await saveUser(user);

      return NextResponse.json({
        success: true,
        message: `แชร์คลาสสำเร็จ! ได้รับ +10 คะแนนสะสม`,
        pointsAwarded: 10,
        rewards: currentRewards
      });
    }

    // Action 5: Test LINE Notification
    if (action === 'test_line_notify') {
      return NextResponse.json({
        success: true,
        message: 'ระบบจำลองส่งการแจ้งเตือนตัวอย่างไปยัง LINE ของคุณเรียบร้อยแล้ว'
      });
    }

    // Action 6: Apply Referral Code
    if (action === 'apply_referral') {
      if (!refCode || refCode === currentRewards.refCode) {
        return NextResponse.json({ success: false, error: 'รหัสแนะนำไม่ถูกต้อง' }, { status: 400 });
      }

      // Check if already referred
      if (currentRewards.referredBy) {
        return NextResponse.json({ success: true, message: 'บันทึกผู้แนะนำเรียบร้อยแล้ว' });
      }

      const all = await getAllUsers();
      const referrer = all.find(u => u.rewards?.refCode === refCode);
      if (referrer && referrer.email !== cleanEmail) {
        currentRewards.referredBy = refCode;
        user.rewards = currentRewards;
        await saveUser(user);

        // Increment referrer count
        const refRewards = ensureUserRewards(referrer.email, referrer.rewards);
        refRewards.referralCount = (refRewards.referralCount || 0) + 1;
        refRewards.points = (refRewards.points || 0) + 20; // 20 bonus points on friend signup
        if (!refRewards.history) refRewards.history = [];
        refRewards.history.unshift({
          id: `rew-reg-${Date.now()}`,
          action: 'referral_signup',
          points: 20,
          description: `มีเพื่อน (${user.name || cleanEmail}) สมัครสมาชิกผ่านลิงก์ของคุณ (+20 Point)`,
          createdAt: new Date().toISOString()
        });
        referrer.rewards = refRewards;
        await saveUser(referrer);

        return NextResponse.json({
          success: true,
          message: 'บันทึกรหัสผู้แนะนำสำเร็จ',
          rewards: currentRewards
        });
      }

      return NextResponse.json({ success: false, error: 'ไม่พบรหัสผู้แนะนำนี้ในระบบ' }, { status: 404 });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('Rewards action error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
