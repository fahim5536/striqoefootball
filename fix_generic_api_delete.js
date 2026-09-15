import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldDelete = `app.delete("/api/:collection/:id", async (req, res) => {`;
const newDelete = `app.delete("/api/:collection/:id", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }`;

if(code.includes(oldDelete)) {
    code = code.replace(oldDelete, newDelete);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed delete on generic collection');
}
