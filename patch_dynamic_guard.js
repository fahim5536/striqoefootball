import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const dynamicGuard = `
  if (['tournaments', 'matches'].includes(req.params.collection)) {
    const flag = await prisma.featureFlag.findUnique({ where: { key: 'CREATE_' + req.params.collection.toUpperCase() } });
    if (flag) {
      if (!flag.isEnabled) return res.status(403).json({ error: "Feature is currently disabled." });
      if (flag.type === 'BETA_ONLY') {
        const u = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!u || (!u.isBetaUser && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN')) {
          return res.status(403).json({ error: "This feature is only available to Beta Testers." });
        }
      }
      if (flag.type === 'ADMIN_ONLY' && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: "This feature is only available to Administrators." });
      }
    }
  }
`;

code = code.replace(
  `app.post("/api/:collection", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }`,
  `app.post("/api/:collection", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }\n${dynamicGuard}`
);

fs.writeFileSync('server.ts', code);
