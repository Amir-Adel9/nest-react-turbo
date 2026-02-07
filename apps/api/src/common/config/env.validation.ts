import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z
    .url('MONGODB_URI must be a valid connection string')
    .default('mongodb://localhost:27017/easygenerator'),
  JWT_SECRET: z
    .string()
    .min(1, 'JWT_SECRET is required')
    .default('supersecretkey'),
  ADMIN_SEED_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Config validation error');
  }

  return result.data;
}
