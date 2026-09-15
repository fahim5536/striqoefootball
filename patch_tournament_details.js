import fs from 'fs';
let code = fs.readFileSync('src/components/TournamentDetails.tsx', 'utf8');

code = code.replace(`import Bracket from './Bracket';`, 
`import Bracket from './Bracket';
import { useFeatureFlag } from '../contexts/ClientConfigContext';`);

code = code.replace(`  const { id } = useParams();\n  const [activeTab, setActiveTab] = useState('BRACKET');\n  const tabs = ['OVERVIEW', 'PARTICIPANTS', 'MATCHES', 'BRACKET', 'STANDINGS'];`,
`  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('BRACKET');
  const showAnalytics = useFeatureFlag('TOURNAMENT_ANALYTICS');
  const tabs = ['OVERVIEW', 'PARTICIPANTS', 'MATCHES', 'BRACKET', 'STANDINGS'];
  if (showAnalytics) {
    tabs.push('ANALYTICS');
  }`);

const tabContentReplace = `{activeTab === 'STANDINGS' && (`;
const newContent = `{activeTab === 'ANALYTICS' && (
            <div style={{ color: '#E2E8F0', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              <h2 style={{ fontFamily: '"Inter", sans-serif', fontSize: '24px', fontWeight: 700, color: '#00e5ff', marginBottom: '20px' }}>Beta: AI Tournament Analytics</h2>
              <p>Advanced player metrics, progression forecasting, and engagement trends. (Feature Flag: TOURNAMENT_ANALYTICS)</p>
            </div>
          )}
          
          {activeTab === 'STANDINGS' && (`;

code = code.replace(tabContentReplace, newContent);

fs.writeFileSync('src/components/TournamentDetails.tsx', code);
console.log("Patched TournamentDetails.tsx");
