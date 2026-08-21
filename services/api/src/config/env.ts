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
    AI_SERVICE_URL: z.string().url().default("http://localhost:8000"),
    // Optional SMTP transport for verification email. When unset, the
    // development flow (token in the API response outside production)
    // remains the only delivery path; in production, self-registration
    // answers 503 rather than issuing a challenge nobody can receive.
    // Format: smtp[s]://user:pass@host:port
    SMTP_URL: z.string().min(1).optional(),
    MAIL_FROM: z.string().min(3).default("CAP <no-reply@cap.local>"),
    // How long the API waits for the AI service before giving up.
    //
    // Without a bound, a hung AI service holds the Express request open
    // forever: node's fetch has no default timeout, and the existing
    // catch only sees a refused connection, not a silent one. 15s is
    // deliberately generous -- warm retrieval answers in about 20ms, and
    // the slowest legitimate case is a cold sentence-transformer load of
    // roughly 13s, which the AI service's startup warm-up already
    // covers. Anything past 15s is a fault, not slowness.
    AI_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(15000)
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
