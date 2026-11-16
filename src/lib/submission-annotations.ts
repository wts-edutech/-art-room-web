// Helpers สำหรับภาพผลงานที่ครูเขียนตรวจ (annotated_images)
// เก็บเป็น JSON array ที่ index ตรงกับ images; ค่า '' หมายถึงภาพนั้นยังไม่มีการเขียนตรวจ

export function parseStringArray(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((x) => (typeof x === 'string' ? x : ''));
  if (typeof raw !== 'string') return [];
  let val: any = raw.trim();
  for (let i = 0; i < 5 && typeof val === 'string'; i++) {
    try {
      const next = JSON.parse(val);
      if (next === val) break;
      val = next;
    } catch {
      break;
    }
  }
  return Array.isArray(val) ? val.map((x: unknown) => (typeof x === 'string' ? x : '')) : [];
}

/** คืน array URL ของภาพที่ครูเขียนตรวจ (null = ไม่มี) ความยาวเท่ากับจำนวนภาพต้นฉบับ */
export function buildAnnotatedUrls(
  id: string,
  raw: unknown,
  imageCount: number,
  version?: string | null
): (string | null)[] {
  const list = parseStringArray(raw);
  if (list.length === 0 || imageCount === 0) return [];
  const v = encodeURIComponent(version || '0');
  const out: (string | null)[] = [];
  for (let i = 0; i < imageCount; i++) {
    out.push(list[i] ? `/api/submissions/image?id=${encodeURIComponent(id)}&index=${i}&annotated=1&v=${v}` : null);
  }
  return out.some(Boolean) ? out : [];
}

