import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const betaSafetyMiddlewares = `
const betaGuard = (featureKey: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const flag = await prisma.featureFlag.findUnique({ where: { key: featureKey } });
      
      // If flag doesn't exist, allow it. If it exists but disabled, block it.
      if (flag && !flag.isEnabled) {
        return res.status(403).json({ error: "Feature is currently disabled." });
      }

      // If flag is BETA_ONLY, require isBetaUser or ADMIN
      if (flag && flag.isEnabled && flag.type === 'BETA_ONLY') {
        const u = req.user ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
        if (!u || (!u.isBetaUser && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN')) {
          return res.status(403).json({ error: "This feature is only available to Beta Testers." });
        }
      }

      // If flag is ADMIN_ONLY, require ADMIN
      if (flag && flag.isEnabled && flag.type === 'ADMIN_ONLY') {
        if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
          return res.status(403).json({ error: "This feature is only available to Administrators." });
        }
      }
      
      next();
    } catch(e) {
      next();
    }
  };
};
`;

code = code.replace(
  `// Security & Middleware`,
  `// Security & Middleware\n${betaSafetyMiddlewares}`
);

fs.writeFileSync('server.ts', code);
