import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldAnalytics = `app.get("/api/analytics/users", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    // A simplified version of user growth over time.
    // In production, we'd use raw SQL with date_trunc for better grouping by day/month.
    const users = await prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    
    const growth: Record<string, number> = {};
    users.forEach(u => {
      const date = u.createdAt.toISOString().split('T')[0];
      growth[date] = (growth[date] || 0) + 1;
    });
    res.json({ growth });
  } catch (e: any) {
    logger.error("User Analytics Error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const newAnalytics = `app.get("/api/analytics/users", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const rawResult = await prisma.$queryRaw\`
      SELECT DATE_TRUNC('day', "createdAt") as date, count(id)::int as count 
      FROM "User" 
      GROUP BY DATE_TRUNC('day', "createdAt") 
      ORDER BY date ASC 
      LIMIT 365
    \`;
    
    const growth: Record<string, number> = {};
    if (Array.isArray(rawResult)) {
      rawResult.forEach((row: any) => {
        if (row.date) {
           const dateStr = new Date(row.date).toISOString().split('T')[0];
           growth[dateStr] = row.count;
        }
      });
    }
    res.json({ growth });
  } catch (e: any) {
    logger.error("User Analytics Error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

code = code.replace(oldAnalytics, newAnalytics);
fs.writeFileSync('server.ts', code);
console.log('Fixed analytics');
