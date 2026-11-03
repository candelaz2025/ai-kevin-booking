import { NextResponse } from 'next/server';
import { getClasses, saveClass } from '@/lib/store';
import { ClassItem } from '@/lib/types';

export async function GET() {
  const classes = await getClasses();
  return NextResponse.json({ success: true, data: classes });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const description = (body.description || '').trim();
    // Validate word count (max 4,000 words)
    const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
    if (wordCount > 4000) {
      return NextResponse.json(
        { success: false, error: `เนื้อหารายละเอียดคลาสเรียนเกินกำหนด (${wordCount.toLocaleString()} คำ / สูงสุด 4,000 คำ)` },
        { status: 400 }
      );
    }

    let classImage = (body.image || '').trim() || '/assets/ai-content-workshop.avif';
    if (classImage.startsWith('data:image')) {
      try {
        const { uploadBase64ToGoogleDrive } = await import('@/lib/gdrive');
        const uploaded = await uploadBase64ToGoogleDrive({
          dataUrl: classImage,
          fileName: `course-cover-${Date.now()}.png`,
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
      classImage = formatGoogleDriveImageUrl(classImage);
    }

    let availableDates: string[] = [];
    if (Array.isArray(body.availableDates)) {
      availableDates = body.availableDates;
    } else if (typeof body.availableDates === 'string') {
      availableDates = body.availableDates.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    let timeSlots: string[] = ['13:00 - 16:00'];
    if (Array.isArray(body.timeSlots)) {
      timeSlots = body.timeSlots;
    } else if (typeof body.timeSlots === 'string') {
      timeSlots = body.timeSlots.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const isFree = body.isFree !== undefined ? Boolean(body.isFree) : (Number(body.price) === 0);
    const price = isFree ? 0 : (Number(body.price) || 0);

    const newClass: ClassItem = {
      id: body.id || `class-${Date.now()}`,
      title: body.title || 'Untitled Class',
      subtitle: body.subtitle || '',
      description: body.description || '',
      type: body.type === 'online' ? 'online' : 'onsite',
      level: (body.level === 'advanced' || body.level === 'intermediate') ? body.level : 'beginner',
      price,
      isFree,
      rewardPoints: body.rewardPoints !== undefined ? Number(body.rewardPoints) : Math.round(price / 10),
      durationMinutes: Number(body.durationMinutes) || 120,
      durationValue: body.durationValue !== undefined ? Number(body.durationValue) : undefined,
      durationUnit: body.durationUnit || 'minute',
      location: body.location || '',
      onlineMeetingUrl: body.onlineMeetingUrl || '',
      maxSeats: Number(body.maxSeats) || 1,
      availableDates,
      timeSlots,
      topics: Array.isArray(body.topics) 
        ? body.topics.map((t: any) => String(t).trim()).filter(Boolean)
        : typeof body.topics === 'string'
        ? body.topics.split('\n').map((s: string) => s.trim().replace(/^[-*•✦✅\s]+/, '').trim()).filter(Boolean)
        : [],
      toolsUsed: Array.isArray(body.toolsUsed)
        ? body.toolsUsed.map((t: any) => String(t).trim()).filter(Boolean)
        : typeof body.toolsUsed === 'string'
        ? body.toolsUsed.split(/[,,\n]/).map((s: string) => s.trim()).filter(Boolean)
        : [],
      prerequisites: body.prerequisites ? String(body.prerequisites).trim() : '',
      image: classImage,
      featured: Boolean(body.featured),
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      videoUrl: body.videoUrl ? String(body.videoUrl).trim() : '',
      lessons: Array.isArray(body.lessons) ? body.lessons : [],
      instructorName: body.instructorName ? String(body.instructorName).trim() : 'อาจารย์ สรเชษฐ์ (อ. เควิน)',
      instructorTitle: body.instructorTitle ? String(body.instructorTitle).trim() : 'Founder & Lead AI Instructor, Kevin AI Academy',
      instructorSignature: body.instructorSignature ? String(body.instructorSignature).trim() : '',
      certificateEnabled: body.certificateEnabled !== undefined ? Boolean(body.certificateEnabled) : true,
      passingScorePercent: body.passingScorePercent ? Number(body.passingScorePercent) : 70
    };

    const saved = await saveClass(newClass);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
