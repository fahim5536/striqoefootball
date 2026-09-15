const fs = require('fs');

let pp = fs.readFileSync('src/components/PrivacyPolicy.tsx', 'utf8');
pp = pp.replace('{new Date().toLocaleDateString()}', 'August 24, 2026');
fs.writeFileSync('src/components/PrivacyPolicy.tsx', pp);

let tou = fs.readFileSync('src/components/TermsOfUse.tsx', 'utf8');
tou = tou.replace('{new Date().toLocaleDateString()}', 'August 24, 2026');
fs.writeFileSync('src/components/TermsOfUse.tsx', tou);

console.log("Dates patched");
