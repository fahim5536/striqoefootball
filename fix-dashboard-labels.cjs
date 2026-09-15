const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Dashboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div style=\{\{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY\(-50%\)', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-end', zIndex: 1 \}\}>/g,
  '<div className="hero-right-labels" style={{ position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "24px", alignItems: "flex-end", zIndex: 1 }}>'
);

fs.writeFileSync(file, content);
