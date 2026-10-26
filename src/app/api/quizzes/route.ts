import { NextResponse, NextRequest } from 'next/server';
import { getQuizzes, getQuizSubmissions } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const classId = req.nextUrl.searchParams.get('classId') || undefined;
    const userEmail = req.nextUrl.searchParams.get('userEmail') || undefined;

    const quizzes = await getQuizzes(classId ? { classId } : undefined);

    // If userEmail is provided, also fetch their prior submissions
    let userSubmissions: any[] = [];
    if (userEmail) {
      userSubmissions = await getQuizSubmissions({ userEmail });
    }

    // Format quiz questions for client taking (hide correct answers until submitted)
    const sanitizedQuizzes = quizzes.map(q => ({
      ...q,
      questions: q.questions.map(question => ({
        id: question.id,
        question: question.question,
        options: question.options
        // correctOptionIndex and explanation hidden for exam integrity
      }))
    }));

    return NextResponse.json({
      success: true,
      quizzes: sanitizedQuizzes,
      userSubmissions
    });
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_PRERENDER') || err?.message?.includes('prerendering')) {
      throw err;
    }
    console.error('Error in GET /api/quizzes:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
