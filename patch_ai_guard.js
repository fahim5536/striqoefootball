import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /app\.post\("\/api\/ai\/analyze-match", requireAuth, async \(req, res\) => \{/g,
  `app.post("/api/ai/analyze-match", requireAuth, betaGuard('AI_FEATURES'), async (req, res) => {`
);

code = code.replace(
  /app\.post\("\/api\/ai\/ocr-verify", requireAuth, async \(req, res\) => \{/g,
  `app.post("/api/ai/ocr-verify", requireAuth, betaGuard('AI_FEATURES'), async (req, res) => {`
);

fs.writeFileSync('server.ts', code);
