import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link } from 'react-router-dom';\nimport { useFeatureFlag } from '../contexts/ClientConfigContext';"
);

code = code.replace(
  "export default function Dashboard() {",
  "export default function Dashboard() {\n  const isBetaOnly = useFeatureFlag('BETA_ONLY');"
);

code = code.replace(
  `        <h1 className="cyber-title mb-6">WELCOME TO THE ARENA</h1>`,
  `        {!isBetaOnly && (
          <div className="mb-6 p-4 border border-cyan-500/30 bg-cyan-900/20" style={{ backdropFilter: 'blur(10px)' }}>
            <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
              <Sparkles size={16} />
              STRIQO OPEN BETA IS LIVE
            </h3>
            <p className="text-zinc-300 text-sm">
              Welcome to the public testing phase. Help us shape the future of STRIQO by participating in tournaments and reporting bugs via the Feedback button.
            </p>
          </div>
        )}
        <h1 className="cyber-title mb-6">WELCOME TO THE ARENA</h1>`
);

code = code.replace(
  `import { Trophy, Users, Swords, ArrowRight, ShieldAlert, Zap, TrendingUp, Filter, Sparkles, HelpCircle } from 'lucide-react';`,
  `import { Trophy, Users, Swords, ArrowRight, ShieldAlert, Zap, TrendingUp, Filter, Sparkles, HelpCircle, AlertTriangle } from 'lucide-react';`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
