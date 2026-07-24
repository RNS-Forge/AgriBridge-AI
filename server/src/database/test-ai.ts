import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { 
  users, 
  tenants,
  auditLogs, 
  userRoles,
  roles
} from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8019;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1`;
  const email = `fpo_admin_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let token = '';

  try {
    // Seed standard roles if not exist
    const standardRoles = ['Farmer', 'FPO_ADMIN', 'SuperAdmin', 'QualityInspector'];
    for (const rName of standardRoles) {
      const existingRole = await db.select().from(roles).where(eq(roles.name, rName)).limit(1);
      if (!existingRole[0]) {
        await db.insert(roles).values({ name: rName, description: `${rName} Role` });
      }
    }

    console.log('\n--- Step 1: Register Tenant ---');
    const tenantRes = await fetch(`${baseUrl}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'AI Test FPO',
        email,
        password,
        firstName: 'Amit',
        lastName: 'Sharma',
      }),
    });
    const tenantJson: any = await tenantRes.json();
    console.log('Register Tenant Status:', tenantRes.status);
    if (tenantRes.status !== 201) throw new Error('Tenant registration failed');

    console.log('\n--- Step 2: Fetch OTP & Verify Email ---');
    const otp = await redis.get(`otp:verify:${email}`);
    console.log(`Retrieved OTP: ${otp}`);
    if (!otp) throw new Error('OTP not found in Redis');

    const verifyRes = await fetch(`${baseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    console.log('Verify Status:', verifyRes.status);
    if (verifyRes.status !== 200) throw new Error('Verification failed');

    console.log('\n--- Step 3: Login as FPO Admin ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginJson: any = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200) throw new Error('Login failed');
    token = loginJson.data.accessToken;

    console.log('\n--- Step 4: Stream AI Assistant (Export Coach) ---');
    const chatRes = await fetch(`${baseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-ai-provider': 'groq',
      },
      body: JSON.stringify({
        mode: 'export_coach',
        messages: [
          { role: 'user', content: 'What documentation do I need to export organic wheat from India to Singapore?' }
        ],
      }),
    });

    console.log('AI Endpoint Status:', chatRes.status);
    if (chatRes.status !== 200) {
      const errorText = await chatRes.text();
      console.log('Error Body:', errorText);
      throw new Error('AI Chat completion request failed');
    }

    console.log('Streaming Response Chunks:');
    const reader = chatRes.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let fullResponse = '';
    
    if (reader) {
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
        }
      }
    }
    console.log(fullResponse.slice(0, 450) + '\n... [Response Truncated for Logging] ...');

    // Database Teardown
    console.log('\n--- Step 5: Clean up database ---');
    const adminUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (adminUser[0]) {
      await db.delete(auditLogs).where(eq(auditLogs.userId, adminUser[0].id));
      await db.delete(userRoles).where(eq(userRoles.userId, adminUser[0].id));
      await db.delete(users).where(eq(users.id, adminUser[0].id));
      if (adminUser[0].tenantId) {
        await db.delete(tenants).where(eq(tenants.id, adminUser[0].tenantId));
      }
    }

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All AI module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
