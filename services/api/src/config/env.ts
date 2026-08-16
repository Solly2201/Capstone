import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/cap"),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32).default("local-development-secret-change-before-production"),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  LOCAL_STORAGE_ROOT: z.string().default("../../data/uploads")
});

export const env = envSchema.parse(process.env);
