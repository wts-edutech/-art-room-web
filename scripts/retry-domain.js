const https = require('https');
const fs = require('fs');
const path = require('path');

const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(tomlPath, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';

function api(method, path) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let b = '';
      res.on('data', chunk => b += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); } catch(e) { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.end();
  });
}

async function main() {
  await api('PATCH', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/domains/artroom-wts.com`);
  const d = await api('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/domains/artroom-wts.com`);
  console.log('Status of artroom-wts.com:', JSON.stringify(d.data?.result?.status));
  console.log('Verification data:', JSON.stringify(d.data?.result?.verification_data));
}

main().catch(console.error);
