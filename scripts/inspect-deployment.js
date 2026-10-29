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
const id = process.argv[2] || '123c76bb-f9d9-42dd-86ca-23ae262f00c4';

const options = {
  hostname: 'api.cloudflare.com',
  port: 443,
  path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${id}/history/logs`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
};

https.get(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json.result, null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});
