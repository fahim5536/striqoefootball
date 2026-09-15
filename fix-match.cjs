const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Match.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /padding: '100px 40px'/g,
  'padding: "var(--section-padding, 100px 40px)"'
);

fs.writeFileSync(file, content);
