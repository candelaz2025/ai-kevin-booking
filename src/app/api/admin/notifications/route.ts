import { NextResponse } from 'next/server';
import { getNotifications, markNotificationsAsRead } from '@/lib/store';

export async function GET() {
  const notifications = await getNotifications();
  return NextResponse.json({ success: true, data: notifications });
}

export async function POST() {
  await markNotificationsAsRead();
  return NextResponse.json({ success: true, message: 'All notifications marked as read' });
}
