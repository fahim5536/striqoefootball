import fs from 'fs';
let code = fs.readFileSync('package.json', 'utf8');
code = code.replace('"version": "1.30.0-alpha"', '"version": "1.90.0-rc.1"');
fs.writeFileSync('package.json', code);
