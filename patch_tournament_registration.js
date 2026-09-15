import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const customRegistration = `
app.post("/api/tournamentParticipants", requireAuth, async (req, res) => {
  try {
    const { tournamentId, userId, teamId } = req.body;
    if (!tournamentId) return res.status(400).json({ error: "Tournament ID required" });
    if (!userId && !teamId) return res.status(400).json({ error: "User ID or Team ID required" });

    // Validate if the user is authorized to register
    if (userId && userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Cannot register another user." });
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team || (team.captainId !== req.user.id && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: "Only team captains can register their team." });
      }
    }

    // Check duplicate using a transaction or unique constraint check
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

    const data = await prisma.tournamentParticipant.create({
      data: { tournamentId, userId, teamId, status: "PENDING" }
    });
    
    io.emit(\`tournamentParticipants:created\`, data);
    res.json(data);
  } catch (e: any) {
    logger.error("Tournament registration error:", e);
    res.status(500).json({ error: e.message });
  }
});
`;

code = code.replace(
  `app.post("/api/:collection", requireAuth, async (req, res) => {`,
  `${customRegistration}\napp.post("/api/:collection", requireAuth, async (req, res) => {`
);

fs.writeFileSync('server.ts', code);
