const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

code = code.replace('<section className="stats-bar" ref={statsRef}>', '<section className="stats-bar" id="premium-stats-section" ref={statsRef}>');

fs.writeFileSync('src/components/Dashboard.tsx', code);
