import fs from 'fs';

// 1. Fix Profile.tsx
let profile = fs.readFileSync('src/components/Profile.tsx', 'utf8');
const pLines = profile.split('\n');
let newPLines = [];
let i = 0;
while (i < pLines.length) {
  if (pLines[i].includes(') => unsubscribe();') && pLines[i-1].includes('/>')) {
    // We found the mangled part. We should replace the whole return block up to here with just `return () => unsubscribe();`
    // Go backwards to find `return (`
    let j = i;
    while (j >= 0 && !pLines[j].includes('return (')) {
      j--;
    }
    // Now j is the index of `return (`. We remove everything from j to i and insert `return () => unsubscribe();`
    newPLines.splice(newPLines.length - (i - j), (i - j));
    newPLines.push('    return () => unsubscribe();');
  } else {
    newPLines.push(pLines[i]);
  }
  i++;
}
fs.writeFileSync('src/components/Profile.tsx', newPLines.join('\n'));

// 2. Fix server.ts
let server = fs.readFileSync('server.ts', 'utf8');
const sLines = server.split('\n');
let newSLines = [];
let k = 0;
while (k < sLines.length) {
  if (sLines[k] === "'));" || sLines[k] === "'));\r") {
    // Append to previous line
    newSLines[newSLines.length - 1] += "\\n');";
  } else if (sLines[k] === "');" || sLines[k] === "');\r") {
    newSLines[newSLines.length - 1] += "\\n';";
  } else if (sLines[k].includes("join('") && sLines[k+1] && sLines[k+1].trim() === "'));") {
    // it's a join(' \n ')); case
    newSLines.push(sLines[k] + "\\n');");
    k++; // skip next
  } else if (sLines[k].includes("join('") && !sLines[k].includes("')")) {
    newSLines.push(sLines[k] + "\\n');");
    k++;
  } else {
    newSLines.push(sLines[k]);
  }
  k++;
}
fs.writeFileSync('server.ts', newSLines.join('\n'));
