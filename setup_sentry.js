import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

// The project already has Sentry initialized if we look at src/lib/startup-validation.ts 
// But let's make sure error handlers are set up correctly

const sentryErrorHandler = `
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(\`Unhandled error: \${err.message}\`, { stack: err.stack, url: req.originalUrl });
  if (global.isAppReady) {
    try {
      const Sentry = require('@sentry/node');
      if (Sentry.isInitialized()) {
        Sentry.captureException(err);
      }
    } catch(e) {}
  }
  res.status(500).json({ error: "Internal Server Error" });
});
`;

if (!code.includes("Sentry.captureException")) {
    const errorHandlingOld = `app.use((err: any, req: any, res: any, next: any) => {
  logger.error(\`Unhandled error: \${err.message}\`);
  res.status(500).json({ error: "Internal Server Error" });
});`;

    if (code.includes(errorHandlingOld)) {
        code = code.replace(errorHandlingOld, sentryErrorHandler);
        fs.writeFileSync('server.ts', code);
        console.log("Sentry error handler updated");
    } else {
        // If not found, append to the end before startServer()
        code = code.replace("function startServer() {", sentryErrorHandler + "\nfunction startServer() {");
        fs.writeFileSync('server.ts', code);
        console.log("Sentry error handler inserted");
    }
} else {
    console.log("Sentry error handler already exists");
}
