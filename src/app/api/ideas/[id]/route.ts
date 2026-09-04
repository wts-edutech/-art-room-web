export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ideas } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { status } = await request.json();
    if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

    const db = getDb();
    await db.update(ideas).set({ status }).where(eq(ideas.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}