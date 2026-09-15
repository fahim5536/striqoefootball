import fs from 'fs';

let code = fs.readFileSync('prisma/schema.prisma', 'utf8');

code = code.replace(
  `  @@unique([tournamentId, userId])
  @@index([tournamentId])
}`,
  `  @@unique([tournamentId, userId])
  @@unique([tournamentId, teamId])
  @@index([tournamentId])
}`
);

fs.writeFileSync('prisma/schema.prisma', code);
