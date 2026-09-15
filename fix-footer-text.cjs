const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Footer.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div style=\{\{ fontSize: '14px', color: '#64748b', letterSpacing: '0\.2em', textTransform: 'uppercase', marginBottom: '24px' \}\}>OFFICIAL PARTNERS<\/div>/g,
  '<div style={{ fontSize: "14px", color: "#F8FAFC", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "24px" }}>OFFICIAL PARTNERS</div>'
);

content = content.replace(
  /style=\{\{ opacity: 0\.5, transition: 'opacity 0\.2s ease' \}\} onMouseEnter=\{\(e\) => e\.currentTarget\.style\.opacity = '1'\} onMouseLeave=\{\(e\) => e\.currentTarget\.style\.opacity = '0\.5'\}/g,
  'style={{ opacity: 1, transition: "opacity 0.2s ease" }} onMouseEnter={(e) => e.currentTarget.style.opacity = "1"} onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}'
);

content = content.replace(
  /<div key=\{p\.id\} style=\{\{ opacity: 0\.5 \}\}>/g,
  '<div key={p.id} style={{ opacity: 1 }}>'
);

content = content.replace(
  /<div style=\{\{ color: '#64748b', fontSize: '14px' \}\}>/g,
  '<div style={{ color: "#F8FAFC", fontSize: "14px" }}>'
);

content = content.replace(
  /<Link to="\/admin" style=\{\{ opacity: 0, padding: '10px' \}\}>Admin<\/Link>/g,
  '<Link to="/admin" style={{ opacity: 1, color: "#94A3B8", padding: "10px", textDecoration: "none" }}>Admin</Link>'
);

fs.writeFileSync(file, content);
