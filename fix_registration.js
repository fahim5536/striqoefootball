import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    const data = await prisma.tournamentParticipant.create({
      data: { tournamentId, userId, teamId }
    });`,
  `    const data = await prisma.$transaction(async (tx) => {
      const tourney = await tx.tournament.findUnique({ where: { id: tournamentId }, include: { _count: { select: { participants: true } } } });
      if (!tourney) throw new Error("Tournament not found");
      
      if (tourney.maxParticipants && tourney._count.participants >= tourney.maxParticipants) {
        throw new Error("Tournament is full");
      }
      
      return await tx.tournamentParticipant.create({
        data: { tournamentId, userId, teamId }
      });
    });`
);

fs.writeFileSync('server.ts', code);
