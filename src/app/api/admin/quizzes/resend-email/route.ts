import { NextResponse } from 'next/server';
import { getQuizSubmissions, getQuizById } from '@/lib/store';
import { sendQuizResultEmail } from '@/lib/email';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { submissionId } = body;

    if (!submissionId) {
      return NextResponse.json({ success: false, error: 'Missing submissionId' }, { status: 400 });
    }

    const submissions = await getQuizSubmissions();
    const sub = submissions.find(s => s.id === submissionId);

    if (!sub) {
      return NextResponse.json({ success: false, error: 'ไม่พบประวัติผลการทดสอบนี้' }, { status: 404 });
    }

    const quiz = await getQuizById(sub.quizId);
    const passingScorePercent = quiz?.passingScorePercent || 70;

    const emailRes = await sendQuizResultEmail({
      userEmail: sub.userEmail,
      userName: sub.userName,
      quizTitle: sub.quizTitle,
      classTitle: sub.classTitle,
      score: sub.score,
      totalQuestions: sub.totalQuestions,
      scorePercent: sub.scorePercent,
      passed: sub.passed,
      passingScorePercent
    });

    return NextResponse.json({
      success: true,
      message: `ส่งอีเมลแจ้งผลสอบไปยัง ${sub.userEmail} เรียบร้อยแล้ว`,
      emailStatus: emailRes.status
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/quizzes/resend-email:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
