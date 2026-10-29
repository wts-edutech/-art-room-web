const https = require('https');
const fs = require('fs');
const path = require('path');

const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const content = fs.readFileSync(tomlPath, 'utf8');
const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
const token = match ? match[1] : '';
const ZONE_ID = 'accebf3b3ae96f600b8b6a0e831282c4';

function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'Authorization': `Bearer ${token}` } }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch(e) { resolve(b); }
      });
    });
  });
}

function post(url, data) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(data);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch(e) { resolve(b); }
      });
    });
    req.write(payload);
    req.end();
  });
}

async function main() {
  const dnsRes = await get(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`);
  console.log('DNS API Result:', JSON.stringify(dnsRes, null, 2));

  // Check if CNAME exists for root and www
  const records = dnsRes.result || [];
  const rootRecord = records.find(r => r.name === 'artroom-wts.com' && (r.type === 'CNAME' || r.type === 'A'));
  const wwwRecord = records.find(r => r.name === 'www.artroom-wts.com' && (r.type === 'CNAME' || r.type === 'A'));

  if (!rootRecord) {
    console.log('Creating CNAME for artroom-wts.com -> art-room-web.pages.dev...');
    const r1 = await post(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`, {
      type: 'CNAME',
      name: '@',
      content: 'art-room-web.pages.dev',
      proxied: true,
      ttl: 1
    });
    console.log('Created root CNAME:', r1);
  }

  if (!wwwRecord) {
    console.log('Creating CNAME for www.artroom-wts.com -> art-room-web.pages.dev...');
    const r2 = await post(`https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`, {
      type: 'CNAME',
      name: 'www',
      content: 'art-room-web.pages.dev',
      proxied: true,
      ttl: 1
    });
    console.log('Created www CNAME:', r2);
  }

  const pagesDomains = await get(`https://api.cloudflare.com/client/v4/accounts/e4d1ad7b5737bce23e0af56b3470cf9f/pages/projects/art-room-web/domains`);
  console.log('Pages Domains:', JSON.stringify(pagesDomains.result?.map(d => ({ name: d.name, status: d.status })), null, 2));
}

main().catch(console.error);
