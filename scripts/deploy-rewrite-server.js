const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../src/app');

function fixServerComponent(filePath, tableName) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove fs and path imports
  content = content.replace(/import fs from ["']fs["'];\n/g, '');
  content = content.replace(/import path from ["']path["'];\n/g, '');
  
  // Add DB imports if not there
  if (!content.includes('import { getDb }')) {
    content = content.replace(/(import .*;\n)+/, (match) => {
      return match + `import { getDb } from '@/db';\nimport { ${tableName} } from '@/db/schema';\nimport { desc, eq } from 'drizzle-orm';\n`;
    });
  }

  // Replace getX() function with Drizzle query
  if (tableName === 'news') {
    content = content.replace(/function getNews\(\) \{[\s\S]*?\n\}/, `async function getNews() {\n  try {\n    const db = getDb();\n    return await db.select().from(news).orderBy(desc(news.date));\n  } catch (error) {\n    return [];\n  }\n}`);
    content = content.replace(/export default function NewsPage\(\) \{/g, 'export default async function NewsPage() {');
    content = content.replace(/const newsItems = getNews\(\);/g, 'const newsItems = await getNews();');
  } else if (tableName === 'lessons') {
    content = content.replace(/function getLessons\(\) \{[\s\S]*?\n\}/, `async function getLessons(type) {\n  try {\n    const db = getDb();\n    return await db.select().from(lessons).where(eq(lessons.type, type)).orderBy(desc(lessons.createdAt));\n  } catch (error) {\n    return [];\n  }\n}`);
    
    // Fix MaterialsPage
    if (content.includes('export default function MaterialsPage()')) {
      content = content.replace(/export default function MaterialsPage\(\) \{/g, 'export default async function MaterialsPage() {');
      content = content.replace(/const lessons = getLessons\(\);/g, 'const lessons = await getLessons("general");');
    } else if (content.includes('export default function M3MaterialsPage()')) {
      content = content.replace(/export default function M3MaterialsPage\(\) \{/g, 'export default async function M3MaterialsPage() {');
      content = content.replace(/const lessons = getLessons\(\);/g, 'const lessons = await getLessons("m3");');
    } else if (content.includes('export default function M4MaterialsPage()')) {
      content = content.replace(/export default function M4MaterialsPage\(\) \{/g, 'export default async function M4MaterialsPage() {');
      content = content.replace(/const lessons = getLessons\(\);/g, 'const lessons = await getLessons("m4");');
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed', filePath);
}

fixServerComponent(path.join(baseDir, 'news/page.tsx'), 'news');
fixServerComponent(path.join(baseDir, 'materials/page.tsx'), 'lessons');
fixServerComponent(path.join(baseDir, 'materials/m3/page.tsx'), 'lessons');
fixServerComponent(path.join(baseDir, 'materials/m4/page.tsx'), 'lessons');
