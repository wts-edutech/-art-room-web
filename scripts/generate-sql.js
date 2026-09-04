const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');
const sqlPath = path.join(__dirname, '../data/migrate.sql');

if (!fs.existsSync(dbPath)) {
  console.error("db.json not found!");
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
let sql = '';

function escape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  // Escape single quotes
  return `'${String(val).replace(/'/g, "''")}'`;
}

// Visitors
if (db.visitors && db.visitors.daily) {
  for (const [date, count] of Object.entries(db.visitors.daily)) {
    sql += `INSERT INTO visitors (date, count) VALUES (${escape(date)}, ${escape(count)});\n`;
  }
}

// Students
if (db.students) {
  for (const student of db.students) {
    sql += `INSERT INTO students (id, name) VALUES (${escape(student.id || '-')}, ${escape(student.name || '-')});\n`;
  }
}

// Lessons
const allLessons = [];
if (db.lessons) allLessons.push(...db.lessons.map(l => ({...l, type: 'general'})));
if (db.m3Lessons) allLessons.push(...db.m3Lessons.map(l => ({...l, type: 'm3'})));
if (db.m4Lessons) allLessons.push(...db.m4Lessons.map(l => ({...l, type: 'm4'})));

for (const lesson of allLessons) {
  sql += `INSERT INTO lessons (id, title, description, video_id, category, image_url, views, rating_sum, rating_count, type) VALUES (` +
    `${escape(lesson.id || Date.now().toString())}, ${escape(lesson.title || 'Untitled')}, ${escape(lesson.description)}, ${escape(lesson.videoId || lesson.m3VideoId || lesson.m4VideoId)}, ` +
    `${escape(lesson.category || lesson.m3Category || lesson.m4Category)}, ${escape(lesson.imageUrl)}, ${escape(lesson.views || 0)}, ` +
    `${escape(lesson.ratingSum || 0)}, ${escape(lesson.ratingCount || 0)}, ${escape(lesson.type)});\n`;
}

// Comments
if (db.comments) {
  for (const comment of db.comments) {
    sql += `INSERT INTO comments (id, lesson_id, author, author_email, author_image, text, time) VALUES (` +
      `${escape((comment.id || Date.now()).toString())}, ${escape(comment.lessonId || '-')}, ${escape(comment.author || 'Anonymous')}, ${escape(comment.authorEmail)}, ` +
      `${escape(comment.authorImage)}, ${escape(comment.text || '-')}, ${escape(comment.time)});\n`;
  }
}

// Artworks
if (db.artworks) {
  for (const artwork of db.artworks) {
    sql += `INSERT INTO artworks (id, title, author, image_url, year) VALUES (` +
      `${escape(artwork.id || Date.now().toString())}, ${escape(artwork.title || 'Untitled')}, ${escape(artwork.author || 'Unknown')}, ${escape(artwork.imageUrl || '')}, ${escape(artwork.year)});\n`;
  }
}

// Awards
if (db.awards) {
  for (const award of db.awards) {
    sql += `INSERT INTO awards (id, title, student, description, image_url, year) VALUES (` +
      `${escape(award.id || Date.now().toString())}, ${escape(award.title || 'Untitled')}, ${escape(award.student || 'Unknown')}, ${escape(award.description)}, ${escape(award.imageUrl)}, ${escape(award.year)});\n`;
  }
}

// Activities
if (db.activities) {
  for (const activity of db.activities) {
    sql += `INSERT INTO activities (id, title, date, description, image_url) VALUES (` +
      `${escape(activity.id || Date.now().toString())}, ${escape(activity.title || 'Untitled')}, ${escape(activity.date || new Date().toISOString())}, ${escape(activity.description)}, ${escape(activity.imageUrl)});\n`;
  }
}

// News
if (db.news) {
  for (const item of db.news) {
    sql += `INSERT INTO news (id, title, content, date, image_url) VALUES (` +
      `${escape(item.id || Date.now().toString())}, ${escape(item.title || 'Untitled')}, ${escape(item.content || '-')}, ${escape(item.date || new Date().toISOString())}, ${escape(item.imageUrl)});\n`;
  }
}

// Ideas
if (db.ideas) {
  for (const idea of db.ideas) {
    sql += `INSERT INTO ideas (id, title, description, category, author_name, author_email, cover_image_url, files, status) VALUES (` +
      `${escape(idea.id || Date.now().toString())}, ${escape(idea.title || 'Untitled')}, ${escape(idea.description || '-')}, ${escape(idea.category)}, ${escape(idea.authorName || 'Unknown')}, ` +
      `${escape(idea.authorEmail)}, ${escape(idea.coverImageUrl)}, ${escape(JSON.stringify(idea.files || []))}, ${escape(idea.status || 'pending')});\n`;
  }
}

// Testimonials
if (db.testimonials) {
  for (const test of db.testimonials) {
    sql += `INSERT INTO testimonials (id, name, role, message, avatar_url, rating) VALUES (` +
      `${escape(test.id || Date.now().toString())}, ${escape(test.name || 'Anonymous')}, ${escape(test.role)}, ${escape(test.message || '-')}, ${escape(test.avatarUrl)}, ${escape(test.rating || 5)});\n`;
  }
}

fs.writeFileSync(sqlPath, sql, 'utf8');
console.log('Successfully generated data/migrate.sql');
