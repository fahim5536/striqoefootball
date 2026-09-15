const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/index.css');
let content = fs.readFileSync(file, 'utf8');

// We will remove old .nav-balance and .nav-search blocks so they don't clash
content = content.replace(/\.nav-balance\s*\{[^}]+\}/g, '');
content = content.replace(/\.nav-search\s*\{[^}]+\}/g, '');

fs.writeFileSync(file, content);
