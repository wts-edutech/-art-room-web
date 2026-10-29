const https = require('https');
const fs = require('fs');
const path = require('path');

const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const token = fs.readFileSync(tomlPath, 'utf8').match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const ACCOUNT_ID = 'e4d1ad7b5737bce23e0af56b3470cf9f';
const DB_ID = 'a6a5cb12-3c61-4927-9ba5-1ee7e9ce7e4b';

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sql, params });
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: '/client/v4/accounts/' + ACCOUNT_ID + '/d1/database/' + DB_ID + '/query',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const cleanName = (name) => {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/^(นาย|นางสาว|น\.ส\.|นาง|เด็กชาย|ด\.ช\.|เด็กหญิง|ด\.ญ\.)\s*/, '')
    .replace(/\s+/g, '');
};

const normalizeRoom = (roomStr) => {
  if (!roomStr) return "";
  return roomStr.trim().replace(/^ห้อง\s*/, "").replace(/^ชั้น\s*/, "");
};

const isRoomMatch = (r1, r2) => {
  const n1 = normalizeRoom(r1);
  const n2 = normalizeRoom(r2);
  if (n1 === n2) return true;
  const c1 = n1.replace(/^ม\./, "");
  const c2 = n2.replace(/^ม\./, "");
  return c1 === c2;
};

async function testMatching() {
  const attRes = await query("SELECT quiz_id, student_id, student_name, classroom FROM quiz_attempts WHERE quiz_id = 'quiz_m4_pretest'");
  const attempts = attRes.result[0].results;

  const stuRes = await query("SELECT id, student_number, name, classroom FROM students WHERE classroom = 'ม.4/1' OR classroom = '4/1'");
  const students41 = stuRes.result[0].results;

  console.log(`Pretest attempts: ${attempts.length}, 4/1 students: ${students41.length}`);

  // Build submitted sets
  const submittedIdSet = new Set();
  const submittedNameSet = new Set();

  attempts.forEach(a => {
    if (a.student_id) submittedIdSet.add(a.student_id.trim());
    if (a.student_name) submittedNameSet.add(cleanName(a.student_name));
  });

  const submitted = [];
  const unsubmitted = [];

  students41.forEach(s => {
    const idMatch = submittedIdSet.has(s.id.trim());
    const nameMatch = submittedNameSet.has(cleanName(s.name));
    if (idMatch || nameMatch) {
      submitted.push(s);
    } else {
      unsubmitted.push(s);
    }
  });

  console.log(`4/1 Submitted: ${submitted.length} students:`);
  submitted.forEach(s => console.log(`  เลขที่ ${s.student_number}: ${s.name} (${s.id})`));
  console.log(`4/1 Unsubmitted: ${unsubmitted.length} students:`);
  unsubmitted.forEach(s => console.log(`  เลขที่ ${s.student_number}: ${s.name} (${s.id})`));
}

testMatching();
