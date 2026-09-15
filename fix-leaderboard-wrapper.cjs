const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Leaderboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div style=\{\{ background: '#0a0a1f', border: '1px solid rgba\(255,255,255,0.1\)', position: 'relative' \}\}>/g,
  '<div style={{ background: "#0a0a1f", border: "1px solid rgba(255,255,255,0.1)", position: "relative", overflowX: "auto" }}>'
);
content = content.replace(
  /className="premium-card" style=\{\{ minWidth: "800px", display: "grid"/g,
  'className="premium-card" style={{ minWidth: "800px", display: "grid"'
);

fs.writeFileSync(file, content);
