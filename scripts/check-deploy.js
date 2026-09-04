const https = require('https');

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const PROJECT_NAME = 'art-room-web';
const TOKEN = 'cfoat_0IAW1QSQkAE85RlI9mK5l6mLvdZgv5x4hB3baFcqhkg.BiX0VnJSZnzbBkzDb2BSeCu1lrxyCWKNrFTjQNOalCw';

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
      console.log('No deployments yet. Waiting for GitHub webhook to trigger...');
    } else {
      console.log('Error:', JSON.stringify(json.errors));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
