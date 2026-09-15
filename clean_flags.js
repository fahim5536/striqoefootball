import fs from 'fs';

// 1. Navbar.tsx
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navbar = navbar.replace(/const isBetaOnly = useFeatureFlag\('BETA_ONLY'\);\n?/g, '');
navbar = navbar.replace(/\{isBetaOnly && \(\s*<div className="modal-input-group" style={{ marginTop: '8px' }}>\s*<input type="text" className="modal-input" placeholder="Beta Invitation Code \(Required\)" required value={betaCode} onChange={\(e\) => setBetaCode\(e\.target\.value\)} style={{ borderColor: '#00e5ff' }} \/>\s*<\/div>\s*\)\}/g, '');
navbar = navbar.replace(/<div style={{\s*background: isBetaOnly \? 'rgba\(255,45,85,0\.2\)' : 'rgba\(0, 229, 255, 0\.2\)',\s*color: isBetaOnly \? '#ff2d55' : '#00e5ff',\s*border: isBetaOnly \? '1px solid rgba\(255,45,85,0\.4\)' : '1px solid rgba\(0, 229, 255, 0\.4\)',\s*padding: '2px 8px',\s*fontSize: '10px',\s*fontWeight: 800,\s*letterSpacing: '0\.1em',\s*marginLeft: '12px'\s*}}>\s*\{isBetaOnly \? 'CLOSED BETA' : 'OPEN BETA'\}\s*<\/div>/g, 
  `<div style={{
            background: 'rgba(0, 229, 255, 0.2)',
            color: '#00e5ff',
            border: '1px solid rgba(0, 229, 255, 0.4)',
            padding: '2px 8px',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            marginLeft: '12px'
          }}>
            RC PREVIEW
          </div>`
);
fs.writeFileSync('src/components/Navbar.tsx', navbar);

// 2. Dashboard.tsx
let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dash = dash.replace(/const isBetaOnly = useFeatureFlag\('BETA_ONLY'\);\n?/g, '');
dash = dash.replace(/\{!isBetaOnly && \(\s*(<div className="mb-6 p-4 border border-cyan-500\/30 bg-cyan-900\/20" style={{ backdropFilter: 'blur\(10px\)' }}>[\s\S]*?<\/div>)\s*\)}/g, '$1');
fs.writeFileSync('src/components/Dashboard.tsx', dash);

// 3. server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(/const betaFlag = await prisma\.featureFlag\.findUnique\(\{ where: \{ key: 'BETA_ONLY' \} \}\);\s*const isBetaOnly = betaFlag\?\.isEnabled \?\? true; \/\/ Default to true for closed beta\s*let betaInvite = null;\s*if \(isBetaOnly\) \{[\s\S]*?\}\s*else if \(betaCode\) \{[\s\S]*?\}/, `
    let betaInvite = null;
    if (betaCode) {
      betaInvite = await prisma.betaInvitation.findUnique({ where: { code: betaCode } });
      if (betaInvite && betaInvite.status === 'ACTIVE') {
        // Optional tracking if they used a code
      }
    }
`);
fs.writeFileSync('server.ts', server);

