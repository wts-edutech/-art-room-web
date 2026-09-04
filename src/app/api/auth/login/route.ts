export const runtime = 'edge';

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

    const expectedPassword = `${studentId}@wts`;
    if (password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const db = getDb();
    const student = await db.select().from(students).where(eq(students.id, studentId)).get();
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const token = await createSessionToken(student.id, student.name, 'student', 72);

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

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}