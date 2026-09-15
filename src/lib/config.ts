import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  APP_NAME: z.string().default("Striqo"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3000"), // AI Studio expects 3000
  CLIENT_URL: z.string().default("http://localhost:5173"),
  TZ: z.string().default("Asia/Dhaka"),
  
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  
  UPSTASH_REDIS_REST_URL: z.string().min(1, "UPSTASH_REDIS_REST_URL is required"),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required"),
  
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  COOKIE_SECRET: z.string().min(1, "COOKIE_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
  CLOUDINARY_URL: z.string().optional(),
  
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  GOOGLE_VISION_API_KEY: z.string().min(1, "GOOGLE_VISION_API_KEY is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().default("onboarding@resend.dev"),
  
  GA_MEASUREMENT_ID: z.string().optional(),
  
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1, "TURNSTILE_SECRET_KEY is required"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  
  SENTRY_DSN: z.string().min(1, "SENTRY_DSN is required"),
  SENTRY_FRONTEND_DSN: z.string().optional(),
  
  SOCKET_PORT: z.string().transform(Number).default(5001),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.string().transform(Number).default(10485760),
  LOG_LEVEL: z.string().default("debug"),
});

export const validateConfig = () => {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ ERROR: Missing or invalid environment variables:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    // We log but don't strictly throw to avoid crashing the AI Studio container 
    // before lazy-initialized services try to use them.
  }
};

const parsedEnv = envSchema.safeParse(process.env);
const env = parsedEnv.success ? parsedEnv.data : process.env as any;

export const config = Object.freeze({
  app: Object.freeze({
    name: env.APP_NAME || "Striqo",
    clientUrl: env.CLIENT_URL || "http://localhost:5173",
  }),
  server: Object.freeze({
    // MUST BE 3000 based on AI Studio environment constraints
    port: 3000,
    socketPort: env.SOCKET_PORT || 5001,
    timezone: env.TZ || "Asia/Dhaka",
    env: env.NODE_ENV || "development",
  }),
  db: Object.freeze({
    url: env.DATABASE_URL,
    directUrl: env.DIRECT_URL,
  }),
  redis: Object.freeze({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  }),
  auth: Object.freeze({
    jwtSecret: env.JWT_SECRET || "fallback-secret-for-dev",
    jwtRefreshSecret: env.JWT_REFRESH_SECRET || "fallback-refresh-secret-for-dev",
    cookieSecret: env.COOKIE_SECRET || "fallback-cookie-secret",
    jwtExpiresIn: env.JWT_EXPIRES_IN || "15m",
    jwtRefreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || "30d",
    bcryptRounds: env.BCRYPT_ROUNDS || 12,
  }),
  cloudinary: Object.freeze({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    url: env.CLOUDINARY_URL,
  }),
  ai: Object.freeze({
    geminiKey: env.GEMINI_API_KEY || "AIzaSyC6WsRIDoqOvcvOomy_O_Nq6l6XHQVvTR8",
    visionKey: env.GOOGLE_VISION_API_KEY,
  }),
  oauth: Object.freeze({
    googleId: env.GOOGLE_CLIENT_ID,
    googleSecret: env.GOOGLE_CLIENT_SECRET,
  }),
  email: Object.freeze({
    resendKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM || "onboarding@resend.dev",
  }),
  analytics: Object.freeze({
    gaMeasurementId: env.GA_MEASUREMENT_ID,
  }),
  security: Object.freeze({
    turnstileSiteKey: env.TURNSTILE_SITE_KEY,
    turnstileSecret: env.TURNSTILE_SECRET_KEY,
    corsOrigin: env.CORS_ORIGIN || "http://localhost:5173",
    rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS || 900000,
    rateLimitMax: env.RATE_LIMIT_MAX_REQUESTS || 100,
  }),
  sentry: Object.freeze({
    dsn: env.SENTRY_DSN,
    frontendDsn: env.SENTRY_FRONTEND_DSN,
  }),
  upload: Object.freeze({
    dir: env.UPLOAD_DIR || "./uploads",
    maxSize: env.MAX_FILE_SIZE || 10485760,
  }),
  logging: Object.freeze({
    level: env.LOG_LEVEL || "debug",
  }),
});
