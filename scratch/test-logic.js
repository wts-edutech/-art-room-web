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

async function test() {
  const attRes = await query("SELECT quiz_id, student_id, student_name, classroom FROM quiz_attempts");
  const attempts = attRes.result[0].results;

  const stuRes = await query("SELECT id, student_number, name, classroom FROM students WHERE classroom = 'ม.4/1' OR classroom = '4/1'");
  const students41 = stuRes.result[0].results;

  console.log(`Loaded ${attempts.length} total attempts, and ${students41.length} students in 4/1`);

  // Test 1: For quiz_1793082062047 (ศ31102)
  const quiz1Id = 'quiz_1793082062047';
  const submitted1 = new Set();
  attempts.forEach(a => {
    if (a.quiz_id === quiz1Id && isRoomMatch(a.classroom, 'ม.4/1')) {
      submitted1.add(a.student_id);
    }
  });
  console.log(`Quiz ศ31102 in ม.4/1: ${submitted1.size} submitted out of ${students41.length}`);

  // Test 2: For quiz_m4_pretest (ศ31101)
  const quizPretestId = 'quiz_m4_pretest';
  const submittedPretest = new Set();
  attempts.forEach(a => {
    if (a.quiz_id === quizPretestId && isRoomMatch(a.classroom, 'ม.4/1')) {
      submittedPretest.add(a.student_id);
    }
  });
  console.log(`Quiz ศ31101 (Pretest) in ม.4/1: ${submittedPretest.size} submitted out of ${students41.length}`);
  console.log('Submitted student IDs in 4/1 for Pretest:', Array.from(submittedPretest));
}

test();
