import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    // Check duplicate using a transaction or unique constraint check
    const existing = await prisma.tournamentParticipant.findFirst({
      where: {
        tournamentId,
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(teamId ? [{ teamId }] : [])
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Already registered for this tournament." });
    }

    // You could also check tournament max participants here if available

    const data = await prisma.$transaction(async (tx) => {
      const tourney = await tx.tournament.findUnique({ where: { id: tournamentId }, include: { _count: { select: { participants: true } } } });
      if (!tourney) throw new Error("Tournament not found");
      
      if (tourney.maxParticipants && tourney._count.participants >= tourney.maxParticipants) {
        throw new Error("Tournament is full");
      }
      
      return await tx.tournamentParticipant.create({
        data: { tournamentId, userId, teamId }
      });
    });`,
  `    const data = await prisma.$transaction(async (tx) => {
      const existing = await tx.tournamentParticipant.findFirst({
        where: {
          tournamentId,
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(teamId ? [{ teamId }] : [])
          ]
        }
      });
  
      if (existing) {
        throw new Error("Already registered for this tournament.");
      }

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
