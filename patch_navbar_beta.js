import fs from 'fs';

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  "import { Link, useLocation } from 'react-router-dom';",
  "import { Link, useLocation } from 'react-router-dom';\nimport { useFeatureFlag } from '../contexts/ClientConfigContext';"
);

code = code.replace(
  "const [googleSignupStep, setGoogleSignupStep] = useState(false);",
  "const [googleSignupStep, setGoogleSignupStep] = useState(false);\n  const isBetaOnly = useFeatureFlag('BETA_ONLY');"
);

// We need to conditionally show the Beta Invitation Code based on isBetaOnly
code = code.replace(
  /<div className="modal-input-group" style={{ marginTop: '8px' }}>\s*<input type="text" className="modal-input" placeholder="Beta Invitation Code \(Required\)" required value={betaCode} onChange={\(e\) => setBetaCode\(e.target.value\)} style={{ borderColor: '#00e5ff' }} \/>\s*<\/div>/g,
  `{isBetaOnly && (
                    <div className="modal-input-group" style={{ marginTop: '8px' }}>
                      <input type="text" className="modal-input" placeholder="Beta Invitation Code (Required)" required value={betaCode} onChange={(e) => setBetaCode(e.target.value)} style={{ borderColor: '#00e5ff' }} />
                    </div>
                  )}`
);

fs.writeFileSync('src/components/Navbar.tsx', code);
