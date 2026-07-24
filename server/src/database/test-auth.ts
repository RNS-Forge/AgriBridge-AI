import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { users, tenants } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8010;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1/auth`;
  const email = `test_fpo_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let accessToken = '';
  let refreshToken = '';

  try {
    console.log('\n--- Test 1: Register Tenant FPO ---');
    const regRes = await fetch(`${baseUrl}/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'Test Agri FPO',
        email,
        password,
        firstName: 'Sanjay',
        lastName: 'Patel',
      }),
    });
    const regJson = await regRes.json();
    console.log('Register Response Status:', regRes.status);
    console.log('Register Response Body:', regJson);

    if (regRes.status !== 201) throw new Error('Registration failed');

    console.log('\n--- Test 2: Fetch OTP from Redis & Verify Email ---');
    const otp = await redis.get(`otp:verify:${email}`);
    console.log(`Retrieved OTP from Redis for ${email}:`, otp);
    if (!otp) throw new Error('OTP not found in Redis');

    const verifyRes = await fetch(`${baseUrl}/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const verifyJson = await verifyRes.json();
    console.log('Verify Status:', verifyRes.status);
    console.log('Verify Response:', verifyJson);

    if (verifyRes.status !== 200) throw new Error('Email verification failed');

    console.log('\n--- Test 3: Login ---');
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginJson = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginJson);

    if (loginRes.status !== 200) throw new Error('Login failed');
    accessToken = loginJson.data.accessToken;
    refreshToken = loginJson.data.refreshToken;

    console.log('\n--- Test 4: Access Token Refresh ---');
    const refreshRes = await fetch(`${baseUrl}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshJson = await refreshRes.json();
    console.log('Refresh Status:', refreshRes.status);
    console.log('Refresh Response:', refreshJson);

    if (refreshRes.status !== 200) throw new Error('Refresh failed');

    // Clean up test data
    console.log('\n--- Cleaning up test database entries ---');
    const createdUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (createdUser[0]) {
      await db.delete(users).where(eq(users.id, createdUser[0].id));
      if (createdUser[0].tenantId) {
        await db.delete(tenants).where(eq(tenants.id, createdUser[0].tenantId));
      }
      console.log('Cleaned up tenant and user successfully.');
    }

    console.log('\n[Success] All integration tests passed successfully!');
  } catch (error) {
    console.error('\n[Error] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
