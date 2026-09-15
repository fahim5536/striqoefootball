const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Leaderboard.tsx');
let content = fs.readFileSync(file, 'utf8');

// The list header
content = content.replace(
  /<div style=\{\{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px 100px 120px'/g,
  '<div style={{ minWidth: "800px", display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 120px"'
);

// We need to wrap the whole list (including headers and rows) in an overflow container
content = content.replace(
  /<div className="premium-card">/g,
  '<div className="premium-card" style={{ overflowX: "auto" }}>'
);

fs.writeFileSync(file, content);
