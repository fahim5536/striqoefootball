import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldPut = `app.put("/api/:collection/:id", async (req, res) => {`;
const newPut = `app.put("/api/:collection/:id", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }`;

if(code.includes(oldPut)) {
    code = code.replace(oldPut, newPut);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed put on generic collection');
}
