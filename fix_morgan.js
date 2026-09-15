import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// I'll replace my added code with an updated morgan format
const oldReqId = `app.use((req: any, res: any, next: any) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

morgan.token('id', (req: any) => req.id);`;

const newReqId = `morgan.token('id', (req: any) => req.correlationId);`;

code = code.replace(oldReqId, newReqId);
fs.writeFileSync('server.ts', code);
