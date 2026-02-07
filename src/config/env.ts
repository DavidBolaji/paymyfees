/**
 * Environment Configuration with Validation
 * Uses Zod for runtime validation of environment variables
 */

import { z } from 'zod';

// Base environment schema with common variables
const baseEnvSchema = {
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
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
  
  // Direct Database URL (for migrations)
  DIRECT_URL: z.string().optional(),
};

// Environment-specific configurations
const envConfigs = {
  // Local development environment
  development: {
    ...baseEnvSchema,
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for development'),
  },
  
  // Staging environment
  staging: {
    ...baseEnvSchema,
    NODE_ENV: z.literal('production'), // Staging uses production mode but with different configs
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for staging'),
  },
  
  // Production environment
  production: {
    ...baseEnvSchema,
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for production'),
  },
  
  // Test environment
  test: {
    ...baseEnvSchema,
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for testing'),
  },
};

// Determine which environment to use
const getEnvConfig = () => {
  // Default to development
  const environment = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'staging':
      return z.object(envConfigs.staging);
    case 'production':
      return z.object(envConfigs.production);
    case 'test':
      return z.object(envConfigs.test);
    case 'development':
    default:
      return z.object(envConfigs.development);
  }
};

const envSchema = getEnvConfig();

export type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvConfig | null = null;
  private currentEnv: string;
  private initError: Error | null = null;

  private constructor() {
    this.currentEnv = process.env.APP_ENV || process.env.NODE_ENV || 'development';
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Lazily validate and cache the environment config.
   * Only throws when a value is actually accessed, not at import time.
   */
  private ensureConfig(): EnvConfig {
    if (this.config) return this.config;

    try {
      this.config = envSchema.parse(process.env);
      return this.config;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(
          (err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`
        );
        this.initError = new Error(
          `Environment validation failed:\n${errorMessages.join('\n')}`
        );
        console.error(this.initError.message);
      } else {
        this.initError = error instanceof Error ? error : new Error(String(error));
      }
      throw this.initError;
    }
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.ensureConfig()[key];
  }

  public getAll(): EnvConfig {
    return { ...this.ensureConfig() };
  }

  public getCurrentEnvironment(): string {
    return this.currentEnv;
  }

  public isDevelopment(): boolean {
    return this.currentEnv === 'development';
  }

  public isStaging(): boolean {
    return this.currentEnv === 'staging';
  }

  public isProduction(): boolean {
    return this.currentEnv === 'production';
  }

  public isTest(): boolean {
    return this.currentEnv === 'test';
  }
}

export const env = EnvironmentConfig.getInstance();
