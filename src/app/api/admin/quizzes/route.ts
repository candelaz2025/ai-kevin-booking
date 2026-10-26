import { NextResponse, NextRequest } from 'next/server';
import { getQuizzes, saveQuiz, deleteQuiz, getQuizSubmissions } from '@/lib/store';
import { Quiz } from '@/lib/types';


export async function GET(req: NextRequest) {
  try {
    const classId = req.nextUrl.searchParams.get('classId') || undefined;

    const [quizzes, submissions] = await Promise.all([
      getQuizzes(classId ? { classId } : undefined),
      getQuizSubmissions(classId ? { classId } : undefined)
    ]);

    return NextResponse.json({
      success: true,
      quizzes,
      submissions
    });
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_PRERENDER') || err?.message?.includes('prerendering')) {
      throw err;
    }
    console.error('Error in GET /api/admin/quizzes:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, description, classId, classTitle, passingScorePercent, questions } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'กรุณาระบุชื่อแบบทดสอบ' }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ success: false, error: 'แบบทดสอบต้องมีคำถามอย่างน้อย 1 ข้อ' }, { status: 400 });
    }

    const quizId = id || `quiz-${Date.now()}`;
    const cleanPassingScore = Number(passingScorePercent) > 0 ? Number(passingScorePercent) : 70;

    const formattedQuestions = questions.map((q: any, idx: number) => ({
      id: q.id || `q${idx + 1}`,
      question: (q.question || '').trim() || `ข้อที่ ${idx + 1}`,
      options: Array.isArray(q.options) && q.options.length >= 2 
        ? q.options.map((opt: string) => (opt || '').trim())
        : ['ตัวเลือก A', 'ตัวเลือก B', 'ตัวเลือก C', 'ตัวเลือก D'],
      correctOptionIndex: typeof q.correctOptionIndex === 'number' && q.correctOptionIndex >= 0 
        ? q.correctOptionIndex 
        : 0,
      explanation: (q.explanation || '').trim()
    }));

    const quizData: Quiz = {
      id: quizId,
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      description: (description || '').trim(),
      classId: classId || undefined,
      classTitle: classTitle || undefined,
      passingScorePercent: cleanPassingScore,
      questions: formattedQuestions,
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await saveQuiz(quizData);

    return NextResponse.json({
      success: true,
      data: saved
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/quizzes:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing quiz ID' }, { status: 400 });
    }

    await deleteQuiz(id);
    return NextResponse.json({ success: true, message: 'ลบแบบทดสอบเรียบร้อยแล้ว' });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/quizzes:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
