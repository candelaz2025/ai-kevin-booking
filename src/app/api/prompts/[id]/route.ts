import { NextResponse } from 'next/server';
import { getPromptTemplateBySlug, savePromptTemplate, deletePromptTemplate, incrementPromptCopyCount } from '@/lib/store';
import { PromptTemplate } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const prompt = await getPromptTemplateBySlug(id);

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prompt
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getPromptTemplateBySlug(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Prompt template not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Check if this is a copy-counter ping
    if (body.action === 'increment_copy') {
      await incrementPromptCopyCount(existing.id);
      return NextResponse.json({ success: true, count: (existing.copyCount || 0) + 1 });
    }

    const updated: PromptTemplate = {
      ...existing,
      title: body.title !== undefined ? body.title : existing.title,
      slug: body.slug !== undefined ? body.slug : existing.slug,
      category: body.category !== undefined ? body.category : existing.category,
      description: body.description !== undefined ? body.description : existing.description,
      targetRole: body.targetRole !== undefined ? body.targetRole : existing.targetRole,
      aiModel: body.aiModel !== undefined ? body.aiModel : existing.aiModel,
      tags: Array.isArray(body.tags) ? body.tags : existing.tags,
      systemPrompt: body.systemPrompt !== undefined ? body.systemPrompt : existing.systemPrompt,
      templateContent: body.templateContent !== undefined ? body.templateContent : existing.templateContent,
      variables: Array.isArray(body.variables) ? body.variables : existing.variables,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
      authorName: body.authorName !== undefined ? body.authorName : existing.authorName,
      updatedAt: new Date().toISOString()
    };

    const saved = await savePromptTemplate(updated);

    return NextResponse.json({
      success: true,
      data: saved
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getPromptTemplateBySlug(id);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Prompt template not found' },
        { status: 404 }
      );
    }

    const deleted = await deletePromptTemplate(existing.id);

    return NextResponse.json({
      success: deleted
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
