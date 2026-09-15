const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('PushNotificationManager')) {
  code = code.replace(
    "import { ClientConfigProvider } from './contexts/ClientConfigContext';", 
    "import { ClientConfigProvider } from './contexts/ClientConfigContext';\nimport { PushNotificationManager } from './components/PushNotificationManager';"
  );
  
  code = code.replace(
    "<BrowserRouter>",
    "<BrowserRouter>\n        <PushNotificationManager />"
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx');
} else {
  console.log('Already patched');
}
