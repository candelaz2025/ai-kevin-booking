import { NextResponse } from 'next/server';
import { getClasses, saveClass, deleteClass } from '@/lib/store';
import { ClassItem } from '@/lib/types';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const classes = await getClasses();
  const found = classes.find(c => c.id === id);
  if (!found) {
    return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: found });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const classes = await getClasses();
    const existing = classes.find(c => c.id === id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
    }

    if (body.description) {
      const description = String(body.description).trim();
      const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
      if (wordCount > 4000) {
        return NextResponse.json(
          { success: false, error: `เนื้อหารายละเอียดคลาสเรียนเกินกำหนด (${wordCount.toLocaleString()} คำ / สูงสุด 4,000 คำ)` },
          { status: 400 }
        );
      }
    }

    let classImage = body.image !== undefined ? body.image : existing.image;
    if (classImage && typeof classImage === 'string') {
      const trimmed = classImage.trim();
      if (trimmed.startsWith('data:image')) {
        try {
          const { uploadBase64ToGoogleDrive } = await import('@/lib/gdrive');
          const uploaded = await uploadBase64ToGoogleDrive({
            dataUrl: trimmed,
            fileName: `course-cover-${id}-${Date.now()}.png`,
            folderType: 'course'
          });
          if (uploaded.directDownloadUrl) {
            classImage = uploaded.directDownloadUrl;
          }
        } catch (uploadErr) {
          console.warn('Google Drive course cover upload fallback:', uploadErr);
        }
      } else {
        const { formatGoogleDriveImageUrl } = await import('@/lib/gdrive');
        classImage = formatGoogleDriveImageUrl(trimmed);
      }
    }

    let availableDates = existing.availableDates;
    if (body.availableDates !== undefined) {
      if (Array.isArray(body.availableDates)) {
        availableDates = body.availableDates;
      } else if (typeof body.availableDates === 'string') {
        availableDates = body.availableDates.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    let timeSlots = existing.timeSlots;
    if (body.timeSlots !== undefined) {
      if (Array.isArray(body.timeSlots)) {
        timeSlots = body.timeSlots;
      } else if (typeof body.timeSlots === 'string') {
        timeSlots = body.timeSlots.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    let topics = existing.topics;
    if (body.topics !== undefined) {
      if (Array.isArray(body.topics)) {
        topics = body.topics.map((t: any) => String(t).trim()).filter(Boolean);
      } else if (typeof body.topics === 'string') {
        topics = body.topics.split('\n').map((s: string) => s.trim().replace(/^[-*•✦✅\s]+/, '').trim()).filter(Boolean);
      }
    }

    let toolsUsed = existing.toolsUsed;
    if (body.toolsUsed !== undefined) {
      if (Array.isArray(body.toolsUsed)) {
        toolsUsed = body.toolsUsed.map((t: any) => String(t).trim()).filter(Boolean);
      } else if (typeof body.toolsUsed === 'string') {
        toolsUsed = body.toolsUsed.split(/[,,\n]/).map((s: string) => s.trim()).filter(Boolean);
      }
    }

    let prerequisites = existing.prerequisites;
    if (body.prerequisites !== undefined) {
      prerequisites = String(body.prerequisites).trim();
    }

    const isFree = body.isFree !== undefined ? Boolean(body.isFree) : (body.price !== undefined ? Number(body.price) === 0 : existing.isFree);
    const price = isFree ? 0 : (body.price !== undefined ? Number(body.price) : existing.price);
    const level = (body.level === 'advanced' || body.level === 'intermediate' || body.level === 'beginner')
      ? body.level
      : (existing.level || 'beginner');

    const updated: ClassItem = {
      ...existing,
      ...body,
      isFree,
      price,
      level,
      availableDates,
      timeSlots,
      topics,
      toolsUsed,
      prerequisites,
      rewardPoints: body.rewardPoints !== undefined ? Number(body.rewardPoints) : (existing.rewardPoints ?? Math.round(price / 10)),
      image: classImage,
      id
    };
    const saved = await saveClass(updated);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ok = await deleteClass(id);
  if (!ok) {
    return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
