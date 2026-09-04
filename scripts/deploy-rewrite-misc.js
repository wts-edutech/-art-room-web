const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function getLoginApiCode() {
  return `
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { students } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { createSessionToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const expectedPassword = \`\${studentId}@wts\`;
    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const db = getDb();
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const token = createSessionToken(student.id, student.name, 'student', 72);

    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 72,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        role: 'student'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
`;
}

function getGuestApiCode() {
  return `
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
    const guestId = \`guest_\${Date.now()}\`;
    
    await db.insert(guests).values({
      id: guestId,
      name: guestName.trim(),
      createdAt: new Date().toISOString()
    });

    const token = createSessionToken(guestId, guestName.trim(), 'guest', 24);

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
`;
}

function getVisitorsApiCode() {
  return `
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { visitors } from '@/db/schema';
import { eq, sum } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    
    const today = new Date();
    // Adjust to local time if needed (simple approach: YYYY-MM-DD)
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = \`\${yyyy}-\${mm}-\${dd}\`;

    const all = await db.select().from(visitors);
    let total = 0;
    let todayCount = 0;
    
    for (const v of all) {
      total += v.count;
      if (v.date === todayStr) {
        todayCount = v.count;
      }
    }

    return NextResponse.json({
      total,
      today: todayCount
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const db = getDb();
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = \`\${yyyy}-\${mm}-\${dd}\`;

    const existing = await db.select().from(visitors).where(eq(visitors.date, todayStr)).get();
    
    if (existing) {
      // Because we don't have proper update() builder handy in this basic setup without full drizzle syntax, 
      // we can do delete/insert or generic sql. Let's do raw update:
      // wait, standard update:
      await db.update(visitors).set({ count: existing.count + 1 }).where(eq(visitors.date, todayStr));
    } else {
      await db.insert(visitors).values({ date: todayStr, count: 1 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
`;
}

fs.writeFileSync(path.join(apiDir, 'auth', 'login', 'route.ts'), getLoginApiCode().trim(), 'utf8');
fs.writeFileSync(path.join(apiDir, 'auth', 'guest', 'route.ts'), getGuestApiCode().trim(), 'utf8');
fs.writeFileSync(path.join(apiDir, 'visitors', 'route.ts'), getVisitorsApiCode().trim(), 'utf8');
console.log('Rewrote auth and visitors APIs');
