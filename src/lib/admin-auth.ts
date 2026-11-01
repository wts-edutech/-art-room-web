import { getDb } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './password-validator';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const DEFAULT_TEACHING_ADMIN_PASSWORD = 'teach1234';

export interface AdminRoleResult {
  isValid: boolean;
  role?: 'super_admin' | 'teaching_admin';
}

/**
 * Verifies admin password and determines whether they are Super Admin or Teaching Admin.
 * Checks Super Admin password first (D1 'admin_password_hash' or 'admin1234' / 'K1234').
 * Then checks Teaching Admin password (D1 'teaching_admin_password_hash' or default 'teach1234').
 */
export async function verifyAdminPasswordWithRole(password: string): Promise<AdminRoleResult> {
  const clean = String(password || '').trim();
  if (!clean) return { isValid: false };

  const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  // 1. Super Admin Master Rescue: always accept 'admin1234' or 'K1234' and auto-sync DB
  if (clean === defaultAdminPassword || clean.toLowerCase() === 'admin1234' || clean.toUpperCase() === 'K1234') {
    try {
      await updateAdminPassword('admin1234');
    } catch {}
    return { isValid: true, role: 'super_admin' };
  }

  // 2. Check Super Admin Custom Password from DB
  try {
    const db = getDb();
    const row = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'admin_password_hash'))
      .get();

    if (row && row.value) {
      const hashedInput = await hashPassword(clean);
      if (hashedInput === row.value || clean === row.value) {
        return { isValid: true, role: 'super_admin' };
      }
    }
  } catch (err) {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
        const stmt = env.DB.prepare("SELECT value FROM site_settings WHERE key = 'admin_password_hash'");
        const res: any = await stmt.first();
        if (res && res.value) {
          const hashedInput = await hashPassword(clean);
          if (hashedInput === res.value || clean === res.value) {
            return { isValid: true, role: 'super_admin' };
          }
        }
      }
    } catch {}
  }

  // 3. Check Teaching Admin Custom Password from DB
  try {
    const db = getDb();
    const rowTeach = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'teaching_admin_password_hash'))
      .get();

    if (rowTeach && rowTeach.value) {
      const hashedInput = await hashPassword(clean);
      if (hashedInput === rowTeach.value || clean === rowTeach.value) {
        return { isValid: true, role: 'teaching_admin' };
      }
    } else {
      if (clean === DEFAULT_TEACHING_ADMIN_PASSWORD || clean.toLowerCase() === 'teach1234') {
        return { isValid: true, role: 'teaching_admin' };
      }
    }
  } catch (err) {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        const stmt = env.DB.prepare("SELECT value FROM site_settings WHERE key = 'teaching_admin_password_hash'");
        const res: any = await stmt.first();
        if (res && res.value) {
          const hashedInput = await hashPassword(clean);
          if (hashedInput === res.value || clean === res.value) {
            return { isValid: true, role: 'teaching_admin' };
          }
        } else {
          if (clean === DEFAULT_TEACHING_ADMIN_PASSWORD || clean.toLowerCase() === 'teach1234') {
            return { isValid: true, role: 'teaching_admin' };
          }
        }
      }
    } catch {}
  }

  // Fallback for Teaching Admin default if DB was clean
  if (clean === DEFAULT_TEACHING_ADMIN_PASSWORD || clean.toLowerCase() === 'teach1234') {
    return { isValid: true, role: 'teaching_admin' };
  }

  return { isValid: false };
}

/**
 * Verifies admin password (returns boolean for backward compatibility).
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const result = await verifyAdminPasswordWithRole(password);
  return result.isValid;
}

/**
 * Get the current admin password in plaintext for display.
 * Returns the stored plaintext or the default password.
 */
export async function getAdminPasswordPlain(): Promise<string> {
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  try {
    const db = getDb();
    const row = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'admin_password_plain'))
      .get();

    if (row && row.value) {
      return row.value;
    }
  } catch {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        const res: any = await env.DB.prepare(
          "SELECT value FROM site_settings WHERE key = 'admin_password_plain'"
        ).first();
        if (res && res.value) {
          return res.value;
        }
      }
    } catch {}
  }

  return defaultAdminPassword;
}

/**
 * Updates admin password in D1 site_settings.
 * Saves both the hash (for verification) and plaintext (for admin display).
 */
export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  const hashed = await hashPassword(newPassword);
  const now = new Date().toISOString();

  // Try via Drizzle
  try {
    const db = getDb();

    // Save hash for verification
    await db
      .insert(siteSettings)
      .values({
        key: 'admin_password_hash',
        value: hashed,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: hashed, updatedAt: now },
      });

    // Save plaintext for admin display
    await db
      .insert(siteSettings)
      .values({
        key: 'admin_password_plain',
        value: newPassword,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: newPassword, updatedAt: now },
      });

    return true;
  } catch (err) {
    // Fallback to raw D1 execution
    const env = getRequestContext()?.env;
    if (env?.DB) {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      await env.DB.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('admin_password_hash', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(hashed, now).run();

      await env.DB.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('admin_password_plain', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(newPassword, now).run();

      return true;
    }
    throw err;
  }
}

/**
 * Get current Teaching Admin password in plaintext for Super Admin display.
 */
export async function getTeachingAdminPasswordPlain(): Promise<string> {
  try {
    const db = getDb();
    const row = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'teaching_admin_password_plain'))
      .get();

    if (row && row.value) {
      return row.value;
    }
  } catch {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        const res: any = await env.DB.prepare(
          "SELECT value FROM site_settings WHERE key = 'teaching_admin_password_plain'"
        ).first();
        if (res && res.value) {
          return res.value;
        }
      }
    } catch {}
  }

  return DEFAULT_TEACHING_ADMIN_PASSWORD;
}

/**
 * Updates Teaching Admin password in D1 site_settings.
 */
export async function updateTeachingAdminPassword(newPassword: string): Promise<boolean> {
  const clean = String(newPassword || '').trim();
  if (!clean || clean.length < 4) return false;

  const hashed = await hashPassword(clean);
  const now = new Date().toISOString();

  try {
    const db = getDb();

    await db
      .insert(siteSettings)
      .values({
        key: 'teaching_admin_password_hash',
        value: hashed,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: hashed, updatedAt: now },
      });

    await db
      .insert(siteSettings)
      .values({
        key: 'teaching_admin_password_plain',
        value: clean,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: clean, updatedAt: now },
      });

    return true;
  } catch (err) {
    const env = getRequestContext()?.env;
    if (env?.DB) {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      await env.DB.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('teaching_admin_password_hash', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(hashed, now).run();

      await env.DB.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('teaching_admin_password_plain', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(clean, now).run();

      return true;
    }
    throw err;
  }
}

const DEFAULT_MASTER_PIN = 'K1234';

/**
 * Verifies Master Admin PIN (e.g. 'K1234') for high-security actions.
 * Supports case-insensitivity for convenience (e.g., 'k1234' or 'K1234').
 */
export async function verifyMasterPin(pin: string): Promise<boolean> {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) return false;

  try {
    const db = getDb();
    const row = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'admin_master_pin_hash'))
      .get();

    if (row && row.value) {
      const hashedInput = await hashPassword(cleanPin);
      const hashedUpper = await hashPassword(cleanPin.toUpperCase());
      return hashedInput === row.value || hashedUpper === row.value || cleanPin === row.value || cleanPin.toUpperCase() === row.value.toUpperCase();
    }
  } catch (err) {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        const stmt = env.DB.prepare("SELECT value FROM site_settings WHERE key = 'admin_master_pin_hash'");
        const res: any = await stmt.first();
        if (res && res.value) {
          const hashedInput = await hashPassword(cleanPin);
          const hashedUpper = await hashPassword(cleanPin.toUpperCase());
          return hashedInput === res.value || hashedUpper === res.value || cleanPin === res.value || cleanPin.toUpperCase() === res.value.toUpperCase();
        }
      }
    } catch {}
  }

  // Fallback to default K1234 (allow case-insensitive 'k1234' or 'K1234')
  return cleanPin.toUpperCase() === DEFAULT_MASTER_PIN.toUpperCase();
}

/**
 * Get the current Master PIN in plaintext for display to the master admin.
 */
export async function getMasterPinPlain(): Promise<string> {
  try {
    const db = getDb();
    const row = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'admin_master_pin_plain'))
      .get();

    if (row && row.value) {
      return row.value;
    }
  } catch {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        const res: any = await env.DB.prepare(
          "SELECT value FROM site_settings WHERE key = 'admin_master_pin_plain'"
        ).first();
        if (res && res.value) {
          return res.value;
        }
      }
    } catch {}
  }

  return DEFAULT_MASTER_PIN;
}

/**
 * Updates Master Admin PIN in D1 site_settings.
 */
export async function updateMasterPin(newPin: string): Promise<boolean> {
  const cleanPin = String(newPin || '').trim();
  if (!cleanPin || cleanPin.length < 4) return false;

  const hashed = await hashPassword(cleanPin);
  const now = new Date().toISOString();

  try {
    const db = getDb();

    await db
      .insert(siteSettings)
      .values({
        key: 'admin_master_pin_hash',
        value: hashed,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: hashed, updatedAt: now },
      });

    await db
      .insert(siteSettings)
      .values({
        key: 'admin_master_pin_plain',
        value: cleanPin,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: cleanPin, updatedAt: now },
      });

    return true;
  } catch (err) {
    const env = getRequestContext()?.env;
    if (env?.DB) {
      await env.DB.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('admin_master_pin_hash', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(hashed, now).run();

      await env.DB.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('admin_master_pin_plain', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(cleanPin, now).run();

      return true;
    }
    throw err;
  }
}
