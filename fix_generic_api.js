import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const postApiOld = `app.post("/api/:collection", async (req, res) => {
  try {
    const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
    const data = await (model as any).create({ data: req.body });
    res.json(data);
  } catch (e: any) {
    logger.error("Create collection error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const postApiNew = `app.post("/api/:collection", requireAuth, async (req, res) => {
  try {
    const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
    
    // Inject userId if appropriate and not provided
    const body = { ...req.body };
    if (['feedbacks', 'tournaments', 'teams'].includes(req.params.collection) && !body.userId) {
       body.userId = req.user.id;
    }
    
    // Admin check for some collections
    if (['featureFlags', 'remoteConfigs', 'experiments'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Forbidden" });
    }

    const data = await (model as any).create({ data: body });
    res.json(data);
  } catch (e: any) {
    logger.error("Create collection error:", e);
    res.status(500).json({ error: e.message });
  }
});`;


const putApiOld = `app.put("/api/:collection/:id", async (req, res) => {
  try {
    const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
    const data = await (model as any).update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(data);
  } catch (e: any) {
    logger.error("Update collection error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const putApiNew = `app.put("/api/:collection/:id", requireAuth, async (req, res) => {
  try {
    const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
    
    // Admin check for some collections
    if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Forbidden" });
    }

    const data = await (model as any).update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(data);
  } catch (e: any) {
    logger.error("Update collection error:", e);
    res.status(500).json({ error: e.message });
  }
});`;

const getAuthOld = `app.get("/api/:collection", async (req, res) => {`;
const getAuthNew = `app.get("/api/:collection", async (req, res, next) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection)) {
     return requireAuth(req, res, () => {
       if ((req as any).user.role !== 'ADMIN') {
         return res.status(403).json({ error: "Forbidden" });
       }
       next();
     });
  }
  next();
}, async (req: any, res: any) => {`;

code = code.replace(postApiOld, postApiNew);
code = code.replace(putApiOld, putApiNew);
code = code.replace(getAuthOld, getAuthNew);

// Fix feedback/all endpoint logic
const feedbackAllEndpoint = `
app.get("/api/feedbacks/all", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const data = await prisma.feedback.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
`;

if (!code.includes("/api/feedbacks/all")) {
  code = code.replace("app.get(\"/api/teams/my\"", feedbackAllEndpoint + "app.get(\"/api/teams/my\"");
}


fs.writeFileSync('server.ts', code);
console.log('Fixed generic endpoints security');
