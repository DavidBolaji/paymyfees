/**
 * Environment Configuration with Validation
 * Uses Zod for runtime validation of environment variables
 */

import { z } from 'zod';

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32, 'REFRESH_TOKEN_SECRET must be at least 32 characters'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Application
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  PORT: z.string().default('3000'),
  
  // Google Sheets (Waitlist)
  GOOGLE_CLIENT_EMAIL: z.string().email().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),
  
  // Payment Gateway - Paystack
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  
  // Payment Gateway - Flutterwave
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_PUBLIC_KEY: z.string().optional(),
  
  // BVN/NIN Verification
  MONO_SECRET_KEY: z.string().optional(),
  SMILE_API_KEY: z.string().optional(),
  SMILE_PARTNER_ID: z.string().optional(),
  
  // Email Service
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@paymyfees.co'),
  
  // SMS Service
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // File Storage - AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  
  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvConfig;

  private constructor() {
    this.config = this.validateEnv();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateEnv(): EnvConfig {
    try {
      const parsed = envSchema.parse(process.env);
      return parsed;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(
          (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
        );
        throw new Error(
          `Environment validation failed:\n${errorMessages.join('\n')}`
        );
      }
      throw error;
    }
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public getAll(): EnvConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }
}

export const env = EnvironmentConfig.getInstance();
