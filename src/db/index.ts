import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// This is a placeholder for the D1 database binding.
// In Cloudflare Pages, the database is available via the environment variable (e.g. env.DB).
// But for local development in Next.js App Router, we will rely on next-on-pages getRequestContext()
import { getRequestContext } from '@cloudflare/next-on-pages';

export function getDb() {
  const env = getRequestContext().env;
  if (!env || !env.DB) {
    throw new Error('D1 Database binding not found. Please ensure you are running with next-on-pages or wrangler.');
  }
  return drizzle(env.DB, { schema });
}
