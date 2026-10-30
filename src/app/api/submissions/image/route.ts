export const runtime = 'edge';

import { getDb } from '@/db';
import { submissions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const index = parseInt(searchParams.get('index') || '0', 10);

    if (!id) {
      return new Response('Missing submission id', { status: 400 });
    }

    const db = getDb();
    const sub = await db
      .select({ imageUrl: submissions.imageUrl, images: submissions.images })
      .from(submissions)
      .where(eq(submissions.id, id))
      .get();

    if (!sub) {
      return new Response('Submission not found', { status: 404 });
    }

    let targetImg: string | null = null;

    // Check images array first if index specified or present
    if (sub.images) {
      try {
        const parsed = typeof sub.images === 'string' ? JSON.parse(sub.images) : sub.images;
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (index >= 0 && index < parsed.length && parsed[index]) {
            targetImg = parsed[index];
          } else if (parsed[0]) {
            targetImg = parsed[0];
          }
        }
      } catch {}
    }

    // Fall back to primary imageUrl if not resolved from images array
    if (!targetImg) {
      targetImg = sub.imageUrl;
    }

    if (!targetImg) {
      return new Response('Image not found', { status: 404 });
    }

    // Handle data URL (e.g. data:image/webp;base64,... or data:image/jpeg;base64,...)
    if (targetImg.startsWith('data:')) {
      const match = targetImg.match(/^data:([^;]+);base64,(.+)$/s);
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
    return Response.redirect(targetImg, 302);
  } catch (error: any) {
    console.error('Error serving submission image:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}
