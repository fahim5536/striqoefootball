import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `app.post("/api/:collection", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }

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
  }`,
  `app.post("/api/:collection", requireAuth, async (req, res) => {
  // Lock down generic collection mutation entirely to ADMIN roles for security.
  // Exception for feedbacks which users can create.
  if (req.params.collection === 'feedbacks') {
      // Allow players to create feedback
  } else if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection mutations are restricted to Admins." });
  }`
);

code = code.replace(
  `app.put("/api/:collection/:id", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }`,
  `app.put("/api/:collection/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection mutations are restricted to Admins." });
  }`
);

code = code.replace(
  `app.delete("/api/:collection/:id", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }`,
  `app.delete("/api/:collection/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection mutations are restricted to Admins." });
  }`
);

fs.writeFileSync('server.ts', code);
