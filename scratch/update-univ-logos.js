const https = require('https');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// 1. Read tokens for Cloudflare D1
const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const content = fs.readFileSync(tomlPath, 'utf8');
const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
const token = match ? match[1] : '';
const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const DB_ID = 'a6a5cb12-3c61-4927-9ba5-1ee7e9ce7e4b';

function queryRemote(sql, params = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sql, params });
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(b));
        } catch (e) {
          resolve(b);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  // Read clean base64 data URIs
  const chulaBase64 = 'data:image/png;base64,' + fs.readFileSync('public/images/universities/chula.png').toString('base64');
  const swuBase64 = 'data:image/png;base64,' + fs.readFileSync('public/images/universities/swu.png').toString('base64');

  console.log('Chula logo length:', chulaBase64.length);
  console.log('SWU logo length:', swuBase64.length);

  // 1. Update Cloudflare Remote D1
  console.log('Updating Cloudflare Remote D1...');
  // Chula records: พี่บอย (1793105004801), พี่พันซ์ (1793105109844), พี่เล (1793105242194)
  const res1 = await queryRemote('UPDATE testimonials SET univ_image_url = ? WHERE university LIKE ?', [chulaBase64, '%จุฬา%']);
  console.log('Remote CU update result:', res1.success);

  // SWU record: พี่ยูริกะ (1793105486939)
  const res2 = await queryRemote('UPDATE testimonials SET university = ?, univ_image_url = ? WHERE id = ?', ['คณะศิลปกรรมศาสตร์ สาขาศิลปศึกษา มหาวิทยาลัยศรีนครินทรวิโรฒ', swuBase64, '1793105486939']);
  console.log('Remote SWU update result:', res2.success);

  // 2. Update local SQLite DB
  const localDbPath = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/0556a19f81600ae78fe4c90977010cc42277c2f78fbd752c2457c7e85abfd0f6.sqlite');
  if (fs.existsSync(localDbPath)) {
    console.log('Updating Local SQLite DB...');
    const localDb = new DatabaseSync(localDbPath);
    localDb.prepare('UPDATE testimonials SET univ_image_url = ? WHERE university LIKE ?').run(chulaBase64, '%จุฬา%');
    localDb.prepare('UPDATE testimonials SET university = ?, univ_image_url = ? WHERE id = ?').run('คณะศิลปกรรมศาสตร์ สาขาศิลปศึกษา มหาวิทยาลัยศรีนครินทรวิโรฒ', swuBase64, '1793105486939');
    console.log('Local SQLite updated successfully.');
  }

  // 3. Verify
  const check = await queryRemote('SELECT id, name, university, length(univ_image_url) as logo_len FROM testimonials');
  console.log('Updated records:');
  console.log(JSON.stringify(check.result[0].results, null, 2));
}

run().catch(console.error);
