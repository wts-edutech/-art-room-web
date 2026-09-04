const fs = require('fs');
const path = require('path');
const tomlPath = path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml');
const content = fs.readFileSync(tomlPath, 'utf8');
const match = content.match(/oauth_token\s*=\s*"([^"]+)"/);
if (match) {
  console.log(match[1]);
} else {
  console.log('NOT_FOUND');
}
