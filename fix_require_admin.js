import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get("/api/feedbacks/all", requireAuth, requireAdmin, async (req: any, res: any) => {`;
const replace = `app.get("/api/feedbacks/all", requireAuth, async (req: any, res: any) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });`;

if (code.includes(target)) {
    code = code.replace(target, replace);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed requireAdmin error');
}
