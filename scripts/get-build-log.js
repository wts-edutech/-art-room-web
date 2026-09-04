const https = require('https');
const fs = require('fs');
const path = require('path');

function getToken() {
  try {
    const tomlPath = path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
    const toml = fs.readFileSync(tomlPath, 'utf8');
    const match = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
    if (match) return match[1];
  } catch (e) {}
  return 'cfoat_0bUNdVcCcqK1B2QEgKy-1igAlDsTSme0-BAw3xMA_CE.Iq2MBhcc61Fr20GAEIoTKdTWRUuPJigaVANjgpNBd0c';
}

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const DEPLOYMENT_ID = process.argv[2] || '6d845aae-c53b-4be8-ae42-f529044bf95b';
const TOKEN = getToken();

const options = {
  hostname: 'api.cloudflare.com',
  port: 443,
  path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${DEPLOYMENT_ID}/history/logs`,
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
      if (json.success && json.result) {
        const lines = json.result.data || [];
        console.log(`Total log lines: ${lines.length}`);
        const lastLines = lines.slice(-40);
        lastLines.forEach(l => {
          console.log(l.line || '');
        });
      } else {
        console.log('Error response:', JSON.stringify(json));
      }
    } catch (err) {
      console.log('Parse error:', err.message, body);
    }
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.end();
