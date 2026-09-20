import { getDb } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './password-validator';
import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Verifies admin password.
 * Checks D1 site_settings 'admin_password_hash' first.
 * If not set, checks process.env.ADMIN_PASSWORD || 'admin1234'.
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  // Check database first
  try {
    const db = getDb();
    const row = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, 'admin_password_hash'))
      .get();

    if (row && row.value) {
      const hashedInput = await hashPassword(password);
      return hashedInput === row.value || password === row.value;
    }
  } catch (err) {
    // If Drizzle call fails (e.g. table not yet created), try raw D1
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
          const hashedInput = await hashPassword(password);
          return hashedInput === res.value || password === res.value;
        }
      }
    } catch {}
  }

  // Fallback to default
  return password === defaultAdminPassword;
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

const DEFAULT_MASTER_PIN = 'K1234';

/**
 * Verifies Master Admin PIN (e.g. 'K1234') for high-security actions.
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
      return hashedInput === row.value || cleanPin === row.value;
    }
  } catch (err) {
    try {
      const env = getRequestContext()?.env;
      if (env?.DB) {
        const stmt = env.DB.prepare("SELECT value FROM site_settings WHERE key = 'admin_master_pin_hash'");
        const res: any = await stmt.first();
        if (res && res.value) {
          const hashedInput = await hashPassword(cleanPin);
          return hashedInput === res.value || cleanPin === res.value;
        }
      }
    } catch {}
  }

  // Fallback to default K1234
  return cleanPin === DEFAULT_MASTER_PIN;
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
