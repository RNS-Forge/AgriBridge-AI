import { pool } from './index.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('[Database] Testing connection...');
  try {
    const client = await pool.connect();
    console.log('[Database] Successfully connected to PostgreSQL!');
    const result = await client.query('SELECT NOW()');
    console.log('[Database] Server time:', result.rows[0].now);
    client.release();
    process.exit(0);
  } catch (error: any) {
    console.error('[Database] Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
