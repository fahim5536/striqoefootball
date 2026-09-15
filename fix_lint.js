import fs from 'fs';
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
code = code.replace("import { useFeatureFlag } from '../contexts/ClientConfigContext';\n", "");
fs.writeFileSync('src/components/Dashboard.tsx', code);
