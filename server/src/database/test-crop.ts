import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { users, tenants, farmers, farms, crops, farmerCrops, auditLogs, userRoles } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8013;
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
  let cropId = '';
  let mappingId = '';

  try {
    console.log('\n--- Step 1: Register Tenant ---');
    const tenantRes = await fetch(`${baseUrl}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'Crops Test FPO',
        email,
        password,
        firstName: 'Dilip',
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
        firstName: 'Pratap',
        lastName: 'Singh',
        aadhaarNumber: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
        registrationNumber: `REG-${Date.now()}`,
        bankName: 'SBI',
        accountNumber: '111222333444',
        ifscCode: 'SBIN000111',
        farmName: 'Pratap Organic Farm',
        totalAreaHectares: 2.5,
      }),
    });
    const farmerJson: any = await regFarmerRes.json();
    console.log('Register Farmer Status:', regFarmerRes.status);
    if (regFarmerRes.status !== 201) throw new Error('Farmer registration failed');
    farmerId = farmerJson.data.farmerId;
    farmId = farmerJson.data.farm.id;

    console.log('\n--- Step 5: Create Crop Master ---');
    const cropName = `Maize-${Date.now()}`;
    const regCropRes = await fetch(`${baseUrl}/crop/master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cropName,
        variety: 'Sweet Corn',
        scientificName: 'Zea mays var. saccharata',
        hsCode: '100590',
      }),
    });
    const cropJson: any = await regCropRes.json();
    console.log('Register Crop Status:', regCropRes.status);
    console.log('Register Crop Body:', cropJson);
    if (regCropRes.status !== 201) throw new Error('Crop master registration failed');
    cropId = cropJson.data.id;

    console.log('\n--- Step 6: Map Farmer Crop (Planting/Sowing record) ---');
    const sowingDate = new Date().toISOString();
    const expectedHarvestDate = new Date(Date.now() + 120 * 24 * 3600 * 1000).toISOString(); // 120 days from now

    const regMapRes = await fetch(`${baseUrl}/crop/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        farmerId,
        farmId,
        cropId,
        tenantId,
        sowingDate,
        expectedHarvestDate,
        expectedYieldKg: 4500.5,
        season: 'Kharif',
      }),
    });
    const mapJson: any = await regMapRes.json();
    console.log('Map Farmer Crop Status:', regMapRes.status);
    console.log('Map Farmer Crop Body:', mapJson);
    if (regMapRes.status !== 201) throw new Error('Farmer crop mapping failed');
    mappingId = mapJson.data.id;

    console.log('\n--- Step 7: Get Farmer Crop Details ---');
    const getMappingRes = await fetch(`${baseUrl}/crop/${mappingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const getJson: any = await getMappingRes.json();
    console.log('Get Mapping Status:', getMappingRes.status);
    console.log('Mapped Crop Name:', getJson.data.crop.name);
    console.log('Season:', getJson.data.season);
    console.log('Expected Yield:', getJson.data.expectedYieldKg);
    if (getMappingRes.status !== 200) throw new Error('Get mapping failed');

    console.log('\n--- Step 8: Update Expected Harvest date ---');
    const updateRes = await fetch(`${baseUrl}/crop/${mappingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        expectedYieldKg: 4800,
        season: 'Rabi',
      }),
    });
    const updateJson: any = await updateRes.json();
    console.log('Update Mapping Status:', updateRes.status);
    console.log('Updated Season:', updateJson.data.season);
    console.log('Updated Yield:', updateJson.data.expectedYieldKg);
    if (updateRes.status !== 200) throw new Error('Update mapping failed');

    console.log('\n--- Step 9: Date Logic Validation Check (Expected fail) ---');
    const invalidHarvestDate = new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(); // 10 days ago (before sowing)
    const invalidRes = await fetch(`${baseUrl}/crop/${mappingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        expectedHarvestDate: invalidHarvestDate,
      }),
    });
    const invalidJson: any = await invalidRes.json();
    console.log('Invalid Date Update Status:', invalidRes.status);
    console.log('Invalid Date Update Message:', invalidJson.message);
    if (invalidRes.status !== 500) throw new Error('Should have failed date validation check');

    console.log('\n--- Step 10: Delete Farmer Crop & Crop Master ---');
    const delMapRes = await fetch(`${baseUrl}/crop/${mappingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Delete Mapping Status:', delMapRes.status);
    if (delMapRes.status !== 200) throw new Error('Delete mapping failed');

    const delCropRes = await fetch(`${baseUrl}/crop/master/${cropId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Delete Crop Status:', delCropRes.status);
    if (delCropRes.status !== 200) throw new Error('Delete crop failed');

    // Database Teardown
    console.log('\n--- Step 11: Clean up database ---');
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

    // Delete farmer mapping details (in case they were soft deleted)
    await db.delete(farmerCrops).where(eq(farmerCrops.id, mappingId));

    if (farmerUser[0]) {
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

    // Make sure crop master is physically deleted
    await db.delete(crops).where(eq(crops.id, cropId));

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All Crop module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
