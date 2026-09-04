const https = require('https');
https.get('https://theactive.thaipbs.or.th/read/art-classroom/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/<meta property="og:image" content="([^"]+)"/);
    console.log(match ? match[1] : 'not found');
  });
});
