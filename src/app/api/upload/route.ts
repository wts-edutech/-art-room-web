export const runtime = 'edge';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลไฟล์ที่ส่งมา' }, { status: 400 });
    }

    const file = (formData.get('file') || formData.get('image') || formData.get('upload')) as File | null;
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeDisplay = file.size >= 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
      fileSize: sizeDisplay,
      fileType: mimeType,
    });
  } catch (error: any) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json({ error: error?.message || 'อัปโหลดไฟล์ไม่สำเร็จ' }, { status: 500 });
  }
}
