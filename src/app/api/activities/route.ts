export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { activities } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getRequestContext } from '@cloudflare/next-on-pages';

async function ensureColumns() {
  try {
    const ctx = getRequestContext();
    const d1 = ctx?.env?.DB;
    if (d1) {
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN time TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN location TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN category TEXT`).run(); } catch {}
      try { await d1.prepare(`ALTER TABLE activities ADD COLUMN color TEXT`).run(); } catch {}
    }
  } catch {}
}

export async function GET() {
  try {
    await ensureColumns();
    const db = getDb();
    const all = await db.select().from(activities).orderBy(desc(activities.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureColumns();
    const db = getDb();
    const contentType = request.headers.get('content-type') || '';
    
    // Support JSON payload for direct calendar note typing
    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.title || !body.date) {
        return NextResponse.json({ error: 'Title and Date are required' }, { status: 400 });
      }
      const newEntry = {
        id: body.id || Date.now().toString(),
        title: body.title,
        date: body.date,
        description: body.description || '',
        time: body.time || '',
        location: body.location || '',
        category: body.category || '',
        color: body.color || 'red',
        imageUrl: body.imageUrl || null,
        images: body.images ? (typeof body.images === 'string' ? body.images : JSON.stringify(body.images)) : null,
        createdAt: new Date().toISOString()
      };
      await db.insert(activities).values(newEntry as any);
      return NextResponse.json(newEntry, { status: 201 });
    }

    // Support FormData for multipart upload
    const formData = await request.formData();
    const newEntry: any = { 
      id: Date.now().toString(),
      time: (formData.get('time') as string) || '',
      location: (formData.get('location') as string) || '',
      category: (formData.get('category') as string) || '',
      color: (formData.get('color') as string) || 'red',
    };
    const images: string[] = [];
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const dataUrl = `data:${value.type};base64,${base64}`;
        
        if (key === 'images') {
          images.push(dataUrl);
        } else {
          newEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = dataUrl;
        }
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        if (key === 'images') {
          images.push(value);
        } else {
          newEntry[key] = value;
        }
      }
    }
    
    if (images.length > 0) {
      newEntry.images = JSON.stringify(images);
      if (!newEntry.imageUrl) {
        newEntry.imageUrl = images[0];
      }
    }
    
    if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();
    
    await db.insert(activities).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureColumns();
    const db = getDb();
    const contentType = request.headers.get('content-type') || '';

    // Support JSON payload
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const id = body.id;
      if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

      const updateEntry: any = {
        title: body.title,
        date: body.date,
        description: body.description ?? '',
        time: body.time ?? '',
        location: body.location ?? '',
        category: body.category ?? '',
        color: body.color ?? 'red',
      };
      if (body.imageUrl !== undefined) updateEntry.imageUrl = body.imageUrl;
      if (body.images !== undefined) {
        updateEntry.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images);
      }

      await db.update(activities).set(updateEntry).where(eq(activities.id, id));
      return NextResponse.json({ success: true, id, ...updateEntry }, { status: 200 });
    }

    // Support FormData
    const formData = await request.formData();
    const id = formData.get('id') as string;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const updateEntry: any = {
      time: (formData.get('time') as string) || '',
      location: (formData.get('location') as string) || '',
      category: (formData.get('category') as string) || '',
      color: (formData.get('color') as string) || 'red',
    };
    const images: string[] = [];
    
    const existingImagesRaw = formData.getAll('existingImages');
    existingImagesRaw.forEach(val => {
      if (typeof val === 'string' && val) images.push(val);
    });

    for (const [key, value] of formData.entries()) {
      if (key === 'id' || key === 'existingImages') continue;
      
      if (value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const dataUrl = `data:${value.type};base64,${base64}`;
        
        if (key === 'images') {
          images.push(dataUrl);
        } else {
          updateEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = dataUrl;
        }
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage' && value) {
        if (key === 'images') {
          images.push(value);
        } else {
          updateEntry[key] = value;
        }
      }
    }
    
    if (images.length > 0) {
      updateEntry.images = JSON.stringify(images);
      if (!updateEntry.imageUrl) {
        updateEntry.imageUrl = images[0];
      }
    }
    
    await db.update(activities).set(updateEntry as any).where(eq(activities.id, id));
    return NextResponse.json({ success: true, ...updateEntry }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(activities).where(eq(activities.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/activities error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}