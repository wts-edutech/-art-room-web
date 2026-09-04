const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      res.on('error', reject);
    });
  });
}

function post(url, payload) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(payload);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      res.on('error', reject);
    });
    req.write(dataStr);
    req.end();
  });
}

async function main() {
  console.log('1. Testing GET /login HTML:');
  const loginRes = await get('https://art-room-web.pages.dev/login');
  console.log('Status:', loginRes.status);
  
  // Find JS chunks referenced in HTML
  const scriptRegex = /src="(\/_next\/static\/chunks\/[^"]+\.js)"/g;
  let match;
  let foundLoginStrings = false;
  
  while ((match = scriptRegex.exec(loginRes.body)) !== null) {
    const chunkUrl = 'https://art-room-web.pages.dev' + match[1];
    const chunkRes = await get(chunkUrl);
    if (chunkRes.body.includes('Google') && chunkRes.body.includes('Facebook') && chunkRes.body.includes('Line')) {
      console.log(`Found social login buttons in chunk: ${match[1]}`);
      foundLoginStrings = true;
      break;
    }
  }
  
  console.log('Social login bundle verified in production assets:', foundLoginStrings);
  
  console.log('\n2. Testing 1-Click Guest Login API:');
  const guestRes = await post('https://art-room-web.pages.dev/api/auth/guest', {
    guestName: 'ผู้ใช้ Google',
    emailOrProvider: 'google_guest@artroom.local'
  });
  console.log('Guest Auth Status:', guestRes.status);
  console.log('Guest Auth Response:', guestRes.body);
  console.log('Set-Cookie received:', !!guestRes.headers['set-cookie']);
  if (guestRes.headers['set-cookie']) {
    console.log('Cookie snippet:', guestRes.headers['set-cookie'][0].substring(0, 45) + '...');
  }
}

main().catch(console.error);
