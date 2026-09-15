import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldPost = `app.post("/api/:collection", async (req, res) => {`;
const newPost = `app.post("/api/:collection", requireAuth, async (req, res) => {
  if (['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks'].includes(req.params.collection) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden" });
  }`;

if(code.includes(oldPost)) {
    code = code.replace(oldPost, newPost);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed post on generic collection');
}
