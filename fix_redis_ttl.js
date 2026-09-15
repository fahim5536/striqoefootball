import fs from 'fs';
let code = fs.readFileSync('src/lib/search.service.ts', 'utf8');
code = code.replace('{ ex: 60 }', '{ ex: 300 }'); // Increase search cache to 5 minutes
fs.writeFileSync('src/lib/search.service.ts', code);

code = fs.readFileSync('src/lib/recommendation.service.ts', 'utf8');
code = code.replace('{ ex: 300 }', '{ ex: 900 }'); // Increase recommendation cache to 15 minutes
fs.writeFileSync('src/lib/recommendation.service.ts', code);
console.log('Fixed redis ttls');
