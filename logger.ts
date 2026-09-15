import winston from "winston";
import { config } from "./config";

export const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: "striqo-api" },
  transports: [
    
    new winston.transports.Console({
      format: config.server.env === 'production' 
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

  ],
});
