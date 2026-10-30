export const runtime = 'edge';

import { getDb } from '@/db';
import { assignments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing assignment id', { status: 400 });
    }

    const db = getDb();
    const ass = await db
      .select({ imageUrl: assignments.imageUrl })
      .from(assignments)
      .where(eq(assignments.id, id))
      .get();

    if (!ass || !ass.imageUrl) {
      return new Response('Image not found', { status: 404 });
    }

    // Handle data URL (e.g. data:image/jpeg;base64,...)
    if (ass.imageUrl.startsWith('data:')) {
      const match = ass.imageUrl.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return new Response(bytes, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    // If it's an external HTTP URL, redirect
    return Response.redirect(ass.imageUrl, 302);
  } catch (error: any) {
    console.error('Error serving assignment image:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}

