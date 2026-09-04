const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file === 'route.ts' || file === 'route.tsx') {
      results.push(full);
    }
  });
  return results;
}

// Fix all API routes
const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
const routes = walk(apiDir);
let fixed = 0;
routes.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("export const runtime")) {
    // Add at the very top
    content = "export const runtime = 'edge';\n\n" + content;
    fs.writeFileSync(file, content, 'utf8');
    fixed++;
    console.log('Fixed API:', file);
  }
});

// Fix dynamic pages that need edge runtime
const pagesDir = path.join(process.cwd(), 'src', 'app');
function walkPages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      // Skip api directory (already handled)
      if (full.includes(path.join('app', 'api'))) return;
      results = results.concat(walkPages(full));
    } else if (file === 'page.tsx' || file === 'page.ts') {
      // Only fix pages in dynamic routes (containing [])
      if (full.includes('[')) {
        results.push(full);
      }
    }
  });
  return results;
}

const dynamicPages = walkPages(pagesDir);
dynamicPages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("export const runtime")) {
    content = "export const runtime = 'edge';\n\n" + content;
    fs.writeFileSync(file, content, 'utf8');
    fixed++;
    console.log('Fixed page:', file);
  }
});

console.log('\nTotal files fixed:', fixed);
