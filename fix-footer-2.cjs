const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf-8');

const strStart = `{partners.length > 0 && (`;
const strEnd = `          )}`;

const startIndex = code.indexOf(strStart);
const endIndex = code.indexOf(strEnd, startIndex) + strEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
    code = code.slice(0, startIndex) + code.slice(endIndex);
    fs.writeFileSync('src/components/Footer.tsx', code);
    console.log("Replaced successfully");
} else {
    console.log("Not found");
}

