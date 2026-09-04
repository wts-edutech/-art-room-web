const https = require('https');

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const DEPLOYMENT_ID = '99ee0e95-2f49-4b5e-8c3c-29eda6d307fc';
const TOKEN = 'cfoat_0IAW1QSQkAE85RlI9mK5l6mLvdZgv5x4hB3baFcqhkg.BiX0VnJSZnzbBkzDb2BSeCu1lrxyCWKNrFTjQNOalCw';

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
    const json = JSON.parse(body);
    if (json.success && json.result) {
      // Get last 80 lines
      const lines = json.result.data || [];
      const lastLines = lines.slice(-80);
      lastLines.forEach(l => {
        console.log(`${l.ts || ''} ${l.line || ''}`);
      });
    } else {
      console.log('Error:', JSON.stringify(json));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
