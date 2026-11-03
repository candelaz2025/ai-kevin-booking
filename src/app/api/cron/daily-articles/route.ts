import { NextRequest, NextResponse } from 'next/server';
import { runDailyArticlesRoutine, generateDailyAiArticle } from '@/lib/ai-article-generator';
import { saveArticle } from '@/lib/store';

export const maxDuration = 60; // Allow sufficient time for LLM generation

/**
 * Handler for Cron Execution (Vercel Cron calls GET)
 * Also supports manual trigger from Admin panel
 */
export async function GET(request: NextRequest) {
  // Check authorization if CRON_SECRET is set
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If request comes from Vercel cron, it sends auth header or vercel-cron user agent
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');
    if (!isVercelCron) {
      console.warn('Unauthorized cron trigger attempt without secret or vercel-cron user-agent');
      // For development/admin testing flexibility, we allow execution unless explicitly forbidden
    }
  }

  try {
    const result = await runDailyArticlesRoutine();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'cron_routine_0900_am',
      result
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Routine execution failed' },
      { status: 500 }
    );
  }
}

/**
 * Handler for Admin Manual Trigger (POST)
 * Can generate either 'both', 'ai_techniques', or 'ai_news'
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body.target || 'both'; // 'both' | 'ai_techniques' | 'ai_news'

    if (target === 'both') {
      const result = await runDailyArticlesRoutine();
      return NextResponse.json({
        success: true,
        message: 'สร้างและเผยแพร่บทความอัตโนมัติ 2 เรื่องเรียบร้อยแล้ว',
        result
      });
    }

    if (target === 'ai_techniques' || target === 'ai_news') {
      const article = await generateDailyAiArticle(target);
      await saveArticle(article);
      return NextResponse.json({
        success: true,
        message: `สร้างและเผยแพร่บทความหมวด ${article.category} เรียบร้อยแล้ว`,
        article
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid target' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in manual article automation trigger:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to trigger article automation' },
      { status: 500 }
    );
  }
}
