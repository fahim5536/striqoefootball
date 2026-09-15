const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'tournamentName: match.tournament?.name || "Tournament"',
  'tournamentName: match.tournament?.title || "Tournament"'
);

fs.writeFileSync('server.ts', code);
console.log('Fixed');
