import fs from 'fs';

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// The replacement added an extra import { useFeatureFlag } from '../contexts/ClientConfigContext';
// Let's clean up imports using regex
code = code.replace(
  /import \{ useFeatureFlag \} from '\.\.\/contexts\/ClientConfigContext';\nimport \{ useFeatureFlag \} from '\.\.\/contexts\/ClientConfigContext';/,
  "import { useFeatureFlag } from '../contexts/ClientConfigContext';"
);
fs.writeFileSync('src/components/Dashboard.tsx', code);
