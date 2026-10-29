const https = require('https');
const fs = require('fs');
const path = require('path');

function getToken() {
  try {
    const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
    const toml = fs.readFileSync(tomlPath, 'utf8');
    const match = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match) return match[1];
  } catch (e) {}
  return 'cfoat_DdSPWqKerQVlcjGbHJXxsYGRbsnzaylJDlD_QyBmWhk.J5nUl6_7LO5PO3ejkwv9ZxD1vc7g-jr71Ox_pNaY2u8';
}

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const TOKEN = getToken();

const req = https.request({
  hostname: 'api.cloudflare.com',
  path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
}, res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    try {
      const p = JSON.parse(b);
      console.log('Build config:', JSON.stringify(p.result?.build_config, null, 2));
      console.log('Source:', JSON.stringify(p.result?.source, null, 2));
      console.log('Subdomain:', p.result?.subdomain);
      console.log('Canonical:', p.result?.canonical_deployment?.url);
    } catch (e) {
      console.log(b);
    }
  });
});
req.end();
