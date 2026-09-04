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
        const latest = json.result[0];
        console.log('=== Latest Deployment ===');
        console.log('ID:', latest.id);
        console.log('Status:', latest.latest_stage?.name, '-', latest.latest_stage?.status);
        console.log('URL:', latest.url);
        console.log('Created:', latest.created_on);
        
        if (latest.stages) {
          console.log('\n=== Build Stages ===');
          latest.stages.forEach(s => {
            console.log(`  ${s.name}: ${s.status} ${s.ended_on ? '(done)' : s.started_on ? '(running)' : '(pending)'}`);
          });
        }
        
        if (latest.build_config) {
          console.log('\nBuild command:', latest.build_config.build_command);
        }
      } else if (json.success && json.result && json.result.length === 0) {
        console.log('No deployments yet.');
      } else {
        console.log('Error:', JSON.stringify(json.errors));
      }
    } catch (err) {
      console.log('Parse error:', err.message, body);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
