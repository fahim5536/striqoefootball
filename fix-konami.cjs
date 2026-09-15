const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

const target = `<div style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '28px', fontWeight: 900, color: '#E2E8F0', letterSpacing: '0.1em' }}>
              KONAMI
            </div>`;

const replacement = `<a href="https://www.konami.com/" target="_blank" rel="noopener noreferrer" style={{ fontFamily: '"Orbitron", sans-serif', fontSize: '28px', fontWeight: 900, color: '#E2E8F0', letterSpacing: '0.1em', textDecoration: 'none', transition: 'color 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = '#00e5ff'} onMouseLeave={(e) => e.currentTarget.style.color = '#E2E8F0'}>
              KONAMI
            </a>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/Dashboard.tsx', code);
