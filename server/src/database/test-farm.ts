import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { users, tenants, farmers, farms, auditLogs, userRoles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8012;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1`;
  const email = `fpo_admin_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let token = '';
  let tenantId = '';
  let farmerId = '';
  let farmId = '';

  try {
    console.log('\n--- Step 1: Register Tenant ---');
    const tenantRes = await fetch(`${baseUrl}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'Farms Test FPO',
        email,
        password,
        firstName: 'Anil',
        lastName: 'Patel',
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

    console.log('\n--- Step 4: Register Farmer ---');
    const farmerEmail = `farmer_${Date.now()}@example.com`;
    const regFarmerRes = await fetch(`${baseUrl}/farmer/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        email: farmerEmail,
        password: 'FarmerPassword@123',
        firstName: 'Vikram',
        lastName: 'Singh',
        aadhaarNumber: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
        registrationNumber: `REG-${Date.now()}`,
        bankName: 'SBI',
        accountNumber: '999888777666',
        ifscCode: 'SBIN000999',
        farmName: 'Vikram Seed Farm',
        totalAreaHectares: 3.2,
      }),
    });
    const farmerJson: any = await regFarmerRes.json();
    console.log('Register Farmer Status:', regFarmerRes.status);
    if (regFarmerRes.status !== 201) throw new Error('Farmer registration failed');
    farmerId = farmerJson.data.farmerId;

    console.log('\n--- Step 5: Register Supplementary Farm ---');
    const regFarmRes = await fetch(`${baseUrl}/farm/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        farmerId,
        tenantId,
        name: 'Vikram Highlands Farm',
        soilType: 'Red Loamy',
        totalAreaHectares: 2.8,
        latitude: 22.3072,
        longitude: 73.1812,
        surveyNumber: 'SRV-8820',
        boundaryCoordinates: '{"type":"Polygon","coordinates":[[[73.18,22.30],[73.19,22.30],[73.19,22.31],[73.18,22.31],[73.18,22.30]]]}',
        waterSource: 'Borewell & Drip',
        ownershipType: 'Leased',
      }),
    });
    const farmJson: any = await regFarmRes.json();
    console.log('Register Farm Status:', regFarmRes.status);
    console.log('Register Farm Body:', farmJson);
    if (regFarmRes.status !== 201) throw new Error('Farm registration failed');
    farmId = farmJson.data.id;

    console.log('\n--- Step 6: Get Farm Details ---');
    const getFarmRes = await fetch(`${baseUrl}/farm/${farmId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    });
    const getJson: any = await getFarmRes.json();
    console.log('Get Farm Status:', getFarmRes.status);
    console.log('Water Source:', getJson.data.waterSource);
    console.log('Ownership Type:', getJson.data.ownershipType);
    console.log('Survey Number:', getJson.data.surveyNumber);
    if (getFarmRes.status !== 200) throw new Error('Get Farm details failed');

    console.log('\n--- Step 7: List Farms By Farmer ---');
    const listFarmerRes = await fetch(`${baseUrl}/farm/farmer/${farmerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    });
    const listFarmerJson: any = await listFarmerRes.json();
    console.log('List Farmer Farms Status:', listFarmerRes.status);
    console.log('Total Farms for Farmer:', listFarmerJson.data.length);
    if (listFarmerRes.status !== 200) throw new Error('List farmer farms failed');

    console.log('\n--- Step 8: Update Farm Details ---');
    const updateRes = await fetch(`${baseUrl}/farm/${farmId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        waterSource: 'Canal Irrigation',
        ownershipType: 'Owned',
        totalAreaHectares: 3.5,
      }),
    });
    const updateJson: any = await updateRes.json();
    console.log('Update Farm Status:', updateRes.status);
    console.log('Updated Water Source:', updateJson.data.waterSource);
    console.log('Updated Ownership Type:', updateJson.data.ownershipType);
    console.log('Updated Area:', updateJson.data.totalAreaHectares);
    if (updateRes.status !== 200) throw new Error('Update farm failed');

    console.log('\n--- Step 9: Delete Farm ---');
    const deleteRes = await fetch(`${baseUrl}/farm/${farmId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    });
    console.log('Delete Farm Status:', deleteRes.status);
    if (deleteRes.status !== 200) throw new Error('Delete farm failed');

    // Database Teardown
    console.log('\n--- Step 10: Clean up database ---');
    const adminUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const farmerUser = await db.select().from(users).where(eq(users.email, farmerEmail)).limit(1);

    const userIds: string[] = [];
    if (adminUser[0]) userIds.push(adminUser[0].id);
    if (farmerUser[0]) userIds.push(farmerUser[0].id);

    if (userIds.length > 0) {
      for (const uid of userIds) {
        await db.delete(auditLogs).where(eq(auditLogs.userId, uid));
        await db.delete(userRoles).where(eq(userRoles.userId, uid));
      }
    }

    if (farmerUser[0]) {
      // First clean up supplementary farm, then primary farm (registered during farmer registration)
      await db.delete(farms).where(eq(farms.farmerId, farmerId));
      await db.delete(farmers).where(eq(farmers.id, farmerId));
      await db.delete(users).where(eq(users.id, farmerUser[0].id));
    }

    if (adminUser[0]) {
      await db.delete(users).where(eq(users.id, adminUser[0].id));
      if (adminUser[0].tenantId) {
        await db.delete(tenants).where(eq(tenants.id, adminUser[0].tenantId));
      }
    }
    console.log('Database cleaned successfully.');

    console.log('\n[SUCCESS] All Farm module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
