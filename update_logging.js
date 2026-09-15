import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

// Add crypto import if missing
if (!code.includes("import crypto from 'crypto';")) {
  code = code.replace('import express', "import crypto from 'crypto';\nimport express");
}

// Add Request ID middleware
const reqIdMiddleware = `
app.use((req: any, res: any, next: any) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

morgan.token('id', (req: any) => req.id);
app.use(morgan('[:id] :method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message) => logger.info(message.trim()) }
}));
`;

// Replace the old morgan setup
const oldMorgan = `app.use(morgan("combined", {
  stream: { write: (message) => logger.info(message.trim()) }
}));`;

if (code.includes(oldMorgan)) {
  code = code.replace(oldMorgan, reqIdMiddleware);
  fs.writeFileSync('server.ts', code);
  console.log('Logging updated');
} else {
  console.log('Old morgan not found');
}
