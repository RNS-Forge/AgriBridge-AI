import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
// Load environment variables from .env file
dotenv.config();
const serverEnvPath = path.resolve(process.cwd(), 'server/.env');
if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath });
}
const configSchema = z.object({
    PORT: z.coerce.number().default(8000),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/agribridge'),
    REDIS_URL: z.string().default('redis://localhost:6379'),
    JWT_SECRET: z.string().default('super_secret_jwt_sign_key_change_in_production'),
    JWT_REFRESH_SECRET: z.string().default('super_secret_jwt_refresh_key_change_in_production'),
    SUPABASE_URL: z.string().default('https://placeholder.supabase.co'),
    SUPABASE_PUBLISHABLE_KEY: z.string().default(''),
    SUPABASE_SECRET_KEY: z.string().default(''),
    SUPABASE_JWKS_URL: z.string().default(''),
    SMTP_HOST: z.string().default('smtp.gmail.com'),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    DEMO: z.preprocess((val) => {
        if (typeof val === 'string') {
            return val.trim().toLowerCase() === 'true' || val.trim() === '1';
        }
        if (typeof val === 'boolean')
            return val;
        return true;
    }, z.boolean()).default(true),
});
export const config = configSchema.parse({
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SUPABASE_JWKS_URL: process.env.SUPABASE_JWKS_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    DEMO: process.env.DEMO ?? process.env.demo,
});
// Initialize Supabase client
const supabaseKey = config.SUPABASE_SECRET_KEY || config.SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';
export const supabase = createClient(config.SUPABASE_URL || 'https://placeholder.supabase.co', supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});
