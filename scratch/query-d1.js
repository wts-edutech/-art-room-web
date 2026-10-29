const https = require('https');
const fs = require('fs');
const path = require('path');

const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const content = fs.readFileSync(tomlPath, 'utf8');
const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
const token = match ? match[1] : '';
const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const DB_ID = 'a6a5cb12-3c61-4927-9ba5-1ee7e9ce7e4b';

function query(sql, params = []) {
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
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  const res = await query('SELECT id, title, category, issuer, year, image_url FROM awards LIMIT 5');
  console.log(res);
}

run();
