import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  ENCRYPTION_KEY: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  APP_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:3001'),
  // S3-compatible storage (MinIO/AWS S3/DigitalOcean Spaces/etc.)
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().default('canary-uploads'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_REGION: z.string().default('us-east-1'),
  S3_PUBLIC_URL: z.string().url().optional(), // Public URL for serving files (CDN or direct)
  // PDF Generation (Gotenberg)
  GOTENBERG_URL: z.string().url().optional(),
  // Background Worker
  WORKER_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  WORKER_CONCURRENCY: z.coerce.number().default(5),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
