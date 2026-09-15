const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/Navbar.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ Bell, CircleUserRound, Menu, X \} from 'lucide-react';/, "import { Bell, CircleUserRound, Menu, X, Trophy, AlertTriangle } from 'lucide-react';");
content = content.replace(/'🏆'/g, "<Trophy size={16} />");
content = content.replace(/'⚠️'/g, "<AlertTriangle size={16} />");
content = content.replace(/>✕</g, "><X size={24} /><");

fs.writeFileSync(file, content);
