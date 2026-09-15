import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    const match = await prisma.match.update({
      where: { id: matchId },
      data: updateData
    });
    if (status === 'COMPLETED' || status === 'WALKOVER') {
      if (winnerId) {
        await prisma.matchResult.upsert({
          where: { matchId },
          update: { winnerId, isWalkover: status === 'WALKOVER' },
          create: {
            matchId,
            winnerId,
            isWalkover: status === 'WALKOVER'
          }
        });
        await prisma.matchParticipant.updateMany({
          where: { matchId, id: winnerId },
          data: { isWinner: true }
        });
        await prisma.matchParticipant.updateMany({
          where: { matchId, id: { not: winnerId } },
          data: { isWinner: false }
        });
      }
    }
    res.json(match);`,
  `    const match = await prisma.$transaction(async (tx) => {
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: updateData
      });
      if (status === 'COMPLETED' || status === 'WALKOVER') {
        if (winnerId) {
          await tx.matchResult.upsert({
            where: { matchId },
            update: { winnerId, isWalkover: status === 'WALKOVER' },
            create: {
              matchId,
              winnerId,
              isWalkover: status === 'WALKOVER'
            }
          });
          await tx.matchParticipant.updateMany({
            where: { matchId, id: winnerId },
            data: { isWinner: true }
          });
          await tx.matchParticipant.updateMany({
            where: { matchId, id: { not: winnerId } },
            data: { isWinner: false }
          });
        }
      }
      return updatedMatch;
    });
    res.json(match);`
);

fs.writeFileSync('server.ts', code);
