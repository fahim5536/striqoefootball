import fs from 'fs';
let code = fs.readFileSync('dist/server.cjs', 'utf8');
const regex = /app\.post\("\/api\/:collection",/g;
const matches = [...code.matchAll(regex)].map(m => m[0]);
console.log("POST api/:collection matches:", matches.length);

const regex2 = /app\.post\("\/api\/[^"]+"/g;
const matches2 = [...code.matchAll(regex2)].map(m => m[0]);
console.log("All POST routes in dist/server.cjs:", matches2);
