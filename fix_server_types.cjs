const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'MatchParticipant: true // NOTE: Might be lowercase matchParticipant depending on schema, let\'s verify',
  'participants: true'
);
code = code.replace(
  'for (const participant of (match.MatchParticipant || match.matchParticipant || [])) {',
  'for (const participant of (match.participants || [])) {'
);

fs.writeFileSync('server.ts', code);
console.log('Fixed');
