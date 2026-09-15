import slugify from 'slugify';
import fs from 'fs';
import { swaggerUi, swaggerDocument } from "./src/lib/swagger";
import crypto from 'crypto';
import express from "express";
import { PrismaClient } from "@prisma/client";
declare global {
  namespace NodeJS {
    interface Global {
      isAppReady: boolean;
    }
  }
  var isAppReady: boolean;
  namespace Express {
    interface Request {
      isAppReady?: boolean;
      user?: any;
    }
  }
}
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { getPrisma } from "./services";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import compression from "compression";
import hpp from "hpp";
import xss from "xss";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit, { MemoryStore } from "express-rate-limit";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
// Load configuration
import { config, validateConfig } from "./config";
import { validateServices } from "./src/lib/startup-validation";
import { logger } from "./logger";
dotenv.config();
// Validate env vars before starting
validateConfig();
// Set Timezone
process.env.TZ = config.server.timezone;
// Polyfill for BigInt JSON serialization
if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () { return this.toString(); };
}
const app = express();
app.set("trust proxy", 1); 
// Observability & SOC Middleware
app.use((req, res, next) => {
  (req as any).correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('X-Correlation-ID', ((req as any).correlationId));
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const latency = (diff[0] * 1e3 + diff[1] * 1e-6);
    
    // Log slow queries/API requests
    if (latency > 1000) {
      console.warn(`[SLOW API] ${req.method} ${req.originalUrl} took ${latency.toFixed(2)}ms (CorrelationID: ${(req as any).correlationId})`);
    }
    
    // Asynchronously save metric
    if (global.isAppReady) {
      prisma.systemMetric.create({
        data: {
          category: 'API_LATENCY',
          name: `${req.method} ${req.route ? req.route.path : req.path}`,
          value: latency,
          unit: 'ms',
          tags: JSON.stringify({ status: res.statusCode })
        }
      }).catch(err => console.error("Failed to save metric", err));
    }
  });
  next();
});
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const prisma = getPrisma();
// Port resolution: Defaults to process.env.PORT or 5000 in production (Render, Railway, Docker),
// while maintaining port 3000 in development container environments behind reverse proxy.
const PORT = process.env.NODE_ENV === 'production'
  ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 5000)
  : 3000;
// Initialize Sentry Backend conditionally
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
  // Sentry request handler must be the first middleware
  Sentry.setupExpressErrorHandler(app);
}
// Security & Middleware

const betaGuard = (featureKey: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const flag = await prisma.featureFlag.findUnique({ where: { key: featureKey } });
      
      // If flag doesn't exist, allow it. If it exists but disabled, block it.
      if (flag && !flag.isEnabled) {
        return res.status(403).json({ error: "Feature is currently disabled." });
      }

      // If flag is BETA_ONLY, require isBetaUser or ADMIN
      if (flag && flag.isEnabled && flag.type === 'BETA_ONLY') {
        const u = req.user ? await prisma.user.findUnique({ where: { id: req.user.id } }) : null;
        if (!u || (!u.isBetaUser && u.role !== 'ADMIN' && u.role !== 'SUPER_ADMIN')) {
          return res.status(403).json({ error: "This feature is only available to Beta Testers." });
        }
      }

      // If flag is ADMIN_ONLY, require ADMIN
      if (flag && flag.isEnabled && flag.type === 'ADMIN_ONLY') {
        if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN')) {
          return res.status(403).json({ error: "This feature is only available to Administrators." });
        }
      }
      
      next();
    } catch(e) {
      next();
    }
  };
};

// Environment and static directory detection for production (Render, Railway, Docker, Vercel)
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  Boolean(process.env.RENDER_SERVICE_ID) ||
  Boolean(process.env.RAILWAY_ENVIRONMENT) ||
  Boolean(process.env.VERCEL) ||
  (process.env.NODE_ENV !== 'development' && fs.existsSync(path.resolve(process.cwd(), 'dist', 'index.html')));

// Resilient static directory resolution across root and bundled dist/ environments
const getDistPath = () => {
  const candidates = [
    path.resolve(process.cwd(), 'dist'),
    typeof __dirname !== 'undefined' ? path.resolve(__dirname, 'dist') : '',
    typeof __dirname !== 'undefined' ? __dirname : '',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }
  return path.resolve(process.cwd(), 'dist');
};

const distPath = getDistPath();

app.use(helmet({
  contentSecurityPolicy: false, // Ensures React/Vite scripts, CSS, fonts, and WebSocket connections are never blocked
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false, // Critical: Prevents 403 Forbidden on static assets served across cloud origins/proxies
}));
app.use(compression());
app.use(hpp()); // Prevent HTTP Parameter Pollution
// XSS Sanitization Middleware
const sanitizeInput = (req: any, res: any, next: any) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key] as string);
      }
    }
  }
  next();
};
app.use(sanitizeInput);

// Permissive CORS to allow *.onrender.com, custom domains, and local development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

app.use(express.json());
app.use(cookieParser(config.auth.cookieSecret));

morgan.token('id', (req: any) => req.correlationId);
app.use(morgan('[:id] :method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// --- STATIC ASSET SERVING & WILDCARD SPA ROUTING (PLACED BEFORE AUTH & RATE LIMITING) ---
let viteMiddleware: any = null;

const renderSpa = async (req: any, res: any, next: any) => {
  // Explicitly skip API routes, socket.io, and special crawlers
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/socket.io') ||
    req.path === '/robots.txt' ||
    req.path === '/sitemap.xml'
  ) {
    return next();
  }

  const indexTemplatePath = path.join(distPath, 'index.html');
  try {
    if (!fs.existsSync(indexTemplatePath)) {
      return res.status(503).send("Production assets not built yet. Run 'npm run build' first.");
    }
    let html = fs.readFileSync(indexTemplatePath, 'utf8');
    let title = 'STRIQO | Premium Esports Platform';
    let description = 'Compete in top-tier esports tournaments, join teams, and climb the leaderboard on STRIQO.';
    let image = 'https://striqo.com/og-image.jpg';
    if (req.path.startsWith('/tournaments/') && req.path.split('/').length === 3) {
      const id = req.path.split('/')[2];
      const t = await prisma.tournament.findUnique({ where: { id } }).catch(() => null);
      if (t) {
        title = `${t.title || 'Tournament'} | STRIQO`;
        description = t.description || `Join the ${t.title} tournament on STRIQO.`;
      }
    } else if (req.path === '/profile' && req.query.uid) {
      const u = await prisma.user.findUnique({ where: { id: req.query.uid as string } }).catch(() => null);
      if (u) {
        title = `${u.username}'s Profile | STRIQO`;
        description = `Check out ${u.username}'s esports profile, stats, and match history.`;
      }
    } else if (req.path === '/leaderboard') {
      title = 'Global Leaderboard | STRIQO';
      description = 'Check out the top-ranked players and teams on STRIQO. Climb the ladder and prove your skills.';
    }
    const metaTags = `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:url" content="${'https://striqo.com' + req.originalUrl}" />
      <meta name="twitter:card" content="summary_large_image" />
    `;
    
    html = html.replace(/<title>.*<\/title>/, '');
    html = html.replace('</head>', metaTags + '</head>');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    if (fs.existsSync(indexTemplatePath)) {
      res.sendFile(indexTemplatePath);
    } else {
      res.status(500).send("Internal Server Error loading application entrypoint.");
    }
  }
};

if (isProduction) {
  // 1. Deliver static assets (JS, CSS, images, icons, fonts) publicly with caching (index: false allows dynamic SEO on /)
  app.use(express.static(distPath, { maxAge: '1y', index: false }));
  // 2. Wildcard SPA handler for client routes (/tournaments, /leaderboard, etc.) - placed BEFORE rate-limiting & auth
  app.get('*', renderSpa);
} else {
  // In development, forward client requests to Vite development middleware
  app.use((req: any, res: any, next: any) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/socket.io') ||
      req.path === '/robots.txt' ||
      req.path === '/sitemap.xml'
    ) {
      return next();
    }
    if (viteMiddleware) {
      return viteMiddleware(req, res, next);
    }
    next();
  });
}

// Rate Limiter
const limiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMax,
  store: new MemoryStore(), // Fallback to MemoryStore since Upstash REST LUA scripts fail with rate-limit-redis
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false, forwardedHeader: false } // Disable warnings
});
app.use("/api", limiter);



const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 requests per hour for AI
  store: new MemoryStore(),
  message: { error: "Too many AI requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});


const generateUiId = async () => {
  let id = '';
  let exists = true;
  while (exists) {
    id = Math.floor(1000 + Math.random() * 9000).toString();
    const user = await prisma.user.findUnique({ where: { uiId: id } });
    if (!user) exists = false;
  }
  return id;
};
  
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth
  store: new MemoryStore(),
  message: { error: "Too many authentication requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = config.auth.jwtSecret;
const JWT_REFRESH_SECRET = config.auth.jwtRefreshSecret;
// Auth Routes - Robust JWT verification with safe error messages
export const requireAuth = async (req: any, res: any, next: any) => {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader.split(" ")[1] || authHeader;
    } else if (req.query.token) {
      token = String(req.query.token);
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Access token is missing." });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr: any) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Token expired. Please sign in again." });
      }
      return res.status(401).json({ error: "Invalid authentication token signature." });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: "Invalid token payload structure." });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ error: "Authenticated user account no longer exists." });
    }

    req.user = user;
    next();
  } catch (e: any) {
    logger.error("Authentication middleware failure:", e);
    res.status(401).json({ error: "Authentication failed." });
  }
};
// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "Striqo API Docs",
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const { email, password, username, betaCode } = req.body;
    
    // Check if beta restriction is enabled via feature flag
    const betaFlag = await prisma.featureFlag.findUnique({ where: { key: 'BETA_ONLY' } });
    const isBetaOnly = betaFlag?.isEnabled ?? true; // Default to true for closed beta

    let betaInvite = null;
    if (isBetaOnly) {
      if (!betaCode) {
        return res.status(403).json({ error: "A valid beta invitation code is required for registration." });
      }
      
      betaInvite = await prisma.betaInvitation.findUnique({ where: { code: betaCode } });
      if (!betaInvite) {
        return res.status(403).json({ error: "Invalid beta code." });
      }
      if (betaInvite.status !== 'ACTIVE') {
        return res.status(403).json({ error: "This beta code has been revoked or is inactive." });
      }
      if (betaInvite.expiresAt && new Date() > betaInvite.expiresAt) {
        return res.status(403).json({ error: "This beta code has expired." });
      }
      if (betaInvite.uses >= betaInvite.maxUses) {
        return res.status(403).json({ error: "This beta code has reached its maximum number of uses." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);
    
    // Create user
    const uiId = await generateUiId();
      const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        isBetaUser: isBetaOnly ? true : false,
        betaCodeUsed: betaCode || null,
      }
    });

    // Update beta invite usage
    if (betaInvite) {
      await prisma.betaInvitation.update({
        where: { id: betaInvite.id },
        data: { uses: { increment: 1 } }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: config.auth.jwtExpiresIn as any });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: config.auth.jwtRefreshExpiresIn as any });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.server.env === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({ token, user });
  } catch (e: any) {
    logger.error("Registration error:", e);
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const userExists = await prisma.user.findUnique({ where: { email } });
    
    if (userExists) {
      // Check for lockout
      const recentFails = await prisma.securityEvent.count({
        where: {
          userId: userExists.id,
          eventType: "LOGIN_FAILED",
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 mins
        }
      });
      if (recentFails >= 5) {
        await prisma.securityEvent.create({
          data: {
            userId: userExists.id,
            eventType: "LOCKOUT",
            severity: "HIGH",
            description: "Account locked out due to multiple failed login attempts",
            ipAddress: req.ip || req.headers['x-forwarded-for']?.toString(),
            userAgent: req.headers['user-agent']
          }
        });
        return res.status(429).json({ error: "Account temporarily locked due to too many failed attempts. Try again later." });
      }
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid password" });
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: config.auth.jwtExpiresIn as any });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: config.auth.jwtRefreshExpiresIn as any });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.server.env === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({ token, user });
  } catch (e: any) {
    logger.error("Login error:", e);
    res.status(400).json({ error: e.message });
  }
});
app.get("/api/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token" });
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    res.json({ user });
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});
// -----------------------------------------
// AI FEATURES & AUTOMATION ROUTES
// -----------------------------------------
import { getAi, getVisionClient, getRedis } from "./services";
const checkAiQuota = async (userId, tokensToConsume = 0) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Check or create usage record
    const usage = await prisma.aIUsage.upsert({
      where: { userId_month: { userId, month: currentMonth } },
      update: { tokensUsed: { increment: tokensToConsume }, requestsCount: { increment: 1 } },
      create: { userId, month: currentMonth, tokensUsed: tokensToConsume, requestsCount: 1 }
    });
    const quota = await prisma.aIQuota.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });
    if (usage.tokensUsed > quota.monthlyLimit) {
      throw new Error("AI quota exceeded for this month.");
    }
    return true;
  } catch (error) {
    logger.error("Quota check failed:", error);
    throw error;
  }
};
app.post("/api/ai/analyze-match", requireAuth, aiLimiter, betaGuard('AI_FEATURES'), async (req, res) => {
  try {
    const { matchId } = req.body;
    
    // Check cache
    const redis = getRedis();
    const cacheKey = `ai:match:analysis:${matchId}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json({ result: cached, cached: true });
    }
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        participants: { include: { user: true, team: true } },
        scores: true,
        results: true
      }
    });
    if (!match) return res.status(404).json({ error: "Match not found" });
    await checkAiQuota(req.user.id, 100);
    // Prepare prompt
    const prompt = `Analyze this eFootball match data and provide a concise 3-sentence summary of the performance: ${JSON.stringify(match)}`;
    const aiRequest = await prisma.aIRequest.create({
      data: {
        userId: req.user.id,
        type: 'MATCH_ANALYSIS',
        prompt,
        status: 'PROCESSING'
      }
    });
    try {
      const ai = getAi();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      const analysisText = response.text;
      await prisma.aIRequest.update({
        where: { id: aiRequest.id },
        data: {
          status: 'COMPLETED',
          response: analysisText,
          tokensUsed: 150 // estimate or get from usageMetadata if available
        }
      });
      const analysis = await prisma.aIAnalysis.create({
        data: {
          targetId: matchId,
          targetType: 'MATCH',
          content: analysisText
        }
      });
      if (redis) {
        await redis.set(cacheKey, analysisText, { ex: 86400 }); // cache for 1 day
      }
      res.json({ result: analysisText, cached: false });
    } catch (apiError) {
      await prisma.aIRequest.update({
        where: { id: aiRequest.id },
        data: { status: 'FAILED', errorMessage: apiError.message }
      });
      throw apiError;
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/ai/ocr-verify", requireAuth, aiLimiter, betaGuard('AI_FEATURES'), async (req, res) => {
  try {
    const { matchId, imageUrl } = req.body;
    
    await checkAiQuota(req.user.id, 50);
    const scan = await prisma.oCRScan.create({
      data: {
        userId: req.user.id,
        matchId,
        imageUrl,
        status: 'PROCESSING'
      }
    });
    try {
      const ai = getAi();
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) throw new Error("Failed to download image for analysis");
      const arrayBuffer = await imageResp.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = imageResp.headers.get("content-type") || "image/jpeg";
      const prompt = `Analyze this eFootball match screenshot carefully. Extract the home and away scores. Return ONLY a JSON object with { "homeScore": number, "awayScore": number }.`;
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          { inlineData: { data: base64Data, mimeType } }
        ],
      });
      const extractedText = "Processed via Gemini Vision";
      const parsedData = aiResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const ocrResult = await prisma.oCRResult.create({
        data: {
          scanId: scan.id,
          extractedText,
          parsedData,
          confidence: 0.95
        }
      });
      await prisma.oCRScan.update({
        where: { id: scan.id },
        data: { status: 'COMPLETED' }
      });
      res.json({ ocrResult });
    } catch (apiError) {
      await prisma.oCRScan.update({
        where: { id: scan.id },
        data: { status: 'FAILED' }
      });
      throw apiError;
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// -----------------------------------------
// NEWSLETTER
// -----------------------------------------
app.post("/api/newsletter/subscribe", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true }
        });
      }
      return res.json({ success: true, message: "Already subscribed!" });
    }

    await prisma.newsletterSubscriber.create({
      data: { email }
    });

    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (e: any) {
    logger.error("Error subscribing to newsletter:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------
// TEAM & PLAYER MANAGEMENT ROUTES
// -----------------------------------------
app.post("/api/teams", requireAuth, async (req, res) => {
  try {
    const { name, slug, tag, description, logoUrl, bannerUrl } = req.body;
    const existing = await prisma.team.findFirst({
      where: { OR: [{ name }, { slug }] }
    });
    if (existing) return res.status(400).json({ error: "Team name or slug already exists" });
    const team = await prisma.team.create({
      data: {
        name, slug, tag, description, logoUrl, bannerUrl,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: "OWNER"
          }
        },
        statistics: {
          create: {}
        }
      }
    });
    
    const redis = getRedis();
    if (redis) {
      try {
        const keys = await redis.keys('search:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (err) {}
    }
    
    res.json(team);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/feedbacks/all", requireAuth, async (req: any, res: any) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
  try {
    const data = await prisma.feedback.findMany({
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/teams/my", requireAuth, async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: req.user.id }
        }
      },
      include: {
        members: { include: { user: { select: { id: true, username: true, avatarUrl: true } } } },
        statistics: true
      }
    });
    res.json(teams);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/teams/:id/invite", requireAuth, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { inviteeId, role } = req.body;
    
    // Check if inviter has permission
    const inviterMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.user.id } }
    });
    if (!inviterMember || (inviterMember.role !== 'OWNER' && inviterMember.role !== 'CAPTAIN' && inviterMember.role !== 'MANAGER')) {
      return res.status(403).json({ error: "Not authorized to invite" });
    }
    const existingInvite = await prisma.teamInvite.findFirst({
      where: { teamId, inviteeId, status: "PENDING" }
    });
    if (existingInvite) return res.status(400).json({ error: "Already invited" });
    const invite = await prisma.teamInvite.create({
      data: {
        teamId,
        inviterId: req.user.id,
        inviteeId,
        role: role || 'MEMBER'
      }
    });
    res.json(invite);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/teams/invites/:id/accept", requireAuth, async (req, res) => {
  try {
    const invite = await prisma.teamInvite.findUnique({ where: { id: req.params.id } });
    if (!invite) return res.status(404).json({ error: "Invite not found" });
    if (invite.inviteeId !== req.user.id) return res.status(403).json({ error: "Not authorized" });
    if (invite.status !== "PENDING") return res.status(400).json({ error: "Invite not pending" });
    await prisma.$transaction([
      prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" }
      }),
      prisma.teamMember.create({
        data: {
          teamId: invite.teamId,
          userId: req.user.id,
          role: invite.role
        }
      })
    ]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/teams/:id/request", requireAuth, async (req, res) => {
  try {
    const teamId = req.params.id;
    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: req.user.id } }
    });
    if (existingMember) return res.status(400).json({ error: "Already a member" });
    const existingRequest = await prisma.teamJoinRequest.findFirst({
      where: { teamId, userId: req.user.id, status: "PENDING" }
    });
    if (existingRequest) return res.status(400).json({ error: "Request already pending" });
    const joinRequest = await prisma.teamJoinRequest.create({
      data: {
        teamId,
        userId: req.user.id,
        notes: req.body.notes
      }
    });
    res.json(joinRequest);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/teams/requests/:id/approve", requireAuth, async (req, res) => {
  try {
    const joinRequest = await prisma.teamJoinRequest.findUnique({ where: { id: req.params.id } });
    if (!joinRequest) return res.status(404).json({ error: "Request not found" });
    if (joinRequest.status !== "PENDING") return res.status(400).json({ error: "Request not pending" });
    // Check if approver has permission
    const approverMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: joinRequest.teamId, userId: req.user.id } }
    });
    if (!approverMember || (approverMember.role !== 'OWNER' && approverMember.role !== 'CAPTAIN' && approverMember.role !== 'MANAGER')) {
      return res.status(403).json({ error: "Not authorized to approve" });
    }
    await prisma.$transaction([
      prisma.teamJoinRequest.update({
        where: { id: joinRequest.id },
        data: { status: "APPROVED" }
      }),
      prisma.teamMember.create({
        data: {
          teamId: joinRequest.teamId,
          userId: joinRequest.userId,
          role: "MEMBER"
        }
      })
    ]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/teams/:id/captain", requireAuth, async (req, res) => {
  try {
    const teamId = req.params.id;
    const { newCaptainId } = req.body;
    
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (team.ownerId !== req.user.id && team.captainId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const member = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: newCaptainId } }
    });
    if (!member) return res.status(400).json({ error: "Target user is not a member" });
    await prisma.$transaction([
      prisma.team.update({
        where: { id: teamId },
        data: { captainId: newCaptainId }
      }),
      prisma.teamMember.update({
        where: { id: member.id },
        data: { role: 'CAPTAIN' }
      })
    ]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/teams/:id/members/:userId", requireAuth, async (req, res) => {
  try {
    const teamId = req.params.id;
    const targetUserId = req.params.userId;
    
    // Allow users to leave, or admins to kick
    if (req.user.id !== targetUserId) {
      const execMember = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: req.user.id } }
      });
      if (!execMember || (execMember.role !== 'OWNER' && execMember.role !== 'CAPTAIN')) {
        return res.status(403).json({ error: "Not authorized to remove members" });
      }
    }
    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: targetUserId } }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Player Profiles
app.get("/api/player-profiles/:userId", async (req, res) => {
  try {
    let profile = await prisma.playerProfile.findUnique({
      where: { userId: req.params.userId }
    });
    let stats = await prisma.playerStatistics.findUnique({
      where: { userId: req.params.userId }
    });
    res.json({ profile, stats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/player-profiles", requireAuth, async (req, res) => {
  try {
    const { playstyle, preferredRoles, preferredAgents, hardware, gameSettings } = req.body;
    const profile = await prisma.playerProfile.upsert({
      where: { userId: req.user.id },
      update: { playstyle, preferredRoles, preferredAgents, hardware, gameSettings },
      create: {
        userId: req.user.id,
        playstyle, preferredRoles, preferredAgents, hardware, gameSettings
      }
    });
    res.json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// MATCH ENGINE & BRACKET ROUTES
// -----------------------------------------
app.post("/api/tournaments/:id/brackets", requireAuth, async (req, res) => {
  try {
    const tournamentId = req.params.id;
    const { type } = req.body;
    
    // Check if user is organizer
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament || tournament.organizerId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    // 1. Get approved participants
    const participants = await prisma.tournamentParticipant.findMany({
      where: { tournamentId }
    });
    
    if (participants.length < 2) {
      return res.status(400).json({ error: "Not enough participants" });
    }
    // 2. Create bracket
    const bracket = await prisma.bracket.create({
      data: {
        tournamentId,
        type: type || 'SINGLE_ELIMINATION'
      }
    });
    // 3. Create rounds & matches for single elimination
    const round = await prisma.round.create({
      data: {
        bracketId: bracket.id,
        roundNumber: 1,
        name: "Quarterfinals"
      }
    });
    const match = await prisma.match.create({
      data: {
        tournamentId,
        format: 'BO1',
        status: 'SCHEDULED'
      }
    });
    await prisma.roundMatch.create({
      data: {
        roundId: round.id,
        matchId: match.id,
        order: 1
      }
    });
    
    // Add participants to match
    if (participants.length >= 2) {
      await prisma.matchParticipant.create({
        data: {
          matchId: match.id,
          userId: participants[0].userId,
          teamId: participants[0].teamId
        }
      });
      await prisma.matchParticipant.create({
        data: {
          matchId: match.id,
          userId: participants[1].userId,
          teamId: participants[1].teamId
        }
      });
    }
    res.json({ success: true, bracket });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/matches/:id", async (req, res) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.id },
      include: {
        participants: {
          include: { user: true, team: true }
        },
        results: true,
        scores: true,
        events: true,
        timelines: true,
        statistics: true,
        rooms: true,
        lobbies: true,
        verifications: true
      }
    });
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json(match);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/matches/:id/score", requireAuth, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { scores } = req.body; // Array of { participantId, score, gameNumber }
    // Verify user is part of the match or referee
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { participants: true }
    });
    if (!match) return res.status(404).json({ error: "Match not found" });
    let isAuthorized = false;
    if (match.refereeId === req.user.id) {
      isAuthorized = true;
    } else {
      const userParticipant = match.participants.find(p => p.userId === req.user.id);
      if (userParticipant) isAuthorized = true;
      else {
        const teamIds = match.participants.map((p: any) => p.teamId).filter(Boolean);
        if (teamIds.length > 0) {
          const teamMemberCount = await prisma.teamMember.count({
            where: {
              userId: req.user.id,
              teamId: { in: teamIds }
            }
          });
          if (teamMemberCount > 0) {
            isAuthorized = true;
          }
        }
      }
    }
    if (!isAuthorized) return res.status(403).json({ error: "Not authorized to submit scores" });
    // Submit scores
    for (const score of scores) {
      await prisma.matchScore.upsert({
        where: {
          matchId_participantId_gameNumber: {
            matchId,
            participantId: score.participantId,
            gameNumber: score.gameNumber || 1
          }
        },
        update: { score: score.score },
        create: {
          matchId,
          participantId: score.participantId,
          score: score.score,
          gameNumber: score.gameNumber || 1
        }
      });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/matches/:id/verify", requireAuth, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { screenshotUrl, notes } = req.body;
    const verification = await prisma.matchVerification.create({
      data: {
        matchId,
        submittedById: req.user.id,
        screenshotUrl,
        notes
      }
    });
    res.json(verification);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/matches/:id/status", requireAuth, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { status, winnerId } = req.body; // status: COMPLETED, CANCELLED, WALKOVER, etc.
    
    const updateData: any = { status };
    if (status === 'ONGOING' && !req.body.startedAt) updateData.startedAt = new Date();
    if ((status === 'COMPLETED' || status === 'WALKOVER') && !req.body.endedAt) updateData.endedAt = new Date();
    const match = await prisma.$transaction(async (tx) => {
      const updatedMatch = await tx.match.update({
        where: { id: matchId },
        data: updateData
      });
      if (status === 'COMPLETED' || status === 'WALKOVER') {
        if (winnerId) {
          await tx.matchResult.upsert({
            where: { matchId },
            update: { winnerId, isWalkover: status === 'WALKOVER' },
            create: {
              matchId,
              winnerId,
              isWalkover: status === 'WALKOVER'
            }
          });
          await tx.matchParticipant.updateMany({
            where: { matchId, id: winnerId },
            data: { isWinner: true }
          });
          await tx.matchParticipant.updateMany({
            where: { matchId, id: { not: winnerId } },
            data: { isWinner: false }
          });
        }
      }
      return updatedMatch;
    });
    res.json(match);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/matches/:id/events", requireAuth, async (req, res) => {
  try {
    const matchId = req.params.id;
    const { participantId, eventType, description } = req.body;
    
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        participantId,
        eventType,
        description
      }
    });
    res.json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// LEADERBOARD, RANKING & STATISTICS ROUTES
// -----------------------------------------
app.get("/api/leaderboards/global", async (req, res) => {
  try {
    const { entityType } = req.query; // 'PLAYER' or 'TEAM'
    const type = (entityType || 'PLAYER') as any;
    
    let leaderboard: any = await prisma.leaderboard.findFirst({
      where: { type: 'GLOBAL', entityType: type },
      include: {
        entries: {
          orderBy: { score: 'desc' },
          take: 100,
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
            team: { select: { id: true, name: true, logoUrl: true, tag: true } }
          }
        }
      }
    });
    if (!leaderboard) {
      leaderboard = await prisma.leaderboard.create({
        data: {
          type: 'GLOBAL',
          entityType: type
        },
        include: { entries: true }
      });
    }
    res.json(leaderboard);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/rankings/players/:id", async (req, res) => {
  try {
    const ranking = await prisma.playerRanking.upsert({
      where: { userId: req.params.id },
      update: {},
      create: { userId: req.params.id }
    });
    res.json(ranking);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/rankings/teams/:id", async (req, res) => {
  try {
    const ranking = await prisma.teamRanking.upsert({
      where: { teamId: req.params.id },
      update: {},
      create: { teamId: req.params.id }
    });
    res.json(ranking);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/achievements/unlock", requireAuth, async (req, res) => {
  try {
    const { achievementId, type, teamId } = req.body; // type: 'PLAYER' or 'TEAM'
    
    if (type === 'TEAM') {
      if (!teamId) return res.status(400).json({ error: "teamId required" });
      const teamAchievement = await prisma.teamAchievement.create({
        data: {
          teamId,
          achievementId
        }
      });
      res.json(teamAchievement);
    } else {
      const playerAchievement = await prisma.playerAchievement.create({
        data: {
          userId: req.user.id,
          achievementId
        }
      });
      res.json(playerAchievement);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/users/:id/achievements", async (req, res) => {
  try {
    const achievements = await prisma.playerAchievement.findMany({
      where: { userId: req.params.id },
      include: { achievement: true }
    });
    res.json(achievements);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// NOTIFICATION & COMMUNICATION ROUTES
// -----------------------------------------
app.get("/api/notifications/my", requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(notifications);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() }
    });
    res.json(notification);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/notifications/read-all", requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/notification-preferences/my", requireAuth, async (req, res) => {
  try {
    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id }
    });
    res.json(prefs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put("/api/notification-preferences/my", requireAuth, async (req, res) => {
  try {
    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: req.user.id },
      update: req.body,
      create: { userId: req.user.id, ...req.body }
    });
    res.json(prefs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/inbox/my", requireAuth, async (req, res) => {
  try {
    const messages = await prisma.inboxMessage.findMany({
      where: { recipientId: req.user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } }
      }
    });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/inbox/send", requireAuth, async (req, res) => {
  try {
    const { recipientId, subject, content } = req.body;
    const message = await prisma.inboxMessage.create({
      data: {
        senderId: req.user.id,
        recipientId,
        subject,
        content
      }
    });
    res.json(message);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// MEDIA & FILE MANAGEMENT ROUTES
// -----------------------------------------
import multer from "multer";
import { getCloudinary } from "./services";
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, and WEBM are allowed.') as any, false);
    }
  }
});
const uploadToCloudinary = async (buffer: Buffer, folder: string = "striqo", context: string = "GENERAL"): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        context: `upload_context=${context}`
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};
app.post("/api/media/upload", requireAuth, upload.single("file"), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    
    const contextStr = req.body.context || "GENERAL";
    const result = await uploadToCloudinary(req.file.buffer, `striqo/users/${req.user.id}`, contextStr);
    
    let format = result.format || 'unknown';
    let type = 'OTHER';
    if (result.resource_type === 'image') type = 'IMAGE';
    if (result.resource_type === 'video') type = 'VIDEO';
    
    const media = await prisma.media.create({
      data: {
        userId: req.user.id,
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        thumbnailUrl: result.resource_type === 'image' ? getCloudinary().url(result.public_id, { width: 200, crop: "scale" }) : null,
        format: format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        type: type as any,
        context: contextStr as any,
        originalName: req.file.originalname,
        isPrivate: req.body.isPrivate === 'true'
      }
    });
    res.json(media);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/media/signature", requireAuth, async (req: any, res: any) => {
  try {
    const cloudinary = getCloudinary();
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `striqo/users/${req.user.id}`;
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      cloudinary.config().api_secret
    );
    
    res.json({
      signature,
      timestamp,
      folder,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/media/sync", requireAuth, async (req: any, res: any) => {
  try {
    const { publicId, url, secureUrl, format, width, height, bytes, resourceType, originalName, contextStr, isPrivate } = req.body;
    
    let type = 'OTHER';
    if (resourceType === 'image') type = 'IMAGE';
    if (resourceType === 'video') type = 'VIDEO';
    
    const media = await prisma.media.create({
      data: {
        userId: req.user.id,
        publicId,
        url,
        secureUrl,
        thumbnailUrl: resourceType === 'image' ? getCloudinary().url(publicId, { width: 200, crop: "scale" }) : null,
        format: format || 'unknown',
        width,
        height,
        bytes,
        type: type as any,
        context: (contextStr || 'GENERAL') as any,
        originalName,
        isPrivate: isPrivate === true
      }
    });
    res.json(media);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/media/cleanup", requireAuth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Forbidden" });
    
    // Find media marked as deleted but not actually removed (if we had soft deletes)
    // Or orphaned media that are not attached to anything (complex logic).
    // Let's implement a simple cleanup that deletes media where isDeleted = true
    const deletedMedia = await prisma.media.findMany({ where: { isDeleted: true } });
    
    const cloudinary = getCloudinary();
    let count = 0;
    for (const m of deletedMedia) {
      try {
        await cloudinary.uploader.destroy(m.publicId);
        await prisma.media.delete({ where: { id: m.id } });
        count++;
      } catch (err) {
        console.error("Cleanup error for", m.publicId, err);
      }
    }
    res.json({ success: true, cleaned: count });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/media/my", requireAuth, async (req: any, res: any) => {
  try {
    const { context, type } = req.query;
    const where: any = { userId: req.user.id, isDeleted: false };
    if (context) where.context = context;
    if (type) where.type = type;
    
    const media = await prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(media);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/media/:id", requireAuth, async (req: any, res: any) => {
  try {
    const media = await prisma.media.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: "Media not found" });
    if (media.userId !== req.user.id) return res.status(403).json({ error: "Unauthorized" });
    // Delete from cloudinary
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(media.publicId);
    // Delete from DB or mark as deleted
    await prisma.media.delete({ where: { id: media.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// ADMIN DASHBOARD & MODERATION ROUTES
// -----------------------------------------
export const requireModerator = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Requires moderator privileges" });
    }
    next();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
export const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Requires admin privileges" });
    }
    next();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
const logAdminAction = async (adminId: string, action: string, targetId: string | null = null, targetType: string | null = null, details: string | null = null, ipAddress: string | null = null) => {
  try {
    await prisma.adminActionLog.create({
      data: { adminId, action, targetId, targetType, details, ipAddress }
    });
  } catch (err) {
    logger.error("Failed to log admin action", err);
  }
};
// Dashboard Stats
app.get("/api/admin/stats", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeTournaments = await prisma.tournament.count({ where: { status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS'] } } });
    const pendingReports = await prisma.report.count({ where: { status: 'PENDING' } });
    const totalTeams = await prisma.team.count();
    const recentLogs = await prisma.adminActionLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { username: true } } }
    });
    
    res.json({ totalUsers, activeTournaments, pendingReports, totalTeams, recentLogs });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// BUSINESS INTELLIGENCE & ANALYTICS API
// ==========================================

app.get("/api/admin/analytics/dashboard", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Users
    const totalUsers = await prisma.user.count();
    const newUsersLast30Days = await prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const newUsersLast7Days = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });
    
    // Growth Chart (Last 30 Days) - Mocking grouping by day since Prisma group by date is complex in SQLite/Postgres across dialects without raw query
    // We will just fetch all users in last 30 days and group in memory for dashboard speed, since it's a small app right now
    const usersLast30Days = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const userGrowthMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        userGrowthMap[d.toISOString().split('T')[0]] = 0;
    }
    
    usersLast30Days.forEach(u => {
        const dateStr = u.createdAt.toISOString().split('T')[0];
        if (userGrowthMap[dateStr] !== undefined) {
            userGrowthMap[dateStr]++;
        }
    });
    
    const userGrowthChart = Object.keys(userGrowthMap).map(date => ({ date, users: userGrowthMap[date] }));

    // Tournaments
    const activeTournaments = await prisma.tournament.count({ where: { status: { in: ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS'] } } });
    const completedTournaments = await prisma.tournament.count({ where: { status: 'COMPLETED' } });
    
    // Matches
    const totalMatches = await prisma.match.count();
    const completedMatches = await prisma.match.count({ where: { status: 'COMPLETED' } });
    const matchCompletionRate = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

    // Teams
    const totalTeams = await prisma.team.count();
    const newTeamsLast30Days = await prisma.team.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

    // AI Usage
    const aiRequests = await prisma.aIRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } });

    // Open Beta Metrics
    const totalFeedbacks = await prisma.feedback.count();
    const openFeedbacks = await prisma.feedback.count({ where: { status: { in: ['OPEN', 'REVIEWING', 'IN_PROGRESS'] } } });
    const recentErrors = await prisma.errorLog.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const authFailures = await prisma.securityEvent.count({ where: { eventType: 'LOGIN_FAILED', createdAt: { gte: thirtyDaysAgo } } });

    res.json({
      metrics: {
        totalUsers,
        newUsersLast30Days,
        newUsersLast7Days,
        activeTournaments,
        completedTournaments,
        matchCompletionRate,
        totalTeams,
        newTeamsLast30Days,
        aiRequestsLast30Days: aiRequests
      },
      charts: {
        userGrowth: userGrowthChart
      }
    });
  } catch (e: any) {
    logger.error("Analytics Dashboard Error:", e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/analytics/reports", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { period = '30d' } = req.query;
    let startDate = new Date();
    if (period === '7d') startDate.setDate(startDate.getDate() - 7);
    else if (period === '90d') startDate.setDate(startDate.getDate() - 90);
    else startDate.setDate(startDate.getDate() - 30);

    const matches = await prisma.match.findMany({
      where: { createdAt: { gte: startDate } },
      select: { status: true, createdAt: true }
    });
    
    const tournaments = await prisma.tournament.findMany({
      where: { createdAt: { gte: startDate } },
      select: { status: true, createdAt: true, type: true }
    });

    const aiUsage = await prisma.aIUsage.findMany({
      where: { createdAt: { gte: startDate } },
      select: { tokensUsed: true, createdAt: true }
    });

    res.json({
        matchesTotal: matches.length,
        matchesCompleted: matches.filter(m => m.status === 'COMPLETED').length,
        tournamentsTotal: tournaments.length,
        aiUsageTotal: aiUsage.reduce((acc, u) => acc + (u.tokensUsed || 0), 0),
        popularGames: Object.entries(tournaments.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }))
    });
  } catch (e: any) {
    logger.error("Analytics Reports Error:", e);
    res.status(500).json({ error: e.message });
  }
});


// ==========================================
// BETA MANAGEMENT API
// ==========================================

app.get("/api/admin/beta/dashboard-stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [betaUsers, invites, feedbackOpen, bugsOpen, criticalErrors] = await Promise.all([
      prisma.user.count({ where: { isBetaUser: true } }),
      prisma.betaInvitation.count({ where: { status: 'ACTIVE' } }),
      prisma.feedback.count({ where: { status: 'OPEN' } }),
      prisma.feedback.count({ where: { type: 'BUG', status: 'OPEN' } }),
      prisma.errorLog.count({ where: { resolved: false, level: 'CRITICAL' } })
    ]);

    const recentErrors = await prisma.errorLog.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({
      betaUsers,
      invites,
      feedbackOpen,
      bugsOpen,
      criticalErrors,
      recentErrors
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


app.get("/api/admin/beta/invitations", requireAuth, requireAdmin, async (req, res) => {
  try {
    const invites = await prisma.betaInvitation.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(invites);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/beta/invitations", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { code, maxUses, expiresAt } = req.body;
    const invite = await prisma.betaInvitation.create({
      data: {
        code: code || Math.random().toString(36).substring(2, 10).toUpperCase(),
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user.id
      }
    });
    res.json(invite);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/beta/invitations/:id/revoke", requireAuth, requireAdmin, async (req, res) => {
  try {
    const invite = await prisma.betaInvitation.update({
      where: { id: req.params.id },
      data: { status: 'REVOKED' }
    });
    res.json(invite);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/beta/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isBetaUser: true },
      select: { id: true, email: true, username: true, status: true, betaCodeUsed: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/beta/users/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBetaUser: !user.isBetaUser }
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Users
app.get("/api/admin/users", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;
    
    const users = await prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, status: true, isBanned: true, createdAt: true }
    });
    const total = await prisma.user.count({ where });
    
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// SECURITY OPERATIONS CENTER & HEALTH API
// -----------------------------------------
app.get("/api/admin/soc/export", requireAuth, requireAdmin, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="security_audit_log.csv"');
    res.write('ID,Timestamp,Type,Severity,User ID,IP,Description\n');
    
    const batchSize = 1000;
    let lastId = undefined;
    let hasMore = true;
    
    while (hasMore) {
      const events = await prisma.securityEvent.findMany({
        take: batchSize,
        skip: lastId ? 1 : 0,
        cursor: lastId ? { id: lastId } : undefined,
        orderBy: { id: 'desc' }
      });
      
      if (events.length === 0) {
        hasMore = false;
      } else {
        const rows = events.map(e => {
          const desc = `"${(e.description || '').replace(/"/g, '""')}"`;
          return `${e.id},${e.createdAt.toISOString()},${e.eventType},${e.severity},${e.userId || 'N/A'},${e.ipAddress || 'N/A'},${desc}`;
        }).join('\n') + '\n';
        res.write(rows);
        lastId = events[events.length - 1].id;
      }
    }
    return res.end();
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/soc/events", requireAuth, requireAdmin, async (req, res) => {
  try {
    const events = await prisma.securityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { username: true, email: true } } }
    });
    res.json(events);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/health", requireAuth, requireAdmin, async (req, res) => {
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    let redisStatus = "Disconnected";
    let redisLatency = 0;
    try {
      const redis = await import('./services').then(m => m.getRedis());
      if (redis) {
        const rStart = Date.now();
        await redis.ping();
        redisLatency = Date.now() - rStart;
        redisStatus = "Connected";
      }
    } catch(e) {}
    res.json({
      status: "Operational",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: { status: "Connected", latency: dbLatency + "ms" },
        redis: { status: redisStatus, latency: redisLatency + "ms" },
        ai: { status: "Operational" } // mock
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message, status: "Degraded" });
  }
});
app.get("/api/admin/metrics", requireAuth, requireAdmin, async (req, res) => {
  try {
    const metrics = await prisma.systemMetric.findMany({
      orderBy: { timestamp: 'desc' },
      take: 200
    });
    res.json(metrics);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/backups", requireAuth, requireAdmin, async (req, res) => {
  try {
    const backups = await prisma.backupRecord.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50
    });
    res.json(backups);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/backups/create", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { type } = req.body;
    const backup = await prisma.backupRecord.create({
      data: {
        type: type || 'FULL',
        status: 'IN_PROGRESS',
        startedAt: new Date()
      }
    });
    
    // Mock async backup process
    setTimeout(async () => {
      await prisma.backupRecord.update({
        where: { id: backup.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          sizeBytes: BigInt(Math.floor(Math.random() * 1000000000)),
          isVerified: true
        }
      });
    }, 5000);
    res.json({ success: true, backup });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/users/:id/ban", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: true, status: 'BANNED' }
    });
    await logAdminAction(req.user.id, "BAN_USER", user.id, "USER", reason, req.ip);
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/users/:id/unban", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { reason } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: false, status: 'ACTIVE' }
    });
    await logAdminAction(req.user.id, "UNBAN_USER", user.id, "USER", reason, req.ip);
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/users/:id/suspend", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { reason, durationDays } = req.body;
    // In a real app, you might set a suspendedUntil date. Here we just set status.
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'SUSPENDED' }
    });
    await logAdminAction(req.user.id, "SUSPEND_USER", user.id, "USER", `${reason} (Days: ${durationDays})`, req.ip);
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/users/:id/role", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { role } = req.body; // e.g. MODERATOR
    if (!['PLAYER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    // Prevent modifying SUPER_ADMIN
    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (targetUser?.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Cannot modify SUPER_ADMIN" });
    }
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role }
    });
    await logAdminAction(req.user.id, "CHANGE_ROLE", user.id, "USER", `New role: ${role}`, req.ip);
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// Teams
app.post("/api/admin/teams/:id/verify", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: { isVerified: true }
    });
    await logAdminAction(req.user.id, "VERIFY_TEAM", team.id, "TEAM", null, req.ip);
    res.json(team);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// Tournaments
app.post("/api/admin/tournaments/:id/status", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { status } = req.body;
    const tournament = await prisma.tournament.update({
      where: { id: req.params.id },
      data: { status }
    });
    await logAdminAction(req.user.id, "UPDATE_TOURNAMENT_STATUS", tournament.id, "TOURNAMENT", `Status: ${status}`, req.ip);
    res.json(tournament);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// Reports
app.get("/api/admin/reports", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    const reports = await prisma.report.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { username: true } } }
    });
    const total = await prisma.report.count({ where });
    
    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/reports/:id/resolve", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { resolution, status = 'RESOLVED' } = req.body;
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status, resolution, resolvedById: req.user.id }
    });
    await logAdminAction(req.user.id, "RESOLVE_REPORT", report.id, "REPORT", `Status: ${status}, Resolution: ${resolution}`, req.ip);
    res.json(report);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// Announcements
app.get("/api/admin/announcements", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { username: true } } }
    });
    res.json(announcements);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/matches/:id/override", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { status, winnerId, homeScore, awayScore, reason } = req.body;
    const match = await prisma.match.update({
      where: { id: req.params.id },
      data: { status }
    });
    // Assuming winnerId etc are updated in related models in a real implementation
    await logAdminAction(req.user.id, "OVERRIDE_MATCH", match.id, "MATCH", `Status: ${status}, Winner: ${winnerId}, Reason: ${reason}`, req.ip);
    res.json(match);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/announcements", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { title, content, scheduledFor, expiresAt } = req.body;
    const announcement = await prisma.announcement.create({
      data: {
        title, content, scheduledFor, expiresAt, authorId: req.user.id
      }
    });
    await logAdminAction(req.user.id, "CREATE_ANNOUNCEMENT", announcement.id, "ANNOUNCEMENT", title, req.ip);
    res.json(announcement);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/admin/announcements/:id", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    await logAdminAction(req.user.id, "DELETE_ANNOUNCEMENT", req.params.id, "ANNOUNCEMENT", null, req.ip);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// Audit Logs
app.get("/api/admin/logs", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { action, adminId, page = 1, limit = 50 } = req.query;
    const where: any = {};
    if (action) where.action = action;
    if (adminId) where.adminId = adminId;
    
    const logs = await prisma.adminActionLog.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { username: true } } }
    });
    const total = await prisma.adminActionLog.count({ where });
    
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// Moderation content creation
app.post("/api/reports", requireAuth, async (req: any, res: any) => {
  try {
    const { targetId, type, reason, details } = req.body;
    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        targetId,
        type,
        reason,
        details
      }
    });
    res.json(report);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// ANALYTICS, REPORTS & MONITORING ROUTES
// -----------------------------------------
app.get("/api/analytics/dashboard", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Check cache
    const redis = getRedis();
    const cacheKey = `analytics:dashboard:${startDate || 'all'}:${endDate || 'all'}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return res.json(cached);
    }
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.lte = new Date(endDate as string);
    }
    const [
      totalUsers,
      newUsers,
      totalTeams,
      totalTournaments,
      totalMatches,
      aiRequestsCount,
      mediaCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: dateFilter }),
      prisma.team.count({ where: dateFilter }),
      prisma.tournament.count({ where: dateFilter }),
      prisma.match.count({ where: dateFilter }),
      prisma.aIRequest.count({ where: dateFilter }),
      prisma.media.count({ where: dateFilter })
    ]);
    const data = {
      totalUsers,
      newUsers,
      totalTeams,
      totalTournaments,
      totalMatches,
      aiRequestsCount,
      mediaCount,
      timestamp: new Date().toISOString()
    };
    if (redis) {
      await redis.set(cacheKey, data, { ex: 300 }); // cache for 5 minutes
    }
    res.json(data);
  } catch (e: any) {
    logger.error("Dashboard Analytics Error:", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/analytics/users", requireAuth, requireModerator, async (req: any, res: any) => {
  try {
    const rawResult = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "createdAt") as date, count(id)::int as count 
      FROM "User" 
      GROUP BY DATE_TRUNC('day', "createdAt") 
      ORDER BY date ASC 
      LIMIT 365
    `;
    
    const growth: Record<string, number> = {};
    if (Array.isArray(rawResult)) {
      rawResult.forEach((row: any) => {
        if (row.date) {
           const dateStr = new Date(row.date).toISOString().split('T')[0];
           growth[dateStr] = row.count;
        }
      });
    }
    res.json({ growth });
  } catch (e: any) {
    logger.error("User Analytics Error:", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/reports/export/users", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { format = 'csv' } = req.query;
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users_export.csv"');
      res.write('id,username,email,role,status,createdAt\n');
      
      const batchSize = 1000;
      let lastId = undefined;
      let hasMore = true;
      
      while (hasMore) {
        const users = await prisma.user.findMany({
          take: batchSize,
          skip: lastId ? 1 : 0,
          cursor: lastId ? { id: lastId } : undefined,
          select: { id: true, username: true, email: true, role: true, status: true, createdAt: true },
          orderBy: { id: 'asc' }
        });
        
        if (users.length === 0) {
          hasMore = false;
        } else {
          const rows = users.map(u => `${u.id},${u.username},${u.email},${u.role},${u.status},${u.createdAt.toISOString()}`).join('\n') + '\n';
          res.write(rows);
          lastId = users[users.length - 1].id;
        }
      }
      return res.end();
    } else {
      const users = await prisma.user.findMany({ take: 5000 }); // limit JSON export
      res.json(users);
    }
  } catch (e: any) {
    logger.error("Export Users Error:", e);
    res.status(500).json({ error: e.message });
  }
});
app.get("/api/reports/export/audit", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
    res.write('id,admin,action,targetType,targetId,details,ip,timestamp\n');
    
    const batchSize = 1000;
    let lastId = undefined;
    let hasMore = true;
    
    while (hasMore) {
      const logs = await prisma.adminActionLog.findMany({
        take: batchSize,
        skip: lastId ? 1 : 0,
        cursor: lastId ? { id: lastId } : undefined,
        include: { admin: { select: { username: true } } },
        orderBy: { id: 'desc' }
      });
      
      if (logs.length === 0) {
        hasMore = false;
      } else {
        const rows = logs.map(l => {
          const details = l.details ? `"${l.details.replace(/"/g, '""')}"` : '';
          return `${l.id},${l.admin.username},${l.action},${l.targetType || ''},${l.targetId || ''},${details},${l.ipAddress || ''},${l.createdAt.toISOString()}`;
        }).join('\n') + '\n';
        res.write(rows);
        lastId = logs[logs.length - 1].id;
      }
    }
    return res.end();
  } catch (e: any) {
    logger.error("Export Audit Error:", e);
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});
// -----------------------------------------
// GLOBAL SEARCH & ADVANCED FILTERING ROUTES
// -----------------------------------------
import { QueryBuilder } from "./src/lib/query-builder";
import { formatResponse, formatError } from "./src/lib/api-utils";
import { SearchService } from "./src/lib/search.service";
import { RecommendationService } from "./src/lib/recommendation.service";
const searchService = new SearchService();
const recommendationService = new RecommendationService();
app.get("/api/v1/search/global", async (req: any, res: any) => {
  try {
    const { q, entity, gameMode, tournamentType, rank, region, status, date, entryType, teamSize } = req.query;
    
    // Support pagination or limits? Maybe later.
    const filters = { entity, gameMode, tournamentType, rank, region, status, date, entryType, teamSize };
    
    const results = await searchService.globalSearch(q as string, filters);
    res.status(200).json(formatResponse(results));
  } catch (e: any) {
    logger.error("Search error:", e);
    res.status(500).json(formatError(e.message || e, 500).body);
  }
});
app.get("/api/v1/recommendations/personalized", requireAuth, async (req: any, res: any) => {
  try {
    // Assuming auth middleware adds user to req
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(401).json(formatError("Unauthorized", 401).body);
    
    const results = await recommendationService.getPersonalized(userId);
    res.status(200).json(formatResponse(results));
  } catch (e: any) {
    logger.error("Recommendation error:", e);
    res.status(500).json(formatError(e.message || e, 500).body);
  }
});
app.get("/api/v1/recommendations/discovery", async (req: any, res: any) => {
  try {
    const results = await recommendationService.getDiscovery();
    res.status(200).json(formatResponse(results));
  } catch (e: any) {
    logger.error("Discovery error:", e);
    res.status(500).json(formatError(e.message || e, 500).body);
  }
});
// Advanced User List Endpoint
app.get("/api/v1/users", async (req: any, res: any) => {
  try {
    const qb = new QueryBuilder(req.query)
      .search(['username', 'displayName', 'inGameName'], req.query.q as string)
      .filter(['role', 'status', 'isBanned'])
      .dateRange('createdAt', req.query.startDate as string, req.query.endDate as string)
      .sort('createdAt', 'desc')
      .paginate();
    const args = qb.build();
    
    // Only select public fields
    args.select = { id: true, username: true, displayName: true, avatarUrl: true, role: true, status: true, createdAt: true };
    const [users, total] = await Promise.all([
      prisma.user.findMany(args),
      prisma.user.count({ where: qb.where })
    ]);
    const hasNextPage = users.length === qb.take;
    res.json(formatResponse(users, {
      total,
      page: qb.skip !== undefined ? Math.floor(qb.skip / (qb.take || 20)) + 1 : undefined,
      limit: qb.take,
      cursor: users.length > 0 ? users[users.length - 1].id : null,
      hasNextPage
    }));
  } catch (e: any) {
    const err = formatError(e.message);
    res.status(err.status).json(err.body);
  }
});
// Advanced Teams List Endpoint
app.get("/api/v1/teams", async (req: any, res: any) => {
  try {
    const qb = new QueryBuilder(req.query)
      .search(['name', 'tag', 'description'], req.query.q as string)
      .filter(['isVerified'])
      .dateRange('createdAt', req.query.startDate as string, req.query.endDate as string)
      .sort('createdAt', 'desc')
      .paginate();
    const args = qb.build();
    // Default filter for non-deleted teams
    args.where.deletedAt = null;
    
    args.select = { 
      id: true, name: true, slug: true, tag: true, logoUrl: true, isVerified: true, createdAt: true,
      _count: { select: { members: true } }
    };
    const [teams, total] = await Promise.all([
      prisma.team.findMany(args),
      prisma.team.count({ where: qb.where })
    ]);
    res.json(formatResponse(teams, {
      total,
      page: qb.skip !== undefined ? Math.floor(qb.skip / (qb.take || 20)) + 1 : undefined,
      limit: qb.take,
      cursor: teams.length > 0 ? teams[teams.length - 1].id : null,
      hasNextPage: teams.length === qb.take
    }));
  } catch (e: any) {
    const err = formatError(e.message);
    res.status(err.status).json(err.body);
  }
});
// Advanced Tournaments List Endpoint
app.get("/api/v1/tournaments", async (req: any, res: any) => {
  try {
    const qb = new QueryBuilder(req.query)
      .search(['title', 'description'], req.query.q as string)
      .filter(['status', 'game', 'region', 'format'])
      .dateRange('startDate', req.query.fromDate as string, req.query.toDate as string)
      .sort(req.query.sortBy as string || 'startDate', req.query.sortOrder as any || 'desc')
      .paginate();
    const args = qb.build();
    
    // Only public tournaments if not admin
    if (!req.user || !['MODERATOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      args.where.status = { not: 'DRAFT' };
    }
    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany(args),
      prisma.tournament.count({ where: qb.where })
    ]);
    res.json(formatResponse(tournaments, {
      total,
      page: qb.skip !== undefined ? Math.floor(qb.skip / (qb.take || 20)) + 1 : undefined,
      limit: qb.take,
      cursor: tournaments.length > 0 ? tournaments[tournaments.length - 1].id : null,
      hasNextPage: tournaments.length === qb.take
    }));
  } catch (e: any) {
    const err = formatError(e.message);
    res.status(err.status).json(err.body);
  }
});
// Generic API Routes & Production Health Checks (Render, Kubernetes, Railway, Vercel)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get("/api/health/liveness", (req, res) => {
  res.status(200).json({ status: "alive", timestamp: new Date().toISOString() });
});

app.get("/api/health/readiness", async (req, res) => {
  if (!global.isAppReady) {
    return res.status(503).json({ status: "starting", message: "Application is warming up." });
  }
  const servicesStatus = await validateServices();
  const isHealthy = Object.values(servicesStatus).every((s) => s === "ok" || s === "not_initialized" || s === "pending");
  
  if (isHealthy) {
    res.status(200).json({ status: "ready", services: servicesStatus, timestamp: new Date().toISOString() });
  } else {
    res.status(503).json({ status: "unhealthy", services: servicesStatus, timestamp: new Date().toISOString() });
  }
});

/**
 * Safely format Prisma exceptions into structured HTTP responses.
 * Prevents unhandled database crashes, schema leakage, and deadlocks.
 */
export const handlePrismaError = (e: any, res: any, fallbackMessage: string) => {
  logger.error(`${fallbackMessage}:`, e);

  // P2002: Unique constraint violation
  if (e?.code === 'P2002') {
    const fields = e.meta?.target ? (Array.isArray(e.meta.target) ? e.meta.target.join(', ') : e.meta.target) : 'field';
    return res.status(409).json({
      error: `Conflict: Unique constraint violation on ${fields}.`,
      code: 'P2002'
    });
  }

  // P2025: Record not found to update or delete
  if (e?.code === 'P2025') {
    return res.status(404).json({
      error: "Record not found or does not exist.",
      code: 'P2025'
    });
  }

  // P2003: Foreign key constraint failed
  if (e?.code === 'P2003') {
    return res.status(400).json({
      error: "Foreign key constraint failed. Referenced record does not exist.",
      code: 'P2003'
    });
  }

  // P2000: Value too long for column
  if (e?.code === 'P2000') {
    return res.status(400).json({
      error: "Provided value exceeds maximum database column length.",
      code: 'P2000'
    });
  }

  // PrismaClientValidationError
  if (e?.name === 'PrismaClientValidationError') {
    return res.status(400).json({
      error: "Invalid request payload. Validation failed against database schema."
    });
  }

  // Generic internal server error fallback
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    error: isProd ? fallbackMessage : (e?.message || fallbackMessage)
  });
};

/**
 * Safe, type-checked mapping of route collection names to Prisma model delegates.
 */
const PRISMA_MODEL_MAP: Record<string, string> = {
  tournaments: 'tournament',
  tournamentCategories: 'tournamentCategory',
  tournamentRules: 'tournamentRules',
  tournamentSettings: 'tournamentSettings',
  tournamentRegistrations: 'tournamentRegistration',
  tournamentParticipants: 'tournamentParticipant',
  tournamentPrizes: 'tournamentPrize',
  tournamentRounds: 'tournamentRound',
  tournamentSchedules: 'tournamentSchedule',
  users: 'user',
  profiles: 'profile',
  userSettings: 'userSettings',
  matches: 'match',
  matchStats: 'matchStat',
  matchParticipants: 'matchParticipant',
  matchResults: 'matchResult',
  matchScores: 'matchScore',
  matchEvents: 'matchEvent',
  matchTimelines: 'matchTimeline',
  matchStatistics: 'matchStatistics',
  matchRooms: 'matchRoom',
  matchLobbies: 'matchLobby',
  matchVerifications: 'matchVerification',
  news: 'news',
  gallery: 'gallery',
  partners: 'partner',
  logs: 'log',
  disputes: 'dispute',
  settings: 'settings',
  messages: 'chatMessage',
  teams: 'team',
  teamMembers: 'teamMember',
  teamInvites: 'teamInvite',
  teamJoinRequests: 'teamJoinRequest',
  teamStats: 'teamStatistics',
  playerProfiles: 'playerProfile',
  playerStats: 'playerStatistics',
  seasons: 'season',
  leaderboards: 'leaderboard',
  leaderboardEntries: 'leaderboardEntry',
  playerRankings: 'playerRanking',
  teamRankings: 'teamRanking',
  seasonStats: 'seasonStatistics',
  tournamentStats: 'tournamentStatistics',
  achievements: 'achievement',
  badges: 'badge',
  rewards: 'reward',
  playerAchievements: 'playerAchievement',
  teamAchievements: 'teamAchievement',
  notifications: 'notification',
  notificationPreferences: 'notificationPreference',
  announcements: 'announcement',
  inboxMessages: 'inboxMessage',
  emailQueue: 'emailQueue',
  pushNotifications: 'pushNotification',
  deviceTokens: 'deviceToken',
  systemAlerts: 'systemAlert',
  aiRequests: 'aIRequest',
  aiUsages: 'aIUsage',
  aiQuotas: 'aIQuota',
  ocrScans: 'oCRScan',
  ocrResults: 'oCRResult',
  aiAnalyses: 'aIAnalysis',
  aiReports: 'aIReport',
  media: 'media',
  reports: 'report',
  adminActionLogs: 'adminActionLog',
  securityEvents: 'securityEvent',
  ipReputations: 'ipReputation',
  systemMetrics: 'systemMetric',
  backupRecords: 'backupRecord',
  featureFlags: 'featureFlag',
  remoteConfigs: 'remoteConfig',
  feedbacks: 'feedback',
  experiments: 'experiment',
  experimentParticipants: 'experimentParticipant',
  betaInvitations: 'betaInvitation',
  newsletterSubscribers: 'newsletterSubscriber',
  errorLogs: 'errorLog',
};

export const getModel = (collection: string) => {
  if (!collection || typeof collection !== 'string') return null;
  const targetKey = collection.trim();
  const delegateName = PRISMA_MODEL_MAP[targetKey];
  if (!delegateName) return null;
  return (prisma as any)[delegateName] || null;
};
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://striqo.com/sitemap.xml`);
});
app.get('/sitemap.xml', async (req, res) => {
  try {
    const [tournaments, users] = await Promise.all([
      prisma.tournament.findMany({ select: { id: true, title: true, createdAt: true }, take: 1000 }),
      prisma.user.findMany({ select: { id: true }, take: 1000 })
    ]);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    const addUrl = (loc, lastmod = new Date().toISOString(), priority = '0.8') => {
      xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${priority}</priority>
  </url>
`;
    };
    // Static pages
    addUrl('https://striqo.com/', new Date().toISOString(), '1.0');
    addUrl('https://striqo.com/tournaments', new Date().toISOString(), '0.9');
    addUrl('https://striqo.com/leaderboard', new Date().toISOString(), '0.9');
    // Dynamic pages
    tournaments.forEach(t => {
      const slug = slugify(t.title || '', { lower: true, strict: true });
      const url = slug ? `https://striqo.com/tournaments/${t.id}/${slug}` : `https://striqo.com/tournaments/${t.id}`;
      addUrl(url, t.createdAt.toISOString(), '0.7');
    });
    users.forEach(u => addUrl(`https://striqo.com/profile?uid=${u.id}`, new Date().toISOString(), '0.6'));
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).end();
  }
});

app.get("/api/client-config", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // 1. Get all active feature flags
    const flags = await prisma.featureFlag.findMany();
    const activeFlags = flags.reduce((acc, flag) => {
      let enabled = flag.isEnabled;
      
      // Feature flag evaluation engine
      if (enabled) {
        if (flag.type === 'ROLE') {
          // Check if user has required role
          try {
            const conditions = JSON.parse(flag.conditions || '{}');
            if (conditions.roles && Array.isArray(conditions.roles)) {
              enabled = conditions.roles.includes(user.role);
            }
          } catch (e) {
            console.error("Failed to parse conditions for flag:", flag.key);
          }
        } else if (flag.type === 'USER') {
          // Check if user ID is in list
          try {
            const conditions = JSON.parse(flag.conditions || '{}');
            if (conditions.userIds && Array.isArray(conditions.userIds)) {
              enabled = conditions.userIds.includes(user.id);
            }
          } catch (e) {
            console.error("Failed to parse conditions for flag:", flag.key);
          }
        }
        // TOURNAMENT type could be evaluated on the client or passed down
      }
      
      acc[flag.key] = enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    // 2. Get remote configs
    const configs = await prisma.remoteConfig.findMany();
    const configValues = configs.reduce((acc, config) => {
      // Basic target checking
      let value = config.value;
      
      // If there's JSON string in config.value, parse it, if it's meant to be an object
      // For now we just return the raw string or try to parse if it's valid JSON
      try {
         // See if value is JSON
         if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
             value = JSON.parse(value);
         }
      } catch (e) {}
      
      acc[config.key] = value;
      return acc;
    }, {} as Record<string, any>);
    
    // 3. Get active experiments
    const experiments = await prisma.experiment.findMany({
      where: { status: 'ACTIVE' }
    });
    
    const activeExperiments = experiments.reduce((acc, exp) => {
      // Deterministic variant assignment based on user.id (pseudo-random)
      try {
          const variants = JSON.parse(exp.variants);
          if (variants && variants.length > 0) {
              // hash user ID to pick variant
              const hash = user.id.split('').reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
              const index = Math.abs(hash) % variants.length;
              acc[exp.key] = variants[index].id || variants[index].name || variants[index];
          }
      } catch (e) {
          acc[exp.key] = 'control';
      }
      return acc;
    }, {} as Record<string, any>);

    res.json({
      featureFlags: activeFlags,
      remoteConfig: configValues,
      experiments: activeExperiments
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/:collection", async (req, res, next) => {
  const restrictedCollections = ['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks', 'logs', 'users', 'settings', 'adminActionLogs', 'securityEvents', 'errorLogs'];
  if (restrictedCollections.includes(req.params.collection)) {
     return requireAuth(req, res, () => {
       if ((req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: "Forbidden: Access restricted to administrators." });
       }
       next();
     });
  }
  next();
}, async (req: any, res: any) => {
  try {
    const model = getModel(req.params.collection);
    if (!model) {
      return res.status(404).json({
        error: `Resource collection '${req.params.collection}' not found or is not supported.`,
        code: "COLLECTION_NOT_FOUND"
      });
    }
    
    // Safety limit for generic collection fetches to prevent OOM
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100);
    const skip = Math.max(parseInt(req.query.skip as string) || 0, 0);
    
    const queryOpts: any = req.params.collection === 'settings' 
      ? {} 
      : { orderBy: { createdAt: 'desc' }, take: limit, skip };
      
    const data = await (model as any).findMany(queryOpts);
    res.json(data);
  } catch (e: any) {
    return handlePrismaError(e, res, `Failed to retrieve collection '${req.params.collection}'`);
  }
});

app.post("/api/tournamentParticipants", requireAuth, async (req, res) => {
  try {
    const { tournamentId, userId, teamId } = req.body;
    if (!tournamentId) return res.status(400).json({ error: "Tournament ID required" });
    if (!userId && !teamId) return res.status(400).json({ error: "User ID or Team ID required" });

    // Validate if the user is authorized to register
    if (userId && userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Cannot register another user." });
    }
    if (teamId) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (!team || (team.captainId !== req.user.id && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: "Only team captains can register their team." });
      }
    }

    const data = await prisma.$transaction(async (tx) => {
      const existing = await tx.tournamentParticipant.findFirst({
        where: {
          tournamentId,
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(teamId ? [{ teamId }] : [])
          ]
        }
      });  
      if (existing) {
        throw new Error("Already registered for this tournament.");
      }

      const tourney = await tx.tournament.findUnique({ where: { id: tournamentId }, include: { _count: { select: { participants: true } } } });
      if (!tourney) throw new Error("Tournament not found");
      
      if (tourney.maxParticipants && tourney._count.participants >= tourney.maxParticipants) {
        throw new Error("Tournament is full");
      }
      
      return await tx.tournamentParticipant.create({
        data: { tournamentId, userId, teamId }
      });
    });

    io.emit(`tournamentParticipants:created`, data);
    res.json(data);
  } catch (e: any) {
    return handlePrismaError(e, res, "Tournament registration error");
  }
});

app.post("/api/:collection", requireAuth, async (req, res) => {
  // Lock down generic collection mutation entirely to ADMIN roles for security.
  // Exception for feedbacks which users can create.
  if (req.params.collection === 'feedbacks') {
      // Allow players to create feedback
  } else if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection mutations are restricted to Admins." });
  }

  try {
    const model = getModel(req.params.collection);
    if (!model) {
      return res.status(404).json({
        error: `Resource collection '${req.params.collection}' not found or is not supported.`,
        code: "COLLECTION_NOT_FOUND"
      });
    }

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Invalid request payload. Expected an object." });
    }

    const { id, createdAt, updatedAt, ...safeData } = req.body;
    const data = await model.create({ data: safeData });
    // Optimize event broadcasting: Emit only the created item to the collection channel
    io.emit(`${req.params.collection}:created`, data);
    
    res.status(201).json(data);
  } catch (e: any) {
    return handlePrismaError(e, res, `Failed to create record in '${req.params.collection}'`);
  }
});

app.get("/api/:collection/:id", async (req, res, next) => {
  const restrictedCollections = ['featureFlags', 'remoteConfigs', 'experiments', 'feedbacks', 'logs', 'users', 'settings', 'adminActionLogs', 'securityEvents', 'errorLogs'];
  if (restrictedCollections.includes(req.params.collection)) {
     return requireAuth(req, res, () => {
       if ((req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'SUPER_ADMIN') {
         return res.status(403).json({ error: "Forbidden: Access restricted to administrators." });
       }
       next();
     });
  }
  next();
}, async (req: any, res: any) => {
  try {
    const model = getModel(req.params.collection);
    if (!model) {
      return res.status(404).json({
        error: `Resource collection '${req.params.collection}' not found.`,
        code: "COLLECTION_NOT_FOUND"
      });
    }

    const data = await model.findUnique({ where: { id: req.params.id } });
    if (!data) {
      return res.status(404).json({ error: `Record '${req.params.id}' not found in '${req.params.collection}'.` });
    }
    res.json(data);
  } catch (e: any) {
    return handlePrismaError(e, res, `Failed to retrieve record from '${req.params.collection}'`);
  }
});

app.put("/api/:collection/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection mutations are restricted to Admins." });
  }
  try {
    const model = getModel(req.params.collection);
    if (!model) {
      return res.status(404).json({
        error: `Resource collection '${req.params.collection}' not found.`,
        code: "COLLECTION_NOT_FOUND"
      });
    }

    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: `Record '${req.params.id}' not found in '${req.params.collection}'.` });
    }

    // Authorization check
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      let isOwner = false;
      if (req.params.collection === 'users' && existing.id === req.user.id) isOwner = true;
      else if (existing.userId && existing.userId === req.user.id) isOwner = true;
      else if (existing.ownerId && existing.ownerId === req.user.id) isOwner = true;
      else if (req.params.collection === 'teams' && existing.captainId === req.user.id) isOwner = true;
      else if (req.params.collection === 'tournaments' && existing.organizerId === req.user.id) isOwner = true;

      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You do not own this resource." });
      }
    }

    // Remove id from body to avoid update errors
    const { id, createdAt, updatedAt, ...updateData } = req.body;
    
    // Check if increment
    for (const key of Object.keys(updateData)) { 
       if (updateData[key] && updateData[key].__increment) {
          updateData[key] = { increment: updateData[key].__increment };
       }
    }
    const data = await model.update({ where: { id: req.params.id }, data: updateData });
    // Optimize event broadcasting: Emit only the updated item to specific rooms
    io.emit(`${req.params.collection}:updated`, data);
    if (data.id) {
      io.to(`${req.params.collection}:${data.id}`).emit(`${req.params.collection}:updated`, data);
    }
    
    res.json(data);
  } catch (e: any) {
    return handlePrismaError(e, res, `Failed to update record in '${req.params.collection}'`);
  }
});

app.delete("/api/:collection/:id", requireAuth, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: "Forbidden: Generic collection mutations are restricted to Admins." });
  }
  try {
    const model = getModel(req.params.collection);
    if (!model) {
      return res.status(404).json({
        error: `Resource collection '${req.params.collection}' not found.`,
        code: "COLLECTION_NOT_FOUND"
      });
    }

    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: `Record '${req.params.id}' not found in '${req.params.collection}'.` });
    }

    // Authorization check
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      let isOwner = false;
      if (req.params.collection === 'users' && existing.id === req.user.id) isOwner = true;
      else if (existing.userId && existing.userId === req.user.id) isOwner = true;
      else if (existing.ownerId && existing.ownerId === req.user.id) isOwner = true;
      else if (req.params.collection === 'teams' && existing.captainId === req.user.id) isOwner = true;
      else if (req.params.collection === 'tournaments' && existing.organizerId === req.user.id) isOwner = true;

      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You do not own this resource." });
      }
    }

    await model.delete({ where: { id: req.params.id } });
    // Optimize event broadcasting: Emit deletion event
    io.emit(`${req.params.collection}:deleted`, { id: req.params.id });
    io.to(`${req.params.collection}:${req.params.id}`).emit(`${req.params.collection}:deleted`, { id: req.params.id });
    
    res.json({ success: true });
  } catch (e: any) {
    return handlePrismaError(e, res, `Failed to delete record from '${req.params.collection}'`);
  }
});
// Setup Socket.IO real-time engine
const connectedUsers = new Map<string, string>(); // socketId -> userId
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  // 1. Authentication
  socket.on("authenticate", (data) => {
    try {
      if (!data || !data.token) throw new Error("No token provided");
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET || "default_secret") as { userId: string };
      const userId = decoded.userId;
      
      connectedUsers.set(socket.id, userId);
            
      socket.join(`user:${userId}`);
      socket.emit("authenticated", { success: true, userId });
      io.emit("presence:update", { userId, status: "online" });
      logger.info(`User ${userId} authenticated on socket ${socket.id}`);
    } catch (err: any) {
      socket.emit("authenticated", { success: false, error: err.message });
    }
  });
  // 2. Room Management (Tournaments, Matches, Teams)
  socket.on("join:room", (data) => {
    if (!data || !data.room) return;
    socket.join(data.room);
    logger.info(`Socket ${socket.id} joined room ${data.room}`);
  });
  
  socket.on("leave:room", (data) => {
    if (!data || !data.room) return;
    socket.leave(data.room);
    logger.info(`Socket ${socket.id} left room ${data.room}`);
  });
  // 3. Heartbeat & Connection Recovery
  socket.on("heartbeat", () => {
    socket.emit("heartbeat:ack", { time: Date.now() });
  });
  // 4. Live Match Actions
  socket.on("match:action", (data) => {
    if (!data || !data.matchId) return;
    const room = `match:${data.matchId}`;
    // Prevent duplicate events or broadcast to others
    socket.to(room).emit("match:update", data);
  });
  socket.on("disconnect", async () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      
      // Check if user still has other active sockets
      const sockets = await io.in(`user:${userId}`).fetchSockets();
      if (sockets.length === 0) {
        io.emit("presence:update", { userId, status: "offline", lastSeen: Date.now() });
      }
    }
    logger.info(`Client disconnected: ${socket.id}`);
  });
});
// Discord Integration
import { DiscordIntegrationService } from "./discord.js";
app.post("/api/auth/discord/login", requireAuth, async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
    if (!settings?.discordIntegration) {
      return res.status(400).json({ error: "Discord integration is disabled." });
    }
    const { code, redirectUri } = req.body;
    if (!code) return res.status(400).json({ error: "Missing OAuth code." });
    
    const tokens = await DiscordIntegrationService.getTokens(code, redirectUri);
    const profile = await DiscordIntegrationService.getUserProfile(tokens.access_token);
    
    // Save to database
    await prisma.$transaction(async (tx) => {
       await tx.oAuthAccount.upsert({
         where: { provider_providerAccountId: { provider: 'discord', providerAccountId: profile.id } },
         update: { 
            accessToken: tokens.access_token, 
            refreshToken: tokens.refresh_token, 
            expiresAt: Math.floor(Date.now()/1000) + tokens.expires_in,
            userId: req.user.id
         },
         create: {
            provider: 'discord',
            providerAccountId: profile.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Math.floor(Date.now()/1000) + tokens.expires_in,
            userId: req.user.id
         }
       });
       await tx.user.update({
         where: { id: req.user.id },
         data: {
           discordId: profile.id,
           discordUsername: profile.username,
           discordAvatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
         }
       });
    });
    
    res.json({ success: true, message: "Discord account linked successfully." });
  } catch (e: any) {
    console.error("Discord login error:", e);
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/auth/discord/unlink", requireAuth, async (req, res) => {
  try {
     await prisma.oAuthAccount.deleteMany({
        where: { userId: req.user.id, provider: 'discord' }
     });
     await prisma.user.update({
        where: { id: req.user.id },
        data: { discordId: null, discordUsername: null, discordAvatar: null }
     });
     res.json({ success: true });
  } catch (e: any) {
     res.status(500).json({ error: e.message });
  }
});
app.get("/api/admin/settings/discord", requireAdmin, async (req, res) => {
  try {
     const settings = await prisma.settings.findUnique({ where: { id: 'global' } });
     res.json({
        discordIntegration: settings?.discordIntegration || false,
        discordClientId: settings?.discordClientId || "",
        discordClientSecret: settings?.discordClientSecret || "",
        discordBotToken: settings?.discordBotToken || "",
        discordGuildId: settings?.discordGuildId || "",
        socialDiscord: settings?.socialDiscord || ""
     });
  } catch (e: any) {
     res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/settings/discord", requireAdmin, async (req, res) => {
  try {
     const { discordIntegration, discordClientId, discordClientSecret, discordBotToken, discordGuildId, socialDiscord } = req.body;
     const updated = await prisma.settings.upsert({
        where: { id: 'global' },
        update: { discordIntegration, discordClientId, discordClientSecret, discordBotToken, discordGuildId, socialDiscord },
        create: { id: 'global', discordIntegration, discordClientId, discordClientSecret, discordBotToken, discordGuildId, socialDiscord }
     });
     res.json({ success: true, settings: updated });
  } catch (e: any) {
     res.status(500).json({ error: e.message });
  }
});
app.post("/api/admin/settings/discord/test", requireAdmin, async (req, res) => {
  try {
     const { discordBotToken, discordGuildId } = req.body;
     if (!discordBotToken) return res.status(400).json({ error: "Missing bot token" });
     const response = await fetch(`https://discord.com/api/v10/guilds/${discordGuildId}`, {
        headers: { 'Authorization': `Bot ${discordBotToken}` }
     });
     if (!response.ok) {
        throw new Error("Failed to authenticate with Discord API.");
     }
     const data = await response.json();
     res.json({ success: true, guildName: data.name });
  } catch (e: any) {
     res.status(500).json({ error: e.message });
  }
});
// Global Error Boundary Middleware
app.use(async (err: any, req: any, res: any, next: any) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  if (global.isAppReady) {
    try {
      const Sentry = require('@sentry/node');
      if (Sentry?.isInitialized?.()) {
        Sentry.captureException(err);
      }
    } catch(e) {}
    
    try {
      await prisma.errorLog.create({
        data: {
          message: err.message || 'Unknown server error',
          stack: err.stack || '',
          route: req.originalUrl || req.path || '',
          method: req.method || 'GET',
          userId: req.user?.id || null,
          level: 'CRITICAL',
        }
      });
    } catch(dbErr) {
      logger.error('Failed to record error log to database:', dbErr);
    }
  }

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || (err.name === 'UnauthorizedError' ? 401 : 500);
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    error: isProd && statusCode === 500 ? "Internal Server Error" : (err.message || "Internal Server Error"),
    ...(isProd ? {} : { stack: err.stack })
  });
});

async function startServer() {
  if (!isProduction) {
    // Dynamic import of Vite development middleware: keeps Vite out of production runtime dependency graph
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: "spa",
    });
    viteMiddleware = vite.middlewares;
    logger.info("Vite development server middleware mounted with allowedHosts: true");
  } else {
    logger.info(`Production mode: Serving static frontend assets from '${distPath}'`);
  }
  
  // Validate services before ready
  try {
    await validateServices();
    global.isAppReady = true;
    logger.info("All services validated successfully. Application is ready.");
  } catch (err) {
    logger.error("Service validation failed on startup:", err);
  }

  // Match Notification Job (Every 1 Minute)
  const matchJobInterval = setInterval(async () => {
    try {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
      
      const upcomingMatches = await prisma.match.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: {
            gt: now,
            lte: fifteenMinutesFromNow
          }
        },
        include: {
          tournament: true,
          participants: true
        }
      });

      const redis = getRedis();

      for (const match of upcomingMatches) {
        const notifiedKey = `notified_match_soon_${match.id}`;
        const alreadyNotified = await redis.get(notifiedKey);
        
        if (!alreadyNotified) {
          // Send notifications
          for (const participant of (match.participants || [])) {
            if (participant.userId) {
              io.to(`user:${participant.userId}`).emit("match_starting_soon", {
                matchId: match.id,
                tournamentName: match.tournament?.title || "Tournament",
                scheduledAt: match.scheduledAt
              });
            }
          }
          
          // Mark as notified for 30 minutes
          await redis.set(notifiedKey, "1", { ex: 1800 });
        }
      }
    } catch (error) {
      logger.error("Error checking for upcoming matches:", error);
    }
  }, 60000);

  const serverProcess = httpServer.listen(PORT, "0.0.0.0", () => {
    logger.info(`🚀 Server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  });

  // Graceful shutdown handling for cloud orchestrators (Render, Kubernetes, Railway, Vercel)
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received: closing HTTP server gracefully...`);
    global.isAppReady = false;
    clearInterval(matchJobInterval);
    
    serverProcess.close(async () => {
      logger.info('HTTP server closed successfully.');
      try {
        await prisma.$disconnect();
        logger.info('Database connection pool disconnected.');
      } catch (err) {
        logger.error('Error closing database connections:', err);
      }
      process.exit(0);
    });

    // Enforce shutdown timeout if connections are stalled
    setTimeout(() => {
      logger.error('Could not close open connections in time, forcefully terminating.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection caught at process level:', { reason });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception caught at process level:', {
      message: error.message,
      stack: error.stack
    });
    setTimeout(() => process.exit(1), 1000);
  });
}
startServer();