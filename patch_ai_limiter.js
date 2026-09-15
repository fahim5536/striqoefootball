import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const aiLimiter = `
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour for AI
  store: new MemoryStore(),
  message: { error: "Too many AI requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
`;

code = code.replace(
  `const authLimiter = rateLimit({`,
  `${aiLimiter}\nconst authLimiter = rateLimit({`
);

code = code.replace(
  `app.post("/api/ai/analyze-match", requireAuth, betaGuard('AI_FEATURES'), async (req, res) => {`,
  `app.post("/api/ai/analyze-match", requireAuth, aiLimiter, betaGuard('AI_FEATURES'), async (req, res) => {`
);

code = code.replace(
  `app.post("/api/ai/ocr-verify", requireAuth, betaGuard('AI_FEATURES'), async (req, res) => {`,
  `app.post("/api/ai/ocr-verify", requireAuth, aiLimiter, betaGuard('AI_FEATURES'), async (req, res) => {`
);

fs.writeFileSync('server.ts', code);
