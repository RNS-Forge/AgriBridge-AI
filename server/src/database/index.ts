import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { config, supabase } from '../config/index.js';
import * as schema from '../db/schema.js';

const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.warn('[Postgres Pool Warning]:', err.message);
});

export const db = drizzle(pool, { schema });
export { pool, supabase };
