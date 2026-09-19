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
 * Updates admin password in D1 site_settings.
 */
export async function updateAdminPassword(newPassword: string): Promise<boolean> {
  const hashed = await hashPassword(newPassword);
  const now = new Date().toISOString();

  // Try via Drizzle
  try {
    const db = getDb();
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
      return true;
    }
    throw err;
  }
}
