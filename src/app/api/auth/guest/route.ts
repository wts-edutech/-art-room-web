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
    
    // Parse stored data to extract real name, email, role, and phone
    const formatted = (all || []).map((g) => {
      let parsed = {
        name: g.name,
        email: '-',
        role: 'บุคคลทั่วไป',
        phone: '-',
        provider: 'Email'
      };

      try {
        if (g.name.startsWith('{')) {
          const obj = JSON.parse(g.name);
          parsed = { ...parsed, ...obj };
        } else if (g.name.includes('|')) {
          const parts = g.name.split('|').map(s => s.trim());
          parsed.name = parts[0] || g.name;
          parsed.email = parts[1] || '-';
          parsed.role = parts[2] || 'บุคคลทั่วไป';
          parsed.phone = parts[3] || '-';
        } else if (g.name.includes('@')) {
          parsed.email = g.name;
          parsed.name = g.name.split('@')[0];
        }
      } catch {
        parsed.name = g.name;
      }

      return {
        id: g.id,
        name: parsed.name || 'ผู้เข้าชม',
        email: parsed.email || '-',
        role: parsed.role || 'บุคคลทั่วไป',
        phone: parsed.phone || '-',
        provider: parsed.provider || 'Email',
        createdAt: g.createdAt || new Date().toISOString()
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/auth/guest error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    
    const email = String(body.email || body.emailOrProvider || '').trim();
    const name = String(body.name || body.guestName || email.split('@')[0] || 'ผู้เข้าชม').trim();
    const role = String(body.role || 'บุคคลทั่วไป').trim();
    const phone = String(body.phone || '').trim();
    const provider = String(body.provider || 'Email').trim();

    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'กรุณาระบุอีเมลที่ถูกต้อง (เช่น yourname@gmail.com)' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อ-นามสกุลของคุณ' }, { status: 400 });
    }

    const db = getDb();
    const guestId = `guest_${Date.now()}`;
    
    // Encode metadata as JSON inside name column to maintain 100% compatibility with existing D1 schema
    const storedNamePayload = JSON.stringify({
      name,
      email,
      role,
      phone,
      provider
    });

    try {
      await db.insert(guests).values({
        id: guestId,
        name: storedNamePayload,
        createdAt: new Date().toISOString()
      });
    } catch (dbErr) {
      console.warn('Guest insert DB note:', dbErr);
    }

    // Create session token with real name and role
    const token = await createSessionToken(guestId, name, 'guest', 24);

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
        name,
        email,
        role: 'guest',
        userRole: role
      }
    });

  } catch (error: any) {
    console.error('Guest login error:', error);
    return NextResponse.json({ error: error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
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