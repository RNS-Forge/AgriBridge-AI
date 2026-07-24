import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { users, tenants, farmers, farms, harvests, batches, auditLogs, userRoles, crops } from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8014;
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
  let cropId = '00000000-0000-0000-0000-000000000000'; // placeholder or use a real crop ID. Wait, let's select a crop from master or create a crop.
  let harvestId = '';
  let batchId = '';
  let traceabilityCode = '';

  try {
    console.log('\n--- Step 1: Register Tenant ---');
    const tenantRes = await fetch(`${baseUrl}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'Batches Test FPO',
        email,
        password,
        firstName: 'Dinesh',
        lastName: 'Rao',
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
        firstName: 'Hari',
        lastName: 'Prasad',
        aadhaarNumber: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
        registrationNumber: `REG-${Date.now()}`,
        bankName: 'SBI',
        accountNumber: '111222333444',
        ifscCode: 'SBIN000111',
        farmName: 'Hari Wheat Farm',
        totalAreaHectares: 2.5,
      }),
    });
    const farmerJson: any = await regFarmerRes.json();
    console.log('Register Farmer Status:', regFarmerRes.status);
    if (regFarmerRes.status !== 201) throw new Error('Farmer registration failed');
    farmerId = farmerJson.data.farmerId;
    farmId = farmerJson.data.farm.id;

    // Create a crop master first so we have a valid crop ID
    console.log('\n--- Step 5: Create Crop Master ---');
    const cropName = `Wheat-${Date.now()}`;
    const regCropRes = await fetch(`${baseUrl}/crop/master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cropName,
        variety: 'Lokwan',
        scientificName: 'Triticum aestivum',
        hsCode: '100199',
      }),
    });
    const cropJson: any = await regCropRes.json();
    console.log('Register Crop Status:', regCropRes.status);
    if (regCropRes.status !== 201) throw new Error('Crop master registration failed');
    cropId = cropJson.data.id;

    console.log('\n--- Step 6: Create Harvest Entry ---');
    const regHarvestRes = await fetch(`${baseUrl}/batch/harvest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        farmId,
        cropId,
        tenantId,
        quantityKg: 6000,
        moisturePercentage: 12.5,
        harvestDate: new Date().toISOString(),
        grade: 'A',
      }),
    });
    const harvestJson: any = await regHarvestRes.json();
    console.log('Register Harvest Status:', regHarvestRes.status);
    console.log('Register Harvest Body:', harvestJson);
    if (regHarvestRes.status !== 201) throw new Error('Harvest registration failed');
    harvestId = harvestJson.data.id;

    console.log('\n--- Step 7: Create Batch ---');
    const regBatchRes = await fetch(`${baseUrl}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        harvestId,
        weightKg: 5800,
      }),
    });
    const batchJson: any = await regBatchRes.json();
    console.log('Register Batch Status:', regBatchRes.status);
    console.log('Register Batch Body:', batchJson);
    if (regBatchRes.status !== 201) throw new Error('Batch creation failed');
    batchId = batchJson.data.id;
    traceabilityCode = batchJson.data.traceabilityCode;

    console.log('\n--- Step 8: Fetch Traceability Scan Report ---');
    const traceRes = await fetch(`${baseUrl}/batch/trace/${traceabilityCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const traceJson: any = await traceRes.json();
    console.log('Traceability Report Status:', traceRes.status);
    console.log('Traceability Report Error:', traceJson.message || traceJson);
    if (traceRes.status !== 200) throw new Error('Trace report failed');
    console.log('Batch Code:', traceJson.data.traceabilityCode);
    console.log('Sown Crop:', traceJson.data.crop.name, '-', traceJson.data.crop.variety);
    console.log('Cultivated Farm:', traceJson.data.farm.name);
    console.log('Farmer Owner:', traceJson.data.farmer.firstName, traceJson.data.farmer.lastName);
    console.log('Quality Check:', traceJson.data.quality.inspected ? 'Verified' : 'Pending Verification');

    console.log('\n--- Step 9: Update Batch Status ---');
    const updateRes = await fetch(`${baseUrl}/batch/${batchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'inspected',
      }),
    });
    const updateJson: any = await updateRes.json();
    console.log('Update Batch Status:', updateRes.status);
    console.log('New Batch Status:', updateJson.data.status);
    if (updateRes.status !== 200) throw new Error('Update batch status failed');

    console.log('\n--- Step 10: Delete Batch ---');
    const deleteRes = await fetch(`${baseUrl}/batch/${batchId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Delete Batch Status:', deleteRes.status);
    if (deleteRes.status !== 200) throw new Error('Delete batch failed');

    // Confirm harvest status reverted back to 'unbatched'
    const checkHarvest = await db.select().from(harvests).where(eq(harvests.id, harvestId)).limit(1);
    console.log('Reverted Harvest Status:', checkHarvest[0]?.status);
    if (checkHarvest[0]?.status !== 'unbatched') throw new Error('Harvest status was not reverted correctly');

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

    // Clean up batch logs referencing batch
    await db.delete(auditLogs).where(eq(auditLogs.entityId, batchId));

    if (farmerUser[0]) {
      await db.delete(batches).where(eq(batches.id, batchId));
      await db.delete(harvests).where(eq(harvests.id, harvestId));
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

    // Clean up crop
    await db.delete(crops).where(eq(crops.id, cropId)).catch(() => {});

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All Batch module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
