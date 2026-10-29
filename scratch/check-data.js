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
  const attempts = await query('SELECT * FROM quiz_attempts ORDER BY submitted_at DESC LIMIT 10');
  console.log('ATTEMPTS SAMPLE:', JSON.stringify(attempts.result[0].results, null, 2));

  const quizzes = await query('SELECT id, code, title FROM quizzes');
  console.log('QUIZZES:', JSON.stringify(quizzes.result[0].results, null, 2));

  const students = await query("SELECT id, student_number, name, classroom FROM students WHERE classroom LIKE '%4/1%' LIMIT 5");
  console.log('STUDENTS 4/1 SAMPLE:', JSON.stringify(students.result[0].results, null, 2));
}

run();
