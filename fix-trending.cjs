const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/RecommendationsSection.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div style={{ background: 'rgba\(255,255,255,0.03\)', border: '1px solid rgba\(255,255,255,0.06\)', padding: '24px', borderRadius: '4px', transition: 'all 0.2s ease' }}\s*onMouseEnter=\{e => e\.currentTarget\.style\.borderColor = '#7c3aed'\}\s*onMouseLeave=\{e => e\.currentTarget\.style\.borderColor = 'rgba\(255,255,255,0.06\)'\}>/g,
  '<div className="card-premium">'
);
content = content.replace(/<h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '24px', color: '#fff', textTransform: 'uppercase' }}>Top Teams to Watch<\/h2>/g, '<h2 className="section-heading-premium">Top Teams to Watch</h2>');
content = content.replace(/minmax\(300px, 1fr\)/g, "minmax(280px, 1fr)");

fs.writeFileSync(file, content);
