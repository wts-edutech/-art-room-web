const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const fonts = [
  { name: 'FH-Hamster', url: 'https://www.f0nt.com/?dl_name=FontHouse/FH-Hamster.zip' },
  { name: 'Matchanamphung', url: 'https://www.f0nt.com/?dl_name=First/Matchanamphung.zip' },
  { name: 'KanchaEasy', url: 'https://www.f0nt.com/?dl_name=Kancha/KanchaEasy.zip' },
  { name: 'EBWriter', url: 'https://www.f0nt.com/?dl_name=mugglesfont/EBWriter.zip' }
];

const tempDir = path.join(__dirname, 'temp_fonts');
const targetDir = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

async function downloadAll() {
  for (const f of fonts) {
    const zipPath = path.join(tempDir, `${f.name}.zip`);
    const extractPath = path.join(tempDir, f.name);
    console.log(`Downloading ${f.name} from ${f.url}...`);
    try {
      const res = await fetch(f.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.f0nt.com/'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(zipPath, buffer);
      console.log(`Downloaded ${f.name}.zip (${buffer.length} bytes)`);

      // Extract using PowerShell
      if (fs.existsSync(extractPath)) fs.rmSync(extractPath, { recursive: true, force: true });
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractPath}' -Force"`);
      console.log(`Extracted to ${extractPath}`);

      // Find font files in extractPath
      const files = fs.readdirSync(extractPath, { recursive: true });
      for (const file of files) {
        const fullPath = path.join(extractPath, file);
        if (fs.statSync(fullPath).isFile() && (file.endsWith('.ttf') || file.endsWith('.otf'))) {
          console.log(`Found font file: ${file}`);
        }
      }
    } catch (err) {
      console.error(`Error with ${f.name}:`, err.message);
    }
  }
}

downloadAll();
