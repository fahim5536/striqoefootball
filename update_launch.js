import fs from 'fs';
let pkg = fs.readFileSync('package.json', 'utf8');
pkg = pkg.replace(/"version": ".*"/, '"version": "2.0.0"');
fs.writeFileSync('package.json', pkg);

let meta = fs.readFileSync('metadata.json', 'utf8');
const data = JSON.parse(meta);
data.name = "STRIQO v2.0";
fs.writeFileSync('metadata.json', JSON.stringify(data, null, 2));
