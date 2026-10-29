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
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); } catch(e) { resolve({ status: res.statusCode, body: b }); }
      });
    });
    req.end();
  });
}

async function main() {
  const workerDomains = await api('GET', `/client/v4/accounts/${ACCOUNT_ID}/workers/services/${PROJECT_NAME}/environments/production/custom_domains`);
  console.log('Worker Custom Domains:', JSON.stringify(workerDomains, null, 2));

  // If there are domains attached to Worker, delete them so Pages takes over!
  const list = workerDomains.data?.result || [];
  if (Array.isArray(list)) {
    for (const d of list) {
      console.log(`Deleting ${d.hostname} (${d.id}) from Worker...`);
      const delRes = await api('DELETE', `/client/v4/accounts/${ACCOUNT_ID}/workers/services/${PROJECT_NAME}/environments/production/custom_domains/${d.id}`);
      console.log('Delete result:', JSON.stringify(delRes, null, 2));
    }
  }

  // Also purge cache
  console.log('Checking Pages status...');
  const pagesDomains = await api('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/domains`);
  console.log('Pages Domains:', JSON.stringify(pagesDomains.data?.result?.map(d => ({ name: d.name, status: d.status, verification: d.verification_data })), null, 2));
}

main().catch(console.error);
