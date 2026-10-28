export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { visitors } from '@/db/schema';
import { eq } from 'drizzle-orm';

function getBangkokDateStr(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch (e) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

export async function GET() {
  try {
    const db = getDb();
    const todayStr = getBangkokDateStr();

    const all = await db.select().from(visitors);
    let total = 0;
    let todayCount = 0;
    const daily: Record<string, number> = {};
    
    for (const v of all) {
      total += v.count;
      daily[v.date] = v.count;
      if (v.date === todayStr) {
        todayCount = v.count;
      }
    }

    return NextResponse.json({
      total,
      today: todayCount,
      daily,
      date: todayStr
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const db = getDb();
    const todayStr = getBangkokDateStr();

    const existing = await db.select().from(visitors).where(eq(visitors.date, todayStr)).get();
    
    if (existing) {
      await db.update(visitors).set({ count: existing.count + 1 }).where(eq(visitors.date, todayStr));
    } else {
      await db.insert(visitors).values({ date: todayStr, count: 1 });
    }

    return NextResponse.json({ success: true, date: todayStr });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();
    const todayStr = getBangkokDateStr();

    // 1. Update today's count
    if (typeof body.today === 'number') {
      const targetCount = Math.max(0, Math.floor(body.today));
      const targetDate = body.date || todayStr;
      const existing = await db.select().from(visitors).where(eq(visitors.date, targetDate)).get();

      if (existing) {
        await db.update(visitors).set({ count: targetCount }).where(eq(visitors.date, targetDate));
      } else {
        await db.insert(visitors).values({ date: targetDate, count: targetCount });
      }
    }

    // 2. Adjust total count if requested (adjust via baseline offset row)
    if (typeof body.total === 'number') {
      const targetTotal = Math.max(0, Math.floor(body.total));
      const allRows = await db.select().from(visitors);
      
      // Calculate sum without baseline
      const nonBaseSum = allRows
        .filter(r => r.date !== 'baseline_offset')
        .reduce((sum, r) => sum + r.count, 0);

      const neededOffset = targetTotal - nonBaseSum;
      const existingOffset = allRows.find(r => r.date === 'baseline_offset');

      if (existingOffset) {
        await db.update(visitors).set({ count: neededOffset }).where(eq(visitors.date, 'baseline_offset'));
      } else if (neededOffset !== 0) {
        await db.insert(visitors).values({ date: 'baseline_offset', count: neededOffset });
      }
    }

    // Return the updated values
    const all = await db.select().from(visitors);
    let total = 0;
    let todayCount = 0;
    const daily: Record<string, number> = {};

    for (const v of all) {
      total += v.count;
      daily[v.date] = v.count;
      if (v.date === todayStr) {
        todayCount = v.count;
      }
    }

    return NextResponse.json({
      success: true,
      total: Math.max(0, total),
      today: todayCount,
      daily,
      date: todayStr
    });
  } catch (error) {
    console.error("Failed to update visitor stats:", error);
    return NextResponse.json({ error: 'Failed to update visitor stats' }, { status: 500 });
  }
}