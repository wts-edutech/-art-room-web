export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { guests } from '@/db/schema';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/auth-utils';
import { checkIsAdmin } from '@/lib/api-auth';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(guests).orderBy(desc(guests.createdAt));
    return NextResponse.json(all || []);
  } catch (error) {
    console.error("GET /api/auth/guest error:", error);
    return NextResponse.json([]);
  }
}

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

export async function DELETE(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — สำหรับผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    const db = getDb();

    if (action === 'deleteAll') {
      await db.delete(guests);
      return NextResponse.json({ success: true, message: 'All guests deleted' });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.delete(guests).where(eq(guests.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/auth/guest error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}