import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/[^"]+"/g;
const matches = [...code.matchAll(regex)].map(m => m[0]);
console.log(matches);
