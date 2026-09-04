export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { guests } from '@/db/schema';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { guestName } = await request.json();

    if (!guestName || guestName.trim().length === 0) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const db = getDb();
    const guestId = `guest_${Date.now()}`;
    
    await db.insert(guests).values({
      id: guestId,
      name: guestName.trim(),
      createdAt: new Date().toISOString()
    });

    const token = await createSessionToken(guestId, guestName.trim(), 'guest', 24);

    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: guestId,
        name: guestName.trim(),
        role: 'guest'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}