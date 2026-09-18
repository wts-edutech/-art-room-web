/**
 * Password validation and hashing utility for ART ROOM
 * Strict requirement:
 * 1. At least 8 characters long
 * 2. At least one uppercase letter (A-Z)
 * 3. At least one lowercase letter (a-z)
 * 4. At least one numeric digit (0-9)
 */

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const p = String(password || '');
  const hasMinLength = p.length >= 8;
  const hasUpper = /[A-Z]/.test(p);
  const hasLower = /[a-z]/.test(p);
  const hasNumber = /[0-9]/.test(p);

  const errors: string[] = [];
  if (!hasMinLength) {
    errors.push('รหัสผ่านต้องมีความยาวไม่ต่ำกว่า 8 ตัวอักษร');
  }
  if (!hasUpper) {
    errors.push('ต้องมีตัวอักษรพิมพ์ใหญ่ภาษาอังกฤษ (A-Z) อย่างน้อย 1 ตัว');
  }
  if (!hasLower) {
    errors.push('ต้องมีตัวอักษรพิมพ์เล็กภาษาอังกฤษ (a-z) อย่างน้อย 1 ตัว');
  }
  if (!hasNumber) {
    errors.push('ต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัว');
  }

  return {
    isValid: hasMinLength && hasUpper && hasLower && hasNumber,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    errors,
  };
}

/**
 * Deterministic SHA-256 hashing for student passwords using native Web Crypto API
 * Works across both Edge Runtime and Node.js
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${password}_wts_salt_2026`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
