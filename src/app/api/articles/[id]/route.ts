import { NextResponse } from 'next/server';
import { getArticles, saveArticle, deleteArticle } from '@/lib/store';
import { Article } from '@/lib/types';

function matchArticle(a: Article, rawId: string, decodedId: string) {
  const aSlugDecoded = decodeURIComponent(a.slug || '').trim();
  return (
    a.id === rawId || 
    a.id === decodedId || 
    a.slug === rawId || 
    a.slug === decodedId ||
    aSlugDecoded === decodedId ||
    aSlugDecoded.toLowerCase() === decodedId.toLowerCase() ||
    a.slug.toLowerCase() === decodedId.toLowerCase()
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const decodedId = decodeURIComponent(rawId || '').trim();
  const articles = await getArticles();
  const found = articles.find(a => matchArticle(a, rawId, decodedId));

  if (!found) {
    return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: found });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const decodedId = decodeURIComponent(rawId || '').trim();
    const articles = await getArticles();
    const existing = articles.find(a => matchArticle(a, rawId, decodedId));

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const body = await req.json();
    const updated: Article = {
      ...existing,
      ...body,
      id: existing.id,
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : existing.tags),
      updatedAt: new Date().toISOString()
    };

    const saved = await saveArticle(updated);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const decodedId = decodeURIComponent(rawId || '').trim();
    const articles = await getArticles();
    const existing = articles.find(a => matchArticle(a, rawId, decodedId));

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    const ok = await deleteArticle(existing.id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
