const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/RecommendationsSection.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace styles with the new premium ones
content = content.replace(/<section style={{ padding: '80px 40px', background: '#0a0a1f' }}>/g, '<section style={{ padding: "80px 40px" }}>');

content = content.replace(/<h2 style={{ fontFamily: '"Inter", sans-serif', fontWeight: 900, fontSize: '32px', color: '#fff', textTransform: 'uppercase' }}>/g, '<h2 className="section-heading-premium">');

content = content.replace(/<div style={{ color: '#00e5ff', fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', marginTop: '8px' }}>/g, '<div className="section-subheading-premium" style={{ marginBottom: "0" }}>');

content = content.replace(/<div style={{ background: 'rgba\(255,255,255,0.03\)', border: '1px solid rgba\(255,255,255,0.06\)', padding: '24px', borderRadius: '4px', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}\s*onMouseEnter=\{e => e\.currentTarget\.style\.borderColor = '#00e5ff'\}\s*onMouseLeave=\{e => e\.currentTarget\.style\.borderColor = 'rgba\(255,255,255,0.06\)'\}>/g, '<div className="card-premium">');

fs.writeFileSync(file, content);
