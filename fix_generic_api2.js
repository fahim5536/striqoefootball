import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const targetOld = `app.get("/api/feedbacks/all", requireAuth, requireAdmin, async (req: any, res: any) => {`;
const targetNew = `app.get("/api/feedbacks/all", requireAuth, async (req: any, res: any) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });`;

if(code.includes(targetOld)) {
    code = code.replace(targetOld, targetNew);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed requireAdmin on feedbacks/all');
}
