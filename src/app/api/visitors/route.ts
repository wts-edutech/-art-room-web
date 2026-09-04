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
    const todayStr = `${yyyy}-${mm}-${dd}`;

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
    const todayStr = `${yyyy}-${mm}-${dd}`;

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