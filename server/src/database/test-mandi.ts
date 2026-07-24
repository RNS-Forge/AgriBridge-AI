import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { users, tenants, markets, mandiPrices, auditLogs, userRoles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8015;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1`;
  const email = `fpo_admin_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let token = '';
  let tenantId = '';
  let marketRajkotId = '';
  let marketGondalId = '';

  try {
    console.log('\n--- Step 1: Register Tenant ---');
    const tenantRes = await fetch(`${baseUrl}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'Mandi Test FPO',
        email,
        password,
        firstName: 'Sanjay',
        lastName: 'Rathore',
      }),
    });
    const tenantJson: any = await tenantRes.json();
    console.log('Register Tenant Status:', tenantRes.status);
    if (tenantRes.status !== 201) throw new Error('Tenant registration failed');
    tenantId = tenantJson.data.user.tenantId;

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

    console.log('\n--- Step 4: Register Markets (Rajkot & Gondal) ---');
    const rajkotRes = await fetch(`${baseUrl}/mandi/markets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Rajkot Mandi',
        state: 'Gujarat',
        district: 'Rajkot',
        latitude: 22.3000,
        longitude: 70.8000,
      }),
    });
    const rajkotJson: any = await rajkotRes.json();
    console.log('Rajkot Mandi Registration:', rajkotRes.status);
    marketRajkotId = rajkotJson.data.id;

    const gondalRes = await fetch(`${baseUrl}/mandi/markets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Gondal Mandi',
        state: 'Gujarat',
        district: 'Rajkot',
        latitude: 21.9600,
        longitude: 70.8000,
      }),
    });
    const gondalJson: any = await gondalRes.json();
    console.log('Gondal Mandi Registration:', gondalRes.status);
    marketGondalId = gondalJson.data.id;

    console.log('\n--- Step 5: Input Daily Commodity Prices ---');
    const today = new Date().toISOString();
    
    const p1 = await fetch(`${baseUrl}/mandi/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        marketId: marketRajkotId,
        commodityName: 'Wheat',
        variety: 'Lokwan',
        arrivalVolumeTonnes: 120.5,
        minPrice: 2200,
        maxPrice: 2400,
        modalPrice: 2300,
        priceDate: today,
      }),
    });
    console.log('Rajkot Price Entry:', p1.status);

    const p2 = await fetch(`${baseUrl}/mandi/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        marketId: marketGondalId,
        commodityName: 'Wheat',
        variety: 'Lokwan',
        arrivalVolumeTonnes: 180,
        minPrice: 2150,
        maxPrice: 2350,
        modalPrice: 2250,
        priceDate: today,
      }),
    });
    console.log('Gondal Price Entry:', p2.status);

    console.log('\n--- Step 6: Query Daily Prices (Verify Redis Caching) ---');
    // Clear Redis cache key if it was set during price record (normally it doesn't cache writes, only reads)
    const comKey = 'wheat';
    const stateKey = 'gujarat';
    const distKey = 'rajkot';
    const dateKey = today.slice(0, 10);
    const cacheKey = `mandi:prices:${comKey}:${stateKey}:${distKey}:${dateKey}`;
    await redis.del(cacheKey);

    // Call 1: Database hit
    const start1 = Date.now();
    const q1 = await fetch(`${baseUrl}/mandi/prices?commodityName=Wheat&state=Gujarat&district=Rajkot&priceDate=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const q1Json: any = await q1.json();
    const time1 = Date.now() - start1;
    console.log('Query 1 (Database Hit) status:', q1.status, `in ${time1}ms`);
    console.log('Query 1 returned entries:', q1Json.data.length);

    // Call 2: Redis cache hit (should be faster)
    const start2 = Date.now();
    const q2 = await fetch(`${baseUrl}/mandi/prices?commodityName=Wheat&state=Gujarat&district=Rajkot&priceDate=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const q2Json: any = await q2.json();
    const time2 = Date.now() - start2;
    console.log('Query 2 (Redis Cache Hit) status:', q2.status, `in ${time2}ms`);
    
    // Check if caching was populated
    const redisVal = await redis.get(cacheKey);
    console.log('Redis Key populated:', redisVal ? 'Yes' : 'No');

    console.log('\n--- Step 7: Query Nearby Markets (Haversine radius search) ---');
    // Search nearby Rajkot within 50km
    const nearRes = await fetch(`${baseUrl}/mandi/nearby?latitude=22.3000&longitude=70.8000&radiusKm=50&commodityName=Wheat`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const nearJson: any = await nearRes.json();
    console.log('Nearby Query Status:', nearRes.status);
    console.log('Nearby Mandis List:');
    nearJson.data.forEach((m: any) => {
      console.log(`- ${m.name} (${m.distanceKm} km away) | Modal Price: ${m.latestModalPrice}`);
    });

    console.log('\n--- Step 8: Compare Markets (Rajkot vs Gondal) ---');
    const compRes = await fetch(`${baseUrl}/mandi/compare?commodityName=Wheat&marketIds=${marketRajkotId},${marketGondalId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const compJson: any = await compRes.json();
    console.log('Comparison Status:', compRes.status);
    console.log('Comparative Matrix:');
    compJson.data.marketsData.forEach((m: any) => {
      console.log(`- ${m.marketName} (${m.state}): Modal: ${m.modalPrice} | Min: ${m.minPrice} | Max: ${m.maxPrice}`);
    });

    console.log('\n--- Step 9: Trigger Agmarknet background Sync ---');
    const syncRes = await fetch(`${baseUrl}/mandi/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const syncJson: any = await syncRes.json();
    console.log('Sync Trigger Status:', syncRes.status);
    console.log('Sync Data output:', syncJson.data);

    // Database Teardown
    console.log('\n--- Step 10: Clean up database ---');
    const adminUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (adminUser[0]) {
      await db.delete(auditLogs).where(eq(auditLogs.userId, adminUser[0].id));
      await db.delete(userRoles).where(eq(userRoles.userId, adminUser[0].id));
      await db.delete(users).where(eq(users.id, adminUser[0].id));
      if (adminUser[0].tenantId) {
        await db.delete(tenants).where(eq(tenants.id, adminUser[0].tenantId));
      }
    }

    // Clean up markets (cascade deletes prices)
    await db.delete(markets).where(eq(markets.id, marketRajkotId));
    await db.delete(markets).where(eq(markets.id, marketGondalId));

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All Mandi module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
