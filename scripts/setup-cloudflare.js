const https = require('https');

const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const TOKEN = 'cfoat_0IAW1QSQkAE85RlI9mK5l6mLvdZgv5x4hB3baFcqhkg.BiX0VnJSZnzbBkzDb2BSeCu1lrxyCWKNrFTjQNOalCw';

// Create Pages project with GitHub source and correct build config
const data = JSON.stringify({
  name: "art-room-web",
  production_branch: "main",
  build_config: {
    build_command: "npx @cloudflare/next-on-pages",
    destination_dir: ".vercel/output/static",
    root_dir: "",
    web_analytics_token: ""
  },
  source: {
    type: "github",
    config: {
      owner: "wts-edutech",
      repo_name: "-art-room-web",
      production_branch: "main",
      pr_comments_enabled: true,
      deployments_enabled: true,
      production_deployments_enabled: true
    }
  }
});

const options = {
  hostname: 'api.cloudflare.com',
  port: 443,
  path: `/client/v4/accounts/${ACCOUNT_ID}/pages/projects`,
  method: 'POST',
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
      console.log('SUCCESS: Pages project created with GitHub integration!');
      console.log('Project name:', json.result.name);
      console.log('URL:', `https://${json.result.subdomain}`);
      console.log('Build command:', json.result.build_config?.build_command);
      console.log('Source type:', json.result.source?.type);
    } else {
      console.log('FAILED:', JSON.stringify(json.errors, null, 2));
      console.log('Full response:', JSON.stringify(json, null, 2));
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
