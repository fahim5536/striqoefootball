import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const newErrorHandler = `
app.use(async (err: any, req: any, res: any, next: any) => {
  logger.error(\`Unhandled error: \${err.message}\`, { stack: err.stack, url: req.originalUrl });
  
  if (global.isAppReady) {
    try {
      const Sentry = require('@sentry/node');
      if (Sentry.isInitialized()) {
        Sentry.captureException(err);
      }
    } catch(e) {}
    
    try {
      await prisma.errorLog.create({
        data: {
          message: err.message,
          stack: err.stack,
          route: req.originalUrl,
          method: req.method,
          userId: req.user?.id,
          level: 'CRITICAL',
        }
      });
    } catch(dbErr) {
      logger.error('Failed to log error to DB:', dbErr);
    }
  }

  res.status(500).json({ error: "Internal Server Error" });
});
`;

code = code.replace(/app\.use\(\(err: any, req: any, res: any, next: any\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: "Internal Server Error" \}\);\n\}\);/, newErrorHandler.trim());

fs.writeFileSync('server.ts', code);
