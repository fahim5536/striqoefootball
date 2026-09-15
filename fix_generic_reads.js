import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `app.get("/api/:collection", async (req, res, next) => {
     return requireAuth(req, res, () => {
       if ((req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: "Forbidden: Generic collection reads are restricted to Admins." });
       }
       next();
     });
}, async (req: any, res: any) => {`,
  `app.get("/api/:collection", async (req, res, next) => {
  const restrictedCollections = ['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks', 'logs', 'users', 'settings'];
  if (restrictedCollections.includes(req.params.collection)) {
     return requireAuth(req, res, () => {
       if ((req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: "Forbidden" });
       }
       next();
     });
  }
  next();
}, async (req: any, res: any) => {`
);

code = code.replace(
  `app.get("/api/:collection/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection reads are restricted to Admins." });
  }
  try {`,
  `app.get("/api/:collection/:id", async (req, res, next) => {
  const restrictedCollections = ['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks', 'logs', 'users', 'settings'];
  if (restrictedCollections.includes(req.params.collection)) {
     return requireAuth(req, res, () => {
       if ((req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: "Forbidden" });
       }
       next();
     });
  }
  next();
}, async (req: any, res: any) => {
  try {`
);

fs.writeFileSync('server.ts', code);
