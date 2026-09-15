import fs from 'fs';
let code = fs.readFileSync('metadata.json', 'utf8');
const data = JSON.parse(code);
data.name = "STRIQO v1.90 Release Candidate";
fs.writeFileSync('metadata.json', JSON.stringify(data, null, 2));
