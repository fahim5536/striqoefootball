const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<section style=\{\{/g,
  '<section className="hero-section" style={{'
);

fs.writeFileSync(file, content);
