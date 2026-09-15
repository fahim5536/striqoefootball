import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const authLimiter = `
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth
  store: new MemoryStore(),
  message: { error: "Too many authentication requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
`;

code = code.replace(
  `app.use("/api", limiter);`,
  `app.use("/api", limiter);\n\n${authLimiter}`
);

code = code.replace(
  `app.post("/api/auth/register", async (req, res) => {`,
  `app.post("/api/auth/register", authLimiter, async (req, res) => {`
);

code = code.replace(
  `app.post("/api/auth/login", async (req, res) => {`,
  `app.post("/api/auth/login", authLimiter, async (req, res) => {`
);

fs.writeFileSync('server.ts', code);
