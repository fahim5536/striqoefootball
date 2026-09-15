const fs = require('fs');

let code = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

// The block to remove:
// {partners.length > 0 && ( ... )}
const targetRegex = /\{partners\.length > 0 && \([\s\S]*?\}\)\}/;

code = code.replace(targetRegex, '');

fs.writeFileSync('src/components/Footer.tsx', code);
