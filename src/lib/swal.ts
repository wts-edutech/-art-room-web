'use client';

import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

export { Swal };

function inferIcon(message: string): SweetAlertIcon {
  const m = message.trim();
  if (
    m.startsWith('✅') ||
    m.startsWith('🎉') ||
    m.includes('สำเร็จ') ||
    m.includes('เรียบร้อย') ||
    m.includes('บันทึกข้อมูลแล้ว') ||
    m.includes('คัดลอก')
  ) {
    // Make sure it's not "ไม่สำเร็จ"
    if (!m.includes('ไม่สำเร็จ') && !m.includes('ล้มเหลว') && !m.includes('ผิดพลาด')) {
      return 'success';
    }
  }
  if (
    m.startsWith('❌') ||
    m.startsWith('🚨') ||
    m.includes('ไม่สำเร็จ') ||
    m.includes('ล้มเหลว') ||
    m.includes('ผิดพลาด') ||
    m.includes('ไม่สามารถ') ||
    m.includes('ถูกเตะออกจากระบบ') ||
    /\b(error|failed)\b/i.test(m)
  ) {
    return 'error';
  }
  if (
    m.startsWith('⚠️') ||
    m.includes('กรุณา') ||
    m.includes('โปรด') ||
    m.includes('ต้องระบุ') ||
    m.includes('ไม่พบ') ||
    m.includes('คำเตือน') ||
    m.includes('ระวัง') ||
    m.includes('จำกัด') ||
    m.includes('ไม่ถูกต้อง') ||
    m.includes('ไม่ตรงกัน') ||
    m.includes('ครบกำหนด') ||
    m.includes('ห้าม')
  ) {
    return 'warning';
  }
  return 'info';
}

function stripLeadingEmoji(str: string): string {
  return str.replace(/^(?:✅|❌|⚠️|🚨|🎉|ℹ️|💡|📌|🔒|🔓)\s*/u, '').trim();
}

function defaultTitleForIcon(icon: SweetAlertIcon): string {
  switch (icon) {
    case 'success':
      return 'สำเร็จ!';
    case 'error':
      return 'เกิดข้อผิดพลาด';
    case 'warning':
      return 'แจ้งเตือน';
    case 'question':
      return 'ยืนยันการดำเนินการ';
    default:
      return 'แจ้งเพื่อทราบ';
  }
}

/**
 * Smart SweetAlert2 replacement for native browser `alert(message)`.
 * Automatically detects icon type (success/error/warning/info), formats multi-line text,
 * and uses Toast for quick copy/clipboard actions vs Center Modal for standard alerts.
 */
export async function swalAlert(
  message: string,
  customIcon?: SweetAlertIcon,
  extraOptions?: SweetAlertOptions
) {
  const raw = String(message ?? '').trim();
  const icon = customIcon || inferIcon(raw);
  const cleaned = stripLeadingEmoji(raw);

  // Hybrid behavior: quick clipboard copy notifications use non-intrusive Toast
  const isQuickCopy =
    icon === 'success' &&
    (cleaned.startsWith('คัดลอก') || cleaned.includes('คัดลอกลิงก์') || cleaned.includes('คัดลอกข้อความ')) &&
    cleaned.length < 90 &&
    !cleaned.includes('\n');

  if (isQuickCopy && !extraOptions) {
    return swalToast(cleaned, 'success');
  }

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  let title = '';
  let text = '';

  if (lines.length > 1) {
    title = stripLeadingEmoji(lines[0]);
    text = lines.slice(1).join('\n');
    if (title.length > 60) {
      text = cleaned;
      title = defaultTitleForIcon(icon);
    }
  } else {
    const single = lines[0] || cleaned;
    if (single.length <= 50) {
      title = single;
    } else {
      title = defaultTitleForIcon(icon);
      text = single;
    }
  }

  return Swal.fire({
    icon,
    title,
    text: text || undefined,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#3085d6',
    ...(icon === 'success' && !text && !extraOptions?.timer
      ? { timer: 2000, timerProgressBar: true }
      : {}),
    ...extraOptions,
  });
}

/**
 * Smart SweetAlert2 replacement for native browser `confirm(message)`.
 * Returns Promise<boolean> (`true` if confirmed, `false` if cancelled/dismissed).
 */
export async function swalConfirm(
  message: string,
  options?: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    icon?: SweetAlertIcon;
  }
): Promise<boolean> {
  const raw = String(message ?? '').trim();
  const cleaned = stripLeadingEmoji(raw);

  const isDelete = cleaned.includes('ลบ') || cleaned.includes('ล้าง');
  const isLogout = cleaned.includes('ออกจากระบบ') || cleaned.includes('เตะ');
  const isReset = cleaned.includes('คืนค่า') || cleaned.includes('รีเซ็ต') || cleaned.includes('แทนที่');
  const isDanger = options?.isDanger ?? (isDelete || isLogout || isReset);

  const icon: SweetAlertIcon = options?.icon || (isDanger ? 'warning' : 'question');

  let defaultConfirmText = 'ยืนยัน';
  if (isDelete) defaultConfirmText = 'ใช่, ลบเลย';
  else if (isLogout) defaultConfirmText = 'ออกจากระบบ';
  else if (cleaned.includes('ส่งข้อสอบ')) defaultConfirmText = 'ส่งข้อสอบ';
  else if (cleaned.includes('เข้าสู่ระบบ')) defaultConfirmText = 'ไปหน้าเข้าสู่ระบบ';

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  let title = options?.title || '';
  let text = '';

  if (!title) {
    if (lines.length > 1) {
      title = lines[0];
      text = lines.slice(1).join('\n');
      if (title.length > 55) {
        title = isDelete
          ? 'ยืนยันการลบข้อมูล?'
          : isLogout
          ? 'ยืนยันการออกจากระบบ?'
          : 'ยืนยันการดำเนินการ?';
        text = cleaned;
      }
    } else {
      const single = lines[0] || cleaned;
      if (single.length <= 50) {
        title = single;
      } else {
        title = isDelete
          ? 'ยืนยันการลบข้อมูล?'
          : isLogout
          ? 'ยืนยันการออกจากระบบ?'
          : 'ยืนยันการดำเนินการ?';
        text = single;
      }
    }
  } else {
    text = cleaned;
  }

  const result = await Swal.fire({
    icon,
    title,
    text: text || undefined,
    showCancelButton: true,
    confirmButtonColor: isDanger ? '#d33' : '#3085d6',
    cancelButtonColor: '#6e7881',
    confirmButtonText: options?.confirmText || defaultConfirmText,
    cancelButtonText: options?.cancelText || 'ยกเลิก',
    reverseButtons: true,
  });

  return Boolean(result.isConfirmed);
}

/**
 * Non-intrusive top-right Toast notification for frequent/quick actions
 * (e.g., copying links, liking posts, quick inline grade save).
 */
export function swalToast(
  title: string,
  icon: SweetAlertIcon = 'success',
  timer = 2200
) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: stripLeadingEmoji(title),
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
  });
}

export function swalSuccess(title: string, text?: string, timer?: number) {
  return Swal.fire({
    icon: 'success',
    title: stripLeadingEmoji(title),
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#3085d6',
    ...(timer ? { timer, timerProgressBar: true } : {}),
  });
}

export function swalError(title: string, text?: string) {
  return Swal.fire({
    icon: 'error',
    title: stripLeadingEmoji(title),
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#3085d6',
  });
}

export function swalWarning(title: string, text?: string) {
  return Swal.fire({
    icon: 'warning',
    title: stripLeadingEmoji(title),
    text,
    confirmButtonText: 'ตกลง',
    confirmButtonColor: '#3085d6',
  });
}
