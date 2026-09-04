const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function getBaseApiCode(tableName, hasDate = true, hasImage = true) {
  return `
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { ${tableName} } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const db = getDb();
    const all = await db.select().from(${tableName})${hasDate ? `.orderBy(desc(${tableName}.createdAt))` : ''};
    return NextResponse.json(all);
  } catch (error) {
    console.error("GET /api/${tableName} error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const db = getDb();
    const newEntry: any = { id: Date.now().toString() };
    
    // Parse form data dynamically
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const bytes = await value.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        newEntry[key === 'image' || key === 'coverImage' ? (key === 'coverImage' ? 'coverImageUrl' : 'imageUrl') : key] = \`data:\${value.type};base64,\${base64}\`;
      } else if (typeof value === 'string' && key !== 'image' && key !== 'coverImage') {
        newEntry[key] = value;
      }
    }
    
    ${hasDate ? "if (!newEntry.createdAt) newEntry.createdAt = new Date().toISOString();" : ""}
    
    await db.insert(${tableName}).values(newEntry as any);
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error("POST /api/${tableName} error:", error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const db = getDb();
    await db.delete(${tableName}).where(eq(${tableName}.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/${tableName} error:", error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
`;
}

// Map endpoints to table names
const mappings = {
  'activities': 'activities',
  'artworks': 'artworks',
  'awards': 'awards',
  'news': 'news',
  'testimonials': 'testimonials',
  'ideas': 'ideas',
  'students': 'students'
};

for (const [folder, table] of Object.entries(mappings)) {
  const routePath = path.join(apiDir, folder, 'route.ts');
  if (fs.existsSync(routePath)) {
    fs.writeFileSync(routePath, getBaseApiCode(table).trim(), 'utf8');
    console.log(`Rewrote ${folder}/route.ts`);
  }
}
