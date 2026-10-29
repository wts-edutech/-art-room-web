const https = require('https');
const fs = require('fs');
const path = require('path');

const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(tomlPath, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';

function get(endpoint) {
  return new Promise((resolve) => {
    https.get(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
  });
}

async function main() {
  const d = await get(`/pages/projects/${PROJECT_NAME}/domains/artroom-wts.com`);
  console.log('Domain Detail:', JSON.stringify(d, null, 2));
}

main().catch(console.error);
