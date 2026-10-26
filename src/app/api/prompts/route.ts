import { NextResponse } from 'next/server';
import { getPromptTemplates, savePromptTemplate } from '@/lib/store';
import { PromptTemplate } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let prompts = await getPromptTemplates();

    if (category && category !== 'all') {
      prompts = prompts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      prompts = prompts.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      data: prompts
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch prompt templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.templateContent) {
      return NextResponse.json(
        { success: false, error: 'Title and templateContent are required' },
        { status: 400 }
      );
    }

    const slug = body.slug?.trim() || body.title
      .toLowerCase()
      .replace(/[^\w\sก-๙-]/g, '')
      .replace(/\s+/g, '-');

    const newPrompt: PromptTemplate = {
      id: body.id || `prompt-${Date.now()}`,
      title: body.title,
      slug,
      category: body.category || 'Coding & SaaS',
      description: body.description || '',
      targetRole: body.targetRole || 'Developer',
      aiModel: body.aiModel || 'Claude / Codex',
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((t: string) => t.trim()) : []),
      systemPrompt: body.systemPrompt || '',
      templateContent: body.templateContent,
      variables: Array.isArray(body.variables) ? body.variables : [],
      isFeatured: Boolean(body.isFeatured),
      copyCount: body.copyCount || 0,
      authorName: body.authorName || 'อ. Kevin (AI Studio)',
      createdAt: new Date().toISOString()
    };

    const saved = await savePromptTemplate(newPrompt);

    return NextResponse.json({
      success: true,
      data: saved
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create prompt template' },
      { status: 500 }
    );
  }
}
