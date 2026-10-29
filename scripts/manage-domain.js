const https = require('https');
const fs = require('fs');
const path = require('path');

const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const content = fs.readFileSync(tomlPath, 'utf8');
const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
const token = match ? match[1] : '';
const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';

function apiRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = https.request({
      hostname: 'api.cloudflare.com',
      port: 443,
      path: `/client/v4/accounts/${ACCOUNT_ID}${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function addDomain(domainName) {
  console.log(`Adding ${domainName} to Pages project ${PROJECT_NAME}...`);
  const res = await apiRequest('POST', `/pages/projects/${PROJECT_NAME}/domains`, { name: domainName });
  console.log(`Result for ${domainName}:`, JSON.stringify(res, null, 2));
}

async function main() {
  await addDomain('artroom-wts.com');
  await addDomain('www.artroom-wts.com');
}

main().catch(console.error);
