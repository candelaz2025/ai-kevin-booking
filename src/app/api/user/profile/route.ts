import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || '',
      image: user.image || '',
      role: user.role || 'user',
      provider: user.provider || 'credentials',
      createdAt: user.createdAt,
      rewards: user.rewards
    }
  });
}

export async function PATCH(req: Request) {
  try {
    const { email, name, phone, bio, image, rewards } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await getUserByEmail(cleanEmail);

    if (!existing) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const updated = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      phone: phone !== undefined ? phone : existing.phone,
      bio: bio !== undefined ? bio : existing.bio,
      image: image !== undefined ? image : existing.image,
      rewards: rewards !== undefined ? rewards : existing.rewards
    };

    await saveUser(updated);

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        bio: updated.bio || '',
        image: updated.image || '',
        role: updated.role || 'user',
        provider: updated.provider || 'credentials',
        createdAt: updated.createdAt,
        rewards: updated.rewards
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
