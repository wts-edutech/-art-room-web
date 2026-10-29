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

const options = {
  hostname: 'api.cloudflare.com',
  port: 443,
  path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments?sort_by=created_on&sort_order=desc`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      if (json.success && json.result && json.result.length > 0) {
        console.log(`Found ${json.result.length} deployments:`);
        const latest = json.result[0];
        json.result.slice(0, 10).forEach((d, idx) => {
          console.log(`[${idx + 1}] ID: ${d.id} | Stage: ${d.latest_stage?.name} (${d.latest_stage?.status}) | Commit: ${d.deployment_trigger?.metadata?.commit_hash?.slice(0, 7) || 'N/A'} - ${d.deployment_trigger?.metadata?.commit_message?.slice(0, 40) || ''} | Created: ${d.created_on}`);
          if (d.stages) {
            console.log('    Stages:', d.stages.map(s => `${s.name}: ${s.status}`).join(', '));
          }
        });
        if (latest) {
          const logOpt = {
            hostname: 'api.cloudflare.com',
            port: 443,
            path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${latest.id}/history?page=1&per_page=50`,
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          };
          https.get(logOpt, (lRes) => {
            let lBody = '';
            lRes.on('data', c => lBody += c);
            lRes.on('end', () => {
              try {
                const lj = JSON.parse(lBody);
                if (lj.result && lj.result.data) {
                  console.log('\n--- Latest Deployment Logs ---');
                  console.log(lj.result.data.map(l => l.line).join('\n'));
                }
              } catch (e) {}
            });
          });
        }
      } else {
        console.log('Error:', JSON.stringify(json.errors || json));
      }
    } catch (err) {
      console.log('Parse error:', err.message, body);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
