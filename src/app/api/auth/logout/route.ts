export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');

  const { searchParams } = new URL(request.url);
  if (searchParams.get('admin') === 'true') {
    cookieStore.delete('admin_token');
  }

  return NextResponse.json({ success: true });
}
