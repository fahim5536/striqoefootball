const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const notificationCode = `
  // Match Notification Job (Every 1 Minute)
  setInterval(async () => {
    try {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
      
      const upcomingMatches = await prisma.match.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            gt: now,
            lte: fifteenMinutesFromNow
          }
        },
        include: {
          tournament: true,
          MatchParticipant: true // NOTE: Might be lowercase matchParticipant depending on schema, let's verify
        }
      });

      const redis = getRedis();

      for (const match of upcomingMatches) {
        const notifiedKey = \`notified_match_soon_\${match.id}\`;
        const alreadyNotified = await redis.get(notifiedKey);
        
        if (!alreadyNotified) {
          // Send notifications
          for (const participant of (match.MatchParticipant || match.matchParticipant || [])) {
            if (participant.userId) {
              io.to(\`user:\${participant.userId}\`).emit("match_starting_soon", {
                matchId: match.id,
                tournamentName: match.tournament?.name || "Tournament",
                scheduledAt: match.scheduledAt
              });
            }
          }
          
          // Mark as notified for 30 minutes
          await redis.set(notifiedKey, "1", { ex: 1800 });
        }
      }
    } catch (error) {
      logger.error("Error checking for upcoming matches:", error);
    }
  }, 60000);
`;

const anchor = `  const serverProcess = httpServer.listen(PORT, "0.0.0.0", () => {`;

if (serverCode.includes(anchor)) {
  serverCode = serverCode.replace(anchor, notificationCode + '\n' + anchor);
  fs.writeFileSync('server.ts', serverCode);
  console.log('Success');
} else {
  console.log('Anchor not found');
}
