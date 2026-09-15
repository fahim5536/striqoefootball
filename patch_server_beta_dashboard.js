import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const betaDashboardRoute = `
app.get("/api/admin/beta/dashboard-stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [betaUsers, invites, feedbackOpen, bugsOpen, criticalErrors] = await Promise.all([
      prisma.user.count({ where: { isBetaUser: true } }),
      prisma.betaInvitation.count({ where: { status: 'ACTIVE' } }),
      prisma.feedback.count({ where: { status: 'OPEN' } }),
      prisma.feedback.count({ where: { type: 'BUG', status: 'OPEN' } }),
      prisma.errorLog.count({ where: { resolved: false, level: 'CRITICAL' } })
    ]);

    const recentErrors = await prisma.errorLog.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      betaUsers,
      invites,
      feedbackOpen,
      bugsOpen,
      criticalErrors,
      recentErrors
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
`;

code = code.replace(
  `// ==========================================
// BETA MANAGEMENT API
// ==========================================`,
  `// ==========================================
// BETA MANAGEMENT API
// ==========================================
${betaDashboardRoute}`
);

fs.writeFileSync('server.ts', code);
