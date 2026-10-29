const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/0556a19f81600ae78fe4c90977010cc42277c2f78fbd752c2457c7e85abfd0f6.sqlite');

try {
  const db = new DatabaseSync(dbPath);
  
  // 1. activities table
  try { db.prepare(`ALTER TABLE activities ADD COLUMN certificate_url TEXT`).run(); console.log('Added activities.certificate_url'); } catch (e) { console.log('activities.certificate_url note:', e.message); }
  try { db.prepare(`ALTER TABLE activities ADD COLUMN certificateUrl TEXT`).run(); console.log('Added activities.certificateUrl'); } catch (e) { console.log('activities.certificateUrl note:', e.message); }

  // 2. teachers table
  try { db.prepare(`ALTER TABLE teachers ADD COLUMN innovations TEXT`).run(); console.log('Added teachers.innovations'); } catch (e) { console.log('teachers.innovations note:', e.message); }

  // 3. awards table
  try { db.prepare(`ALTER TABLE awards ADD COLUMN certificate_url TEXT`).run(); console.log('Added awards.certificate_url'); } catch (e) { console.log('awards.certificate_url note:', e.message); }

  console.log('Migration completed successfully.');
} catch (err) {
  console.error('Migration error:', err);
}
