const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Tournament.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div style={{ display: 'grid', gridTemplateColumns: 'repeat\(3, 1fr\)', gap: '2px' }}>/g,
  '<div className="tournaments-grid">'
);

fs.writeFileSync(file, content);
