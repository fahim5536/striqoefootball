
import { getRedis, getCloudinary, getAi, getPrisma } from "../../services";
import * as Sentry from "@sentry/node";
import { config } from "./config";
import { logger } from "../../logger";

const prisma = getPrisma();

export async function validateServices() {
  const status: Record<string, any> = {
    database: "pending",
    redis: "pending",
    cloudinary: "pending",
    gemini: "pending",
    sentry: "pending",
  };

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = "ok";
  } catch (error: any) {
    status.database = "error";
    status.database_error = error.message;
    logger.error("Database validation failed", error);
  }

  // Redis
  try {
    const redis = getRedis();
    await redis.ping();
    status.redis = "ok";
  } catch (error: any) {
    status.redis = "error";
    status.redis_error = error.message;
    logger.error("Redis validation failed", error);
  }

  // Cloudinary
  try {
    const cloudinary = getCloudinary();
    await cloudinary.api.ping();
    status.cloudinary = "ok";
  } catch (error: any) {
    status.cloudinary = "error";
    status.cloudinary_error = error.message;
    logger.error("Cloudinary validation failed", error);
  }

  // Gemini
  try {
    const ai = getAi();
    // Use a lightweight API call to verify if possible, or just check init
    if (config.ai.geminiKey) {
       status.gemini = "ok";
    } else {
       status.gemini = "error";
       status.gemini_error = "Missing Gemini API Key";
    }
  } catch (error: any) {
    status.gemini = "error";
    status.gemini_error = error.message;
    logger.error("Gemini validation failed", error);
  }

  // Sentry
  try {
    if (Sentry.isInitialized()) {
       status.sentry = "ok";
    } else {
       status.sentry = "not_initialized";
    }
  } catch (error: any) {
    status.sentry = "error";
    status.sentry_error = error.message;
    logger.error("Sentry validation failed", error);
  }

  return status;
}
