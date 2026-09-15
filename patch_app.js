import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(`import FeedbackModal from './components/FeedbackModal';`, 
`import FeedbackModal from './components/FeedbackModal';
import { ClientConfigProvider } from './contexts/ClientConfigContext';`);

code = code.replace(`<HelmetProvider>`, `<HelmetProvider>\n      <ClientConfigProvider>`);
code = code.replace(`</HelmetProvider>`, `</ClientConfigProvider>\n    </HelmetProvider>`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx");
