const https = require('https');

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const DEPLOYMENT_ID = process.argv[2] || 'a1110f22-f1fc-468c-9787-1ec139885fdf';
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
      const lines = json.result.data || [];
      // Get last 50 lines to find the error
      const lastLines = lines.slice(-50);
      lastLines.forEach(l => {
        console.log(l.line || '');
      });
    } else {
      console.log('Error:', JSON.stringify(json));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
