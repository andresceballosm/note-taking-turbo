import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const serverEnv = createEnv({
  server: {
    // Application
    PORT: z.coerce.number().default(3000),
    APP_ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    LOG_LEVEL: z
      .enum(["DEBUG", "INFO", "WARN", "ERROR", "FATAL"])
      .default("DEBUG"),

    // NextAuth.js - Required for authentication
    AUTH_SECRET: z
      .string()
      .min(32, "AUTH_SECRET must be at least 32 characters")
      .default(
        process.env.NODE_ENV === "development"
          ? "development-secret-key-min-32-chars-required-change-in-prod"
          : "",
      ),
    AUTH_URL: z
      .string()
      .url()
      .default(
        process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
      ),
    AUTH_TRUST_HOST: z
      .string()
      .transform((val) => val === "true" || val === "1")
      .default("true"),

    // Next.js
    NEXT_TELEMETRY_DISABLED: z
      .string()
      .transform((val) => val === "true" || val === "1")
      .default("1"),
  },
  // For build time we may not have all env vars available
  skipValidation: process.env.SKIP_ENV_VALIDATIONS === "true",
  emptyStringAsUndefined: true,
  // Makes this config available at runtime
  runtimeEnv: process.env,
});

export default serverEnv;
