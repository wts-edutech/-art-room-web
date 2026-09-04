const fs = require('fs');
const path = require('path');

// These dynamic pages use "use client" with useRouter/useParams
// They should NOT have export const runtime = 'edge'
const filesToFix = [
  'src/app/ideas/[id]/page.tsx',
  'src/app/materials/[id]/page.tsx',
  'src/app/materials/m3/[id]/page.tsx',
  'src/app/materials/m4/[id]/page.tsx',
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Remove the edge runtime export we added
    content = content.replace(/^export const runtime = 'edge';\n\n/, '');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Removed edge runtime from:', relPath);
  }
});

console.log('Done!');
