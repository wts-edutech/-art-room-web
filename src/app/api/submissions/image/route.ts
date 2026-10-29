export const runtime = 'edge';

import { getDb } from '@/db';
import { submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Missing submission id', { status: 400 });
    }

    const db = getDb();
    const sub = await db
      .select({ imageUrl: submissions.imageUrl })
      .from(submissions)
      .where(eq(submissions.id, id))
      .get();

    if (!sub || !sub.imageUrl) {
      return new Response('Image not found', { status: 404 });
    }

    // Handle data URL (e.g. data:image/jpeg;base64,...)
    if (sub.imageUrl.startsWith('data:')) {
      const match = sub.imageUrl.match(/^data:([^;]+);base64,(.+)$/s);
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
    return Response.redirect(sub.imageUrl, 302);
  } catch (error: any) {
    console.error('Error serving submission image:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}
