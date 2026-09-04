const https = require('https');

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const TOKEN = 'cfoat_0IAW1QSQkAE85RlI9mK5l6mLvdZgv5x4hB3baFcqhkg.BiX0VnJSZnzbBkzDb2BSeCu1lrxyCWKNrFTjQNOalCw';

// Update Pages project with D1 binding in deployment_configs
const data = JSON.stringify({
  deployment_configs: {
    production: {
      compatibility_date: "2026-09-04",
      compatibility_flags: ["nodejs_compat"],
      d1_databases: {
        DB: {
          id: "a6a5cb12-3c61-4927-9ba5-1ee7e9ce7e4b"
        }
      }
    },
    preview: {
      compatibility_date: "2026-09-04",
      compatibility_flags: ["nodejs_compat"],
      d1_databases: {
        DB: {
          id: "a6a5cb12-3c61-4927-9ba5-1ee7e9ce7e4b"
        }
      }
    }
  }
});

const options = {
  hostname: 'api.cloudflare.com',
  port: 443,
  path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    if (json.success) {
      console.log('SUCCESS: D1 binding added!');
      const prodConfig = json.result.deployment_configs?.production;
      console.log('D1 bindings:', JSON.stringify(prodConfig?.d1_databases));
      console.log('Compatibility flags:', prodConfig?.compatibility_flags);
    } else {
      console.log('FAILED:', JSON.stringify(json.errors, null, 2));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
