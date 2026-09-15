import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `const data = await prisma.tournamentParticipant.create({
      data: { tournamentId, userId, teamId, status: "PENDING" }
    });`,
  `const data = await prisma.tournamentParticipant.create({
      data: { tournamentId, userId, teamId }
    });`
);

fs.writeFileSync('server.ts', code);
