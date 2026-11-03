import { NextResponse } from 'next/server';
import { getBookings, getClasses } from '@/lib/store';
import { Booking, ClassItem } from '@/lib/types';

// Helper to format ISO date YYYY-MM-DD + time slot HH:mm to UTC string format YYYYMMDDTHHmmssZ
function formatToICSDate(dateStr: string, timeStr?: string): { start: string; end: string } {
  // dateStr format: YYYY-MM-DD
  const [year, month, day] = (dateStr || '').split('-').map(Number);
  
  let startHour = 10;
  let startMin = 0;
  let endHour = 12;
  let endMin = 0;

  if (timeStr && timeStr.includes('-')) {
    const [startPart, endPart] = timeStr.split('-');
    const [sH, sM] = startPart.trim().split(':').map(Number);
    const [eH, eM] = endPart.trim().split(':').map(Number);
    if (!isNaN(sH)) startHour = sH;
    if (!isNaN(sM)) startMin = sM;
    if (!isNaN(eH)) endHour = eH;
    if (!isNaN(eM)) endMin = eM;
  } else if (timeStr && timeStr.includes(':')) {
    const [sH, sM] = timeStr.trim().split(':').map(Number);
    if (!isNaN(sH)) startHour = sH;
    if (!isNaN(sM)) startMin = sM;
    endHour = startHour + 2;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Convert Thailand Time (UTC+7) to UTC
  // date object in UTC with local hour - 7
  const startUtc = new Date(Date.UTC(year || 2026, (month || 1) - 1, day || 1, startHour - 7, startMin, 0));
  const endUtc = new Date(Date.UTC(year || 2026, (month || 1) - 1, day || 1, endHour - 7, endMin, 0));

  const formatUtcString = (d: Date) => {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  };

  return {
    start: formatUtcString(startUtc),
    end: formatUtcString(endUtc)
  };
}

function escapeICS(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format'); // 'ics' or 'json'

    const [bookings, classes] = await Promise.all([
      getBookings(),
      getClasses()
    ]);

    // Build calendar events list
    // 1. Confirmed & Rescheduled bookings (active sessions with students)
    // 2. Open class schedule slots (available slots scheduled by admin)
    const activeBookings = bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'rescheduled');
    const pendingBookings = bookings.filter(b => b.bookingStatus === 'pending_payment');

    if (format === 'ics') {
      const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Kevin Booking//Admin Teaching Calendar//TH',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Kevin Teaching Schedule',
        'X-WR-TIMEZONE:Asia/Bangkok'
      ];

      // Add active teaching bookings
      for (const b of activeBookings) {
        if (!b.date) continue;
        const { start, end } = formatToICSDate(b.date, b.timeSlot);
        const summary = `[สอน] ${b.classTitle} - ${b.userName || b.userEmail}`;
        const description = `ตารางสอน Kevin Booking\\nนักเรียน: ${b.userName} (${b.userEmail})\\nเบอร์โทร: ${b.userPhone || '-'}\\nรหัสการจอง: ${b.id}\\nรูปแบบ: ${b.classType === 'online' ? 'คลาสออนไลน์' : 'Onsite Workshop'}\\nลิงก์เข้าเรียน: ${b.onlineMeetingUrl || '-'}`;
        const location = b.classType === 'online' ? (b.onlineMeetingUrl || 'Google Meet') : 'Onsite Classroom';

        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:booking-${b.id}@kevin-booking.com`);
        icsContent.push(`DTSTAMP:${nowUtc}`);
        icsContent.push(`DTSTART:${start}`);
        icsContent.push(`DTEND:${end}`);
        icsContent.push(`SUMMARY:${escapeICS(summary)}`);
        icsContent.push(`DESCRIPTION:${escapeICS(description)}`);
        icsContent.push(`LOCATION:${escapeICS(location)}`);
        icsContent.push(`STATUS:CONFIRMED`);
        icsContent.push('END:VEVENT');
      }

      // Add scheduled course teaching sessions configured in courses
      for (const c of classes) {
        if (!c.availableDates || !Array.isArray(c.availableDates)) continue;
        const timeSlots = c.timeSlots && c.timeSlots.length > 0 ? c.timeSlots : ['13:00 - 16:00'];

        for (const date of c.availableDates) {
          if (!date) continue;
          for (const ts of timeSlots) {
            const { start, end } = formatToICSDate(date, ts);
            const enrolled = activeBookings.filter(b => b.classId === c.id && b.date === date && b.timeSlot === ts).length;
            const summary = `[เปิดสอน] ${c.title} (${enrolled}/${c.maxSeats || 20} คน)`;
            const description = `กำหนดการสอนคลาส kevinaiagent.tech\\nคอร์ส: ${c.title}\\nรูปแบบ: ${c.type === 'online' ? 'คลาสออนไลน์' : 'Onsite Workshop'}\\nรอบเวลา: ${ts}\\nจำนวนนักเรียนลงทะเบียน: ${enrolled}/${c.maxSeats || 20} คน\\nสถานที่/ลิงก์: ${c.onlineMeetingUrl || c.location || '-'}`;
            const location = c.type === 'online' ? (c.onlineMeetingUrl || 'Google Meet') : (c.location || 'Onsite Classroom');
            const cleanTs = (ts || '').replace(/[^a-zA-Z0-9]/g, '');

            icsContent.push('BEGIN:VEVENT');
            icsContent.push(`UID:class-slot-${c.id}-${date}-${cleanTs}@kevin-booking.com`);
            icsContent.push(`DTSTAMP:${nowUtc}`);
            icsContent.push(`DTSTART:${start}`);
            icsContent.push(`DTEND:${end}`);
            icsContent.push(`SUMMARY:${escapeICS(summary)}`);
            icsContent.push(`DESCRIPTION:${escapeICS(description)}`);
            icsContent.push(`LOCATION:${escapeICS(location)}`);
            icsContent.push(`STATUS:CONFIRMED`);
            icsContent.push('END:VEVENT');
          }
        }
      }

      icsContent.push('END:VCALENDAR');

      return new Response(icsContent.join('\r\n'), {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'attachment; filename="kevin-teaching-calendar.ics"',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // Default: Return JSON structured events for Admin Calendar view
    return NextResponse.json({
      success: true,
      data: {
        confirmedCount: activeBookings.length,
        pendingCount: pendingBookings.length,
        bookings: bookings.map(b => ({
          id: b.id,
          classId: b.classId,
          classTitle: b.classTitle,
          classType: b.classType,
          date: b.date,
          timeSlot: b.timeSlot,
          userName: b.userName,
          userEmail: b.userEmail,
          userPhone: b.userPhone,
          amount: b.amount,
          status: b.bookingStatus,
          onlineMeetingUrl: b.onlineMeetingUrl,
          createdAt: b.createdAt
        })),
        classes: classes.map(c => ({
          id: c.id,
          title: c.title,
          type: c.type,
          availableDates: c.availableDates || [],
          timeSlots: c.timeSlots || []
        }))
      }
    });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED' || error?.message?.includes('bail out of prerendering')) {
      throw error;
    }
    console.error('Admin Calendar API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
