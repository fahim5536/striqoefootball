import fs from 'fs';
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(`import RecommendationsSection from './RecommendationsSection';`, 
`import RecommendationsSection from './RecommendationsSection';
import { useRemoteConfig, useFeatureFlag } from '../contexts/ClientConfigContext';`);

code = code.replace(`export default function Dashboard() {`,
`export default function Dashboard() {
  const heroTitle = useRemoteConfig('hero_title', 'GLOBAL CHAMPIONSHIP WEEKEND');
  const showBanner = useFeatureFlag('SHOW_PROMO_BANNER');`);

code = code.replace(`          <h1 className="hero-heading" style={{ marginBottom: '32px', maxWidth: '700px' }}>
            GLOBAL CHAMPIONSHIP WEEKEND
          </h1>`, 
`          {showBanner && (
            <div style={{ background: '#00e5ff', color: '#000', padding: '12px 24px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block' }}>
              Special Event Active
            </div>
          )}
          <h1 className="hero-heading" style={{ marginBottom: '32px', maxWidth: '700px' }}>
            {heroTitle}
          </h1>`);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched Dashboard.tsx");
