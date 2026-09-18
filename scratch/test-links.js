const fs = require('fs');
const path = require('path');

const urls = [
  'https://www.f0nt.com/release/fh-hamsters/',
  'https://www.f0nt.com/release/lmf-matchanamphung/',
  'https://www.f0nt.com/release/kanchaeasy/',
  'https://www.f0nt.com/release/ebwriter/'
];

async function getDlLinks() {
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const text = await res.text();
      const match = text.match(/href=["'](https?:\/\/www\.f0nt\.com\/\?dl_name=[^"']+)["']/i);
      console.log(url, '-> DL LINK:', match ? match[1] : 'NOT FOUND');
    } catch (e) {
      console.error(url, e.message);
    }
  }
}

getDlLinks();
