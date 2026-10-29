import { NextResponse } from 'next/server';
import poolData from '@/data/random-500-prompts.json';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const pickOne = searchParams.get('random') === 'true';

    let items = [...poolData];

    if (category && category !== 'all') {
      items = items.filter(
        item => item.category.toLowerCase() === category.toLowerCase() ||
                item.categoryTh.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        item => item.title.toLowerCase().includes(q) ||
                item.ideaSummary.toLowerCase().includes(q) ||
                item.fullPrompt.toLowerCase().includes(q) ||
                item.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    if (pickOne && items.length > 0) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      return NextResponse.json({
        success: true,
        data: randomItem,
        totalInPool: poolData.length
      });
    }

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
      totalInPool: poolData.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch 500 pool items' },
      { status: 500 }
    );
  }
}
