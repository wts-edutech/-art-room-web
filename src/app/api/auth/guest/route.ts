export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { guests } from '@/db/schema';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const guestIdentifier = (body.guestName || body.emailOrProvider || body.email || 'บุคคลทั่วไป').toString().trim();

    const db = getDb();
    const guestId = `guest_${Date.now()}`;
    
    try {
      await db.insert(guests).values({
        id: guestId,
        name: guestIdentifier,
      });
    } catch (dbErr) {
      console.warn('Guest insert DB note:', dbErr);
    }

    const token = await createSessionToken(guestId, guestIdentifier, 'guest', 24);

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
        name: guestIdentifier,
        role: 'guest'
      }
    });

  } catch (error: any) {
    console.error('Guest login error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}