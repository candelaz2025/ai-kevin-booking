import { NextResponse } from 'next/server';
import { getQuizById, saveQuizSubmission } from '@/lib/store';
import { sendQuizResultEmail } from '@/lib/email';
import { QuizSubmission } from '@/lib/types';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quizId, answers, userEmail, userName, userId, classId, classTitle } = body;

    if (!quizId) {
      return NextResponse.json({ success: false, error: 'Missing quizId' }, { status: 400 });
    }

    if (!userEmail || !userEmail.includes('@')) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุอีเมลผู้เรียนที่ถูกต้อง' }, { status: 400 });
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'รูปแบบคำตอบไม่ถูกต้อง' }, { status: 400 });
    }

    const quiz = await getQuizById(quizId);
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'ไม่พบแบบทดสอบที่ระบุ' }, { status: 404 });
    }

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;

    // Detailed breakdown for student review
    const questionReview = quiz.questions.map((q, idx) => {
      const userAnswer = typeof answers[idx] === 'number' ? answers[idx] : -1;
      const isCorrect = userAnswer === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      return {
        id: q.id,
        question: q.question,
        options: q.options,
        userAnswer,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation || ''
      };
    });

    const scorePercent = Math.round((correctCount / (totalQuestions || 1)) * 100);
    const passingScorePercent = quiz.passingScorePercent || 70;
    const passed = scorePercent >= passingScorePercent;

    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const studentName = (userName || '').trim() || 'ผู้เรียน';

    const submission: QuizSubmission = {
      id: submissionId,
      quizId: quiz.id,
      quizTitle: quiz.title,
      classId: classId || quiz.classId,
      classTitle: classTitle || quiz.classTitle,
      userId: userId || 'anonymous',
      userEmail: userEmail.trim(),
      userName: studentName,
      answers,
      score: correctCount,
      totalQuestions,
      scorePercent,
      passed,
      submittedAt: new Date().toISOString(),
      emailSent: true
    };

    // 1. Save submission
    await saveQuizSubmission(submission);

    // 2. Dispatch email notification asynchronously
    try {
      await sendQuizResultEmail({
        userEmail: userEmail.trim(),
        userName: studentName,
        quizTitle: quiz.title,
        classTitle: submission.classTitle,
        score: correctCount,
        totalQuestions,
        scorePercent,
        passed,
        passingScorePercent
      });
    } catch (emailErr) {
      console.error('Failed to send quiz result email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      submission,
      score: correctCount,
      totalQuestions,
      scorePercent,
      passed,
      passingScorePercent,
      questionReview
    });
  } catch (err: any) {
    console.error('Error in POST /api/quizzes/submit:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
