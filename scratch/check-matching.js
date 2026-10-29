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

async function run() {
  // Check how many attempts per quiz
  const countPerQuiz = await query(`
    SELECT quiz_id, COUNT(*) as cnt FROM quiz_attempts GROUP BY quiz_id
  `);
  console.log('COUNT PER QUIZ:', countPerQuiz.result[0].results);

  // Check attempts for quiz_m4_pretest in 4/1
  const att41 = await query(`
    SELECT student_id, student_name, classroom FROM quiz_attempts WHERE quiz_id = 'quiz_m4_pretest' AND classroom LIKE '%4/1%'
  `);
  console.log('ATTEMPTS IN 4/1 for quiz_m4_pretest:', att41.result[0].results);

  // Check students in 4/1
  const stud41 = await query(`
    SELECT id, student_number, name, classroom FROM students WHERE classroom LIKE '%4/1%'
  `);
  console.log('TOTAL STUDENTS IN 4/1:', stud41.result[0].results.length);
}

run();
