import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
`app.use(cors({
  origin: "*", // Adjust for production based on CORS_ORIGIN
  credentials: true,
}));`,
`app.use(cors({
  origin: config.server.env === "production" ? config.security.corsOrigin : "*",
  credentials: true,
}));`
);
fs.writeFileSync('server.ts', code);
