const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/0556a19f81600ae78fe4c90977010cc42277c2f78fbd752c2457c7e85abfd0f6.sqlite');
const outDir = path.resolve('data');
const uploadsDir = path.resolve('public/uploads');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const db = new DatabaseSync(dbPath);
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'").all();

let schemaSql = [];
let dataSql = [];
let extractedCount = 0;

function handleBase64(val, tableName, rowId, colName) {
  if (typeof val !== 'string') return val;

  // Case 1: Pure data URL
  if (val.startsWith('data:image/') && val.length > 20000) {
    try {
      const match = val.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === 'jpeg' ? 'jpg' : match[1].replace('+xml', '');
        const buffer = Buffer.from(match[2], 'base64');
        const filename = `${tableName}_${rowId || Date.now()}_${colName}.${ext}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const targetSubdir = path.join(uploadsDir, tableName);
        if (!fs.existsSync(targetSubdir)) fs.mkdirSync(targetSubdir, { recursive: true });
        fs.writeFileSync(path.join(targetSubdir, filename), buffer);
        extractedCount++;
        return `/uploads/${tableName}/${filename}`;
      }
    } catch (err) {
      console.warn('Failed to extract base64:', err);
    }
  }

  // Case 2: JSON string or HTML containing data:image/
  if (val.includes('data:image/') && val.length > 20000) {
    let index = 0;
    return val.replace(/data:image\/([a-zA-Z0-9+]+);base64,([A-Za-z0-9+/=]+)/g, (fullMatch, imgType, b64Data) => {
      try {
        if (b64Data.length < 5000) return fullMatch; // small icons stay
        const ext = imgType === 'jpeg' ? 'jpg' : imgType.replace('+xml', '');
        const buffer = Buffer.from(b64Data, 'base64');
        const filename = `${tableName}_${rowId || Date.now()}_${colName}_${++index}.${ext}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const targetSubdir = path.join(uploadsDir, tableName);
        if (!fs.existsSync(targetSubdir)) fs.mkdirSync(targetSubdir, { recursive: true });
        fs.writeFileSync(path.join(targetSubdir, filename), buffer);
        extractedCount++;
        return `/uploads/${tableName}/${filename}`;
      } catch {
        return fullMatch;
      }
    });
  }

  return val;
}

function escapeVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

for (const t of tables) {
  schemaSql.push(`DROP TABLE IF EXISTS "${t.name}";`);
  schemaSql.push(`CREATE TABLE "${t.name}" ${t.sql.substring(t.sql.indexOf('('))};`);
  
  const rows = db.prepare(`SELECT * FROM "${t.name}"`).all();
  if (rows.length > 0) {
    const cols = Object.keys(rows[0]);
    const colList = cols.map(c => `"${c}"`).join(', ');
    
    for (const r of rows) {
      const processedVals = cols.map(c => {
        const val = handleBase64(r[c], t.name, r.id, c);
        return escapeVal(val);
      });
      const stmt = `INSERT OR REPLACE INTO "${t.name}" (${colList}) VALUES (${processedVals.join(', ')});`;
      if (stmt.length > 100000) {
        console.warn(`Still large: statement for table ${t.name} is ${stmt.length} bytes`);
      }
      dataSql.push(stmt);
    }
  }
}

const fullSchema = schemaSql.join('\n\n');
fs.writeFileSync(path.join(outDir, 'd1_schema.sql'), fullSchema, 'utf8');

const fullData = dataSql.join('\n');
fs.writeFileSync(path.join(outDir, 'd1_data.sql'), fullData, 'utf8');

console.log(`Extracted ${extractedCount} large base64 images into public/uploads/`);
console.log(`Generated schema with ${tables.length} tables to data/d1_schema.sql`);
console.log(`Generated data inserts to data/d1_data.sql (${(fullData.length / 1024 / 1024).toFixed(2)} MB, ${dataSql.length} statements)`);
