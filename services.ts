import { PrismaClient } from "@prisma/client";
import { config } from "./config";
import { Redis } from "@upstash/redis";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenAI } from "@google/genai";
import vision from "@google-cloud/vision";
import { Resend } from "resend";

// Lazy initialization pattern
let redisClient: Redis | null = null;
export const getRedis = (): Redis => {
  if (!redisClient) {
    if (!config.redis.url || !config.redis.token) {
      throw new Error("Missing Upstash Redis environment variables.");
    }
    redisClient = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    });
  }
  return redisClient;
};

let cloudinaryConfigured = false;
export const getCloudinary = () => {
  if (!cloudinaryConfigured) {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new Error("Missing Cloudinary environment variables.");
    }
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    cloudinaryConfigured = true;
  }
  return cloudinary;
};

let aiClient: GoogleGenAI | null = null;
export const getAi = (): GoogleGenAI => {
  if (!aiClient) {
    if (!config.ai.geminiKey) {
      throw new Error("Missing Gemini API Key.");
    }
    aiClient = new GoogleGenAI({ apiKey: config.ai.geminiKey });
  }
  return aiClient;
};

let visionClientInstance: any = null;
export const getVisionClient = (): any => {
  if (!visionClientInstance) {
    visionClientInstance = new vision.ImageAnnotatorClient(
      config.ai.visionKey ? { apiKey: config.ai.visionKey } : undefined
    );
  }
  return visionClientInstance;
};

let resendClient: Resend | null = null;
export const getResend = (): Resend => {
  if (!resendClient) {
    if (!config.email.resendKey) {
      throw new Error("Missing Resend API Key.");
    }
    resendClient = new Resend(config.email.resendKey);
  }
  return resendClient;
};

let prismaClient: PrismaClient | null = null;
export const getPrisma = (): PrismaClient => {
  if (!prismaClient) {
    let dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.includes("-pooler") && !dbUrl.includes("pgbouncer=true")) {
      dbUrl += (dbUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
      if (!dbUrl.includes("connection_limit")) {
         dbUrl += "&connection_limit=5"; // reduce connection limit on pooler
      }
    }

    prismaClient = new PrismaClient({
      ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
    });
  }
  return prismaClient;
};
