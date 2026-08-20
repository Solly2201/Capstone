import "dotenv/config";
import { z } from "zod";

// Placeholder secret shipped for local development. Production refuses to
// start with it, so a deployment that forgets to set JWT_SECRET fails
// loudly instead of signing tokens anyone can forge from this file.
export const DEV_JWT_SECRET = "local-development-secret-change-before-production";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/cap"),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
    JWT_SECRET: z.string().min(32).default(DEV_JWT_SECRET),
    WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
    LOCAL_STORAGE_ROOT: z.string().default("../../data/uploads"),
    AI_SERVICE_URL: z.string().url().default("http://localhost:8000")
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== "production") return;

    if (value.JWT_SECRET === DEV_JWT_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["JWT_SECRET"],
        message:
          "JWT_SECRET is still the development placeholder. Set a unique random secret before deploying."
      });
    }

    // A wildcard CORS origin in production would let any site drive the
    // API with a user's bearer token.
    if (value.WEB_ORIGIN === "*") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["WEB_ORIGIN"],
        message: "WEB_ORIGIN must name the deployed web origin, not a wildcard."
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export const parseEnv = (source: NodeJS.ProcessEnv): Env => envSchema.parse(source);

export const env = parseEnv(process.env);
