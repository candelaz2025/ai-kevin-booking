import { NextResponse } from 'next/server';
import { getArticles, saveArticle } from '@/lib/store';
import { Article } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let articles = await getArticles();

    if (category) {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (status) {
      articles = articles.filter(a => a.status === status);
    }

    return NextResponse.json({ success: true, data: articles });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.content) {
      return NextResponse.json({ success: false, error: 'กรุณากรอกหัวข้อและเนื้อหาบทความ' }, { status: 400 });
    }

    // Auto generate clean slug if not given
    const rawSlug = body.slug || body.title;
    const slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0E00-\u0E7F-]+/g, '-')
      .replace(/^-+|-+$/g, '') || `post-${Date.now()}`;

    const newArticle: Article = {
      id: body.id || `art-${Date.now()}`,
      slug,
      title: body.title,
      excerpt: body.excerpt || '',
      content: body.content,
      coverImage: body.coverImage || '/assets/ai-content-workshop.avif',
      authorName: body.authorName || 'อ. Kevin (AI Studio)',
      category: body.category || 'AI Knowledge',
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      status: body.status === 'draft' ? 'draft' : 'published',
      views: Number(body.views) || 0,
      featured: Boolean(body.featured),
      driveFileId: body.driveFileId,
      createdAt: body.createdAt || new Date().toISOString()
    };

    const saved = await saveArticle(newArticle);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
