import fs from 'fs';

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  `<div className="logo-wordmark">STRIQO</div>`,
  `<div className="logo-wordmark">STRIQO</div>
          <div style={{
            background: isBetaOnly ? 'rgba(255,45,85,0.2)' : 'rgba(0, 229, 255, 0.2)',
            color: isBetaOnly ? '#ff2d55' : '#00e5ff',
            border: isBetaOnly ? '1px solid rgba(255,45,85,0.4)' : '1px solid rgba(0, 229, 255, 0.4)',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            marginLeft: '12px'
          }}>
            {isBetaOnly ? 'CLOSED BETA' : 'OPEN BETA'}
          </div>`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
