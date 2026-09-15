const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Leaderboard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="premium-card" style=\{\{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px 100px 120px'/g,
  'className="premium-card" style={{ minWidth: "800px", display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 120px"'
);
content = content.replace(
  /className="premium-card" style=\{\{ overflowX: "auto" \}\}/g,
  'className="premium-card"'
); // undo the wrong replacement

fs.writeFileSync(file, content);
