const BASE_URL = process.env.TEST_URL || 'https://ai-kevin-booking.vercel.app';

const results = [];

async function runStep(name, fn) {
  process.stdout.write(`⏳ Running: ${name}... `);
  try {
    const res = await fn();
    results.push({ step: name, passed: true, details: res });
    console.log(`✅ PASSED`);
    return res;
  } catch (err) {
    results.push({ step: name, passed: false, error: err.message });
    console.log(`❌ FAILED: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🚀 STARTING END-TO-END AUTONOMOUS AI AGENT TEST SUITE`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`======================================================\n`);

  const timestamp = Date.now();
  const testStudentEmail = `student_${timestamp}@testkevin.ai`;
  const initialPassword = `TestPass@${timestamp}`;
  const newPassword = `NewSecret@${timestamp}`;
  let resetToken = '';
  let createdCourseId = `custom-ai-course-${timestamp}`;
  let bookingId = '';

  // 1. Test User Registration
  await runStep('1. USER FLOW: สมัครสมาชิกใหม่ (Register)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        email: testStudentEmail,
        password: initialPassword,
        name: `สมเกียรติ AI Explorer`,
        phone: '089-123-4567',
        bio: 'สนใจเรียนรู้ AI เพื่อนำไปประยุกต์ใช้ในธุรกิจ'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Register failed');
    if (!data.user?.email || data.user.email !== testStudentEmail) throw new Error('Returned user does not match email');
    return data.user;
  });

  // 2. Test User Login with registered password
  await runStep('2. USER FLOW: เข้าสู่ระบบด้วยรหัสผ่าน (Login)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: testStudentEmail,
        password: initialPassword
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login failed');
    return { loggedInUser: data.user.name, role: data.user.role };
  });

  // 3. Test Forget Password Flow (Request OTP / Token)
  await runStep('3. FORGET PASSWORD: ส่งคำขอรีเซ็ตรหัสผ่าน (Request Token)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request',
        email: testStudentEmail
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Request token failed');
    if (!data.devToken) throw new Error('Token not returned in devToken');
    resetToken = data.devToken;
    return { tokenReceived: resetToken };
  });

  // 4. Test Reset Password with Token
  await runStep('4. RESET PASSWORD: ตั้งรหัสผ่านใหม่ด้วยรหัสยืนยัน (Reset Password)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reset',
        email: testStudentEmail,
        token: resetToken,
        newPassword: newPassword
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Reset failed');
    return { message: data.message };
  });

  // 5. Verify Login with New Password
  await runStep('5. VERIFY: เข้าสู่ระบบด้วยรหัสผ่านใหม่ (Login with New Password)', async () => {
    const res = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: testStudentEmail,
        password: newPassword
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Login with new password failed');
    return { success: true };
  });

  // 6. Test User Profile Settings (Update Profile)
  await runStep('6. PROFILE SETTINGS: ตั้งค่าและอัปเดตข้อมูลโปรไฟล์ผู้เรียน (Update Profile)', async () => {
    const res = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testStudentEmail,
        name: 'สมเกียรติ อัจฉริยะ AI (อัปเดตแล้ว)',
        phone: '099-888-7777',
        bio: 'ผู้ก่อตั้งสตาร์ทอัพ AI ยุคใหม่ 2026'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Update profile failed');
    if (data.user.phone !== '099-888-7777' || data.user.bio !== 'ผู้ก่อตั้งสตาร์ทอัพ AI ยุคใหม่ 2026') {
      throw new Error('Profile fields were not updated properly');
    }
    return data.user;
  });

  // 7. Test Admin Creating New Course
  await runStep('7. ADMIN FLOW: สร้างคอร์สเรียนใหม่ (Create Course / Class)', async () => {
    const newCoursePayload = {
      id: createdCourseId,
      title: 'คลาสพิเศษ: สร้าง AI Agent ทำงานอัตโนมัติ 24 ชม.',
      subtitle: 'คลาสทดสอบระบบโดย AI QA Agent',
      description: 'หลักสูตรเข้มข้นเรียนรู้การสร้าง Agentic Workflow เชื่อมต่อ Supabase และ LLMs',
      type: 'online',
      price: 3500,
      durationMinutes: 180,
      location: 'Google Meet (Live Online)',
      onlineMeetingUrl: 'https://meet.google.com/test-ai-kevin-agent',
      maxSeats: 5,
      availableDates: ['2026-11-20', '2026-11-25', '2026-11-30'],
      timeSlots: ['10:00 - 13:00', '14:00 - 17:00'],
      topics: ['Agent Architecture', 'Tool Calling', 'Database Integration'],
      toolsUsed: ['Claude 3.7', 'Next.js', 'Supabase'],
      prerequisites: 'ความรู้พื้นฐาน Prompt Engineering',
      image: '/assets/creator-workshop.webp',
      featured: true
    };

    const res = await fetch(`${BASE_URL}/api/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCoursePayload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Create course failed');
    return { courseId: data.data.id, title: data.data.title, price: data.data.price };
  });

  // 8. Test Student Booking the Created Course (PromptPay QR Flow)
  await runStep('8. USER FLOW: ลงทะเบียน / จองคอร์สเรียน (Course Booking Flow)', async () => {
    const bookingPayload = {
      classId: createdCourseId,
      classTitle: 'คลาสพิเศษ: สร้าง AI Agent ทำงานอัตโนมัติ 24 ชม.',
      classType: 'online',
      date: '2026-11-20',
      timeSlot: '14:00 - 17:00',
      userId: `usr-${timestamp}`,
      userName: 'สมเกียรติ อัจฉริยะ AI (อัปเดตแล้ว)',
      userEmail: testStudentEmail,
      userPhone: '099-888-7777',
      lineId: '@somkiat_ai',
      notes: 'ต้องการปรึกษาการทำ Multi-Agent workflow',
      amount: 3500,
      paymentMethod: 'promptpay_qr',
      slipUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600'
    };

    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingPayload)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Booking failed');
    bookingId = data.data.id;
    return { bookingId: data.data.id, status: data.data.bookingStatus, amount: data.data.amount };
  });

  // 9. Test Student Checking Dashboard for Bookings
  await runStep('9. USER FLOW: ตรวจสอบรายการจองใน Student Dashboard', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings?userEmail=${encodeURIComponent(testStudentEmail)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Fetch bookings failed');
    const myBooking = data.data.find(b => b.id === bookingId);
    if (!myBooking) throw new Error('Booking not found in user dashboard');
    return { totalUserBookings: data.data.length, currentBookingId: myBooking.id };
  });

  // 10. Test Admin Approving Booking & Updating Meeting Link
  await runStep('10. ADMIN FLOW: อนุมัติการจอง และอัปเดตลิงก์ห้องเรียนออนไลน์', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingStatus: 'confirmed',
        onlineMeetingUrl: 'https://meet.google.com/kevin-live-confirmed-room'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Admin update booking failed');
    return { updatedStatus: data.data.bookingStatus, meetingUrl: data.data.onlineMeetingUrl };
  });

  // 11. Test Admin Sending Direct Email Alert with Meeting Link to Student
  await runStep('11. ADMIN FLOW: ส่งอีเมลแจ้งเตือนผู้เรียน พร้อมลิงก์ห้องเรียน', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: bookingId,
        customMessage: 'ยินดีต้อนรับสู่คลาสเรียน AI 1-on-1 ครับ ขอส่งลิงก์ห้องเรียนสำหรับรอบ 2026-11-20 นี้'
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Send email alert failed');
    return { emailStatus: data.message };
  });

  // 12. Test Stripe Checkout Creation Flow
  await runStep('12. USER FLOW: ทดสอบขั้นตอนการชำระเงินผ่าน Stripe Checkout', async () => {
    const res = await fetch(`${BASE_URL}/api/checkout/stripe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: createdCourseId,
        date: '2026-11-25',
        timeSlot: '10:00 - 13:00',
        userName: 'ทดสอบตัดบัตร Stripe',
        userEmail: 'stripe_test@example.com',
        userPhone: '081-999-8888',
        amount: 3500
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Stripe checkout creation failed');
    return { checkoutSessionId: data.sessionId, paymentStatus: 'simulated_success' };
  });

  console.log(`\n======================================================`);
  console.log(`📊 AI AGENT TEST SUITE SUMMARY`);
  console.log(`======================================================`);
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Total Scenarios Tested : ${total}`);
  console.log(`Passed                 : ${passed} ✅`);
  console.log(`Failed                 : ${failed} ❌`);
  console.log(`Success Rate           : ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error in agent test runner:', err);
  process.exit(1);
});
