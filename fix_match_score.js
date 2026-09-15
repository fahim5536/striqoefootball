import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `    // Submit scores
    for (const score of scores) {
      await prisma.matchScore.upsert({
        where: {
          matchId_participantId_gameNumber: {
            matchId,
            participantId: score.participantId,
            gameNumber: score.gameNumber || 1
          }
        },
        update: {
          score: score.score,
          isVerified: false
        },
        create: {
          matchId,
          participantId: score.participantId,
          gameNumber: score.gameNumber || 1,
          score: score.score,
          isVerified: false
        }
      });
    }`,
  `    // Submit scores
    await prisma.$transaction(async (tx) => {
      for (const score of scores) {
        await tx.matchScore.upsert({
          where: {
            matchId_participantId_gameNumber: {
              matchId,
              participantId: score.participantId,
              gameNumber: score.gameNumber || 1
            }
          },
          update: {
            score: score.score,
            isVerified: false
          },
          create: {
            matchId,
            participantId: score.participantId,
            gameNumber: score.gameNumber || 1,
            score: score.score,
            isVerified: false
          }
        });
      }
    });`
);

fs.writeFileSync('server.ts', code);
