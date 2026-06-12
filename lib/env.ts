import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRATION: z.string().default('24h'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
  
  // Redis (Optional - Upstash)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  
  // App
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Comunidade RP'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional - Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

// Validate and export
try {
  // Only validate on server startup, not on every import
  if (typeof window === 'undefined') {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
      console.error('❌ Invalid environment variables:')
      console.error(result.error.flatten().fieldErrors)
      throw new Error('Invalid environment configuration')
    }
  }
} catch (error) {
  if (process.env.NODE_ENV === 'production') {
    throw error
  }
}

export const env = envSchema.parse(process.env)
