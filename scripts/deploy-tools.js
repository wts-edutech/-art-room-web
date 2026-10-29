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
  return '';
}

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const TOKEN = getToken();

function apiRequest(method, urlPath, data) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.cloudflare.com',
      port: 443,
      path: urlPath,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const action = process.argv[2] || 'status';
  if (action === 'status') {
    const res = await apiRequest('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments?sort_by=created_on&sort_order=desc`);
    if (res.result) {
      console.log('Deployments:');
      res.result.slice(0, 3).forEach((d, i) => {
        console.log(`[${i+1}] ${d.id} | Stage: ${d.latest_stage?.name} (${d.latest_stage?.status}) | Created: ${d.created_on}`);
        if (d.stages) console.log('    ' + d.stages.map(s => `${s.name}:${s.status}`).join(', '));
      });
    } else {
      console.log(res);
    }
  } else if (action === 'retry') {
    const deployId = process.argv[3];
    console.log(`Retrying ${deployId}...`);
    const res = await apiRequest('POST', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${deployId}/retry`);
    console.log(res);
  } else if (action === 'trigger') {
    console.log(`Triggering new deployment on branch ${process.argv[3] || 'main'}...`);
    const res = await apiRequest('POST', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`, {
      branch: process.argv[3] || 'main'
    });
    console.log(res);
  } else if (action === 'logs') {
    const deployId = process.argv[3];
    const res = await apiRequest('GET', `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${deployId}/history/logs`);
    if (res.result?.data) {
      console.log(res.result.data.map(l => l.line).join('\n'));
    } else {
      console.log(res);
    }
  }
}

main().catch(console.error);
