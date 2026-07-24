import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { 
  users, 
  tenants, 
  farmers, 
  farms, 
  crops, 
  harvests, 
  batches, 
  pools, 
  fpoShares, 
  fpoProfitSplits, 
  fpoProfitAllocations, 
  fpoInvitations, 
  auditLogs, 
  userRoles,
  roles
} from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';

async function runTests() {
  const port = 8016;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1`;
  const email = `fpo_admin_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let token = '';
  let tenantId = '';
  let cropId = '';
  let poolId = '';
  let uploadedFarmers: string[] = [];
  let splitSharesId = '';
  let splitPoolId = '';

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
        tenantName: 'FPOs Test FPO',
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

    console.log('\n--- Step 4: Create Member Invitations ---');
    const invRes = await fetch(`${baseUrl}/fpo/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        email: `new_farmer_${Date.now()}@example.com`,
        role: 'Farmer',
      }),
    });
    const invJson: any = await invRes.json();
    console.log('Invitation Status:', invRes.status);
    console.log('Invitation Token generated:', invJson.data.token ? 'Yes' : 'No');
    if (invRes.status !== 201) throw new Error('Invite failed');

    console.log('\n--- Step 5: Bulk Upload Farmer Members (3 Farmers) ---');
    const t = Date.now();
    const bulkRes = await fetch(`${baseUrl}/fpo/bulk-upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        members: [
          {
            email: `bulk_f1_${t}@example.com`,
            firstName: 'Ramesh',
            lastName: 'Prasad',
            aadhaarNumber: '111122223333',
            registrationNumber: `REG-B1-${t}`,
            bankName: 'SBI',
            accountNumber: '999111',
            farmName: 'Ramesh Farms',
            totalAreaHectares: 2.0,
          },
          {
            email: `bulk_f2_${t}@example.com`,
            firstName: 'Suresh',
            lastName: 'Kumar',
            aadhaarNumber: '444455556666',
            registrationNumber: `REG-B2-${t}`,
            bankName: 'HDFC',
            accountNumber: '999222',
            farmName: 'Suresh Field',
            totalAreaHectares: 3.5,
          },
          {
            email: `bulk_f3_${t}@example.com`,
            firstName: 'Naresh',
            lastName: 'Singh',
            aadhaarNumber: '777788889999',
            registrationNumber: `REG-B3-${t}`,
            bankName: 'ICICI',
            accountNumber: '999333',
            farmName: 'Naresh Highlands',
            totalAreaHectares: 1.8,
          },
        ],
      }),
    });
    const bulkJson: any = await bulkRes.json();
    console.log('Bulk Upload Status:', bulkRes.status);
    console.log('Bulk Upload Error Detail:', bulkJson.message || bulkJson);
    if (bulkRes.status !== 200) throw new Error('Bulk upload request failed');
    console.log('Success Count:', bulkJson.data.successCount);
    console.log('Failed Count:', bulkJson.data.failedCount);
    if (bulkJson.data.successCount !== 3) throw new Error('Bulk upload did not register all members');
    uploadedFarmers = bulkJson.data.members.map((m: any) => m.farmerId);

    console.log('\n--- Step 6: Allocate FPO Shares ---');
    // Allocations: Ramesh (50 shares), Suresh (30 shares), Naresh (20 shares)
    const sharesConfigs = [
      { farmerId: uploadedFarmers[0], count: 50 },
      { farmerId: uploadedFarmers[1], count: 30 },
      { farmerId: uploadedFarmers[2], count: 20 },
    ];

    for (const conf of sharesConfigs) {
      const shareRes = await fetch(`${baseUrl}/fpo/shares`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          tenantId,
          farmerId: conf.farmerId,
          sharesCount: conf.count,
          sharePrice: 10,
        }),
      });
      if (shareRes.status !== 200) throw new Error(`Shares allocation failed for farmer ${conf.farmerId}`);
    }
    console.log('All FPO shares allocated.');

    console.log('\n--- Step 7: Create Crop Pool & Add Harvest Batches ---');
    // Create a crop master first
    const cropName = `Cotton-${Date.now()}`;
    const regCropRes = await fetch(`${baseUrl}/crop/master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cropName,
        variety: 'Bt Cotton',
        hsCode: '5201',
      }),
    });
    const cropJson: any = await regCropRes.json();
    cropId = cropJson.data.id;

    // Create a crop pool
    const [newPool] = await db
      .insert(pools)
      .values({
        tenantId,
        name: 'FPO Bt Cotton Pool 2026',
        targetGrade: 'Premium',
        status: 'collecting',
      })
      .returning();
    poolId = newPool.id;

    // Record harvests & batches for Ramesh (contributes 1000kg) and Suresh (contributes 2000kg)
    const harvestConfigs = [
      { farmerId: uploadedFarmers[0], weight: 1000 },
      { farmerId: uploadedFarmers[1], weight: 2000 },
    ];

    for (const conf of harvestConfigs) {
      const farmRecord = await db.select().from(farms).where(eq(farms.farmerId, conf.farmerId)).limit(1);
      
      const harvRes = await fetch(`${baseUrl}/batch/harvest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          farmId: farmRecord[0].id,
          cropId,
          tenantId,
          quantityKg: conf.weight + 50, // slightly more harvest
          harvestDate: new Date().toISOString(),
        }),
      });
      const harvJson: any = await harvRes.json();
      
      const batRes = await fetch(`${baseUrl}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId,
        },
        body: JSON.stringify({
          tenantId,
          harvestId: harvJson.data.id,
          weightKg: conf.weight,
        }),
      });
      const batJson: any = await batRes.json();
      
      // Associate batch to pool
      await db.update(batches).set({ poolId }).where(eq(batches.id, batJson.data.id));
    }
    console.log('Harvests pooled successfully.');

    console.log('\n--- Step 8: Distribute Profit "by_shares" ---');
    // Distribute 100,000 INR based on shareholding (Ramesh: 50%, Suresh: 30%, Naresh: 20%)
    const splitSharesRes = await fetch(`${baseUrl}/fpo/profit/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        totalProfit: 100000,
        splitType: 'by_shares',
      }),
    });
    const splitSharesJson: any = await splitSharesRes.json();
    console.log('Profit Split Shares Status:', splitSharesRes.status);
    splitSharesId = splitSharesJson.data.id;

    // Verify allocations
    const detailSharesRes = await fetch(`${baseUrl}/fpo/profit/${splitSharesId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const detailSharesJson: any = await detailSharesRes.json();
    console.log('Shares Dist Payout Allocations:');
    detailSharesJson.data.allocations.forEach((a: any) => {
      console.log(`- ${a.farmerName}: Payout: ${a.payoutAmount} INR (Status: ${a.status})`);
    });

    console.log('\n--- Step 9: Distribute Profit "by_pool_contribution" ---');
    // Distribute 90,000 INR based on pool weight contributed (Ramesh: 1000kg (33.33%), Suresh: 2000kg (66.66%))
    const splitPoolRes = await fetch(`${baseUrl}/fpo/profit/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        poolId,
        totalProfit: 90000,
        splitType: 'by_pool_contribution',
      }),
    });
    const splitPoolJson: any = await splitPoolRes.json();
    console.log('Profit Split Pool Status:', splitPoolRes.status);
    splitPoolId = splitPoolJson.data.id;

    // Verify allocations
    const detailPoolRes = await fetch(`${baseUrl}/fpo/profit/${splitPoolId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const detailPoolJson: any = await detailPoolRes.json();
    console.log('Pool Dist Payout Allocations:');
    detailPoolJson.data.allocations.forEach((a: any) => {
      console.log(`- ${a.farmerName}: Payout: ${a.payoutAmount} INR (Status: ${a.status})`);
    });

    // Database Teardown
    console.log('\n--- Step 10: Clean up database ---');
    const adminUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // Delete profit splits logs
    await db.delete(fpoProfitAllocations).where(inArray(fpoProfitAllocations.splitId, [splitSharesId, splitPoolId]));
    await db.delete(fpoProfitSplits).where(inArray(fpoProfitSplits.id, [splitSharesId, splitPoolId]));

    // Delete shares
    await db.delete(fpoShares).where(eq(fpoShares.tenantId, tenantId));

    // Delete invitations
    await db.delete(fpoInvitations).where(eq(fpoInvitations.tenantId, tenantId));

    // Delete batches and harvests
    const farmRecords = await db.select().from(farms).where(eq(farms.tenantId, tenantId));
    const farmIds = farmRecords.map((f) => f.id);
    if (farmIds.length > 0) {
      await db.delete(batches).where(eq(batches.tenantId, tenantId));
      await db.delete(harvests).where(eq(harvests.tenantId, tenantId));
      await db.delete(farms).where(eq(farms.tenantId, tenantId));
    }

    // Delete pool & crop
    await db.delete(pools).where(eq(pools.id, poolId));
    await db.delete(crops).where(eq(crops.id, cropId));

    // Delete bulk users
    const bulkEmails = [
      `bulk_f1_${t}@example.com`,
      `bulk_f2_${t}@example.com`,
      `bulk_f3_${t}@example.com`,
    ];
    const bulkUsers = await db.select().from(users).where(inArray(users.email, bulkEmails));
    const bulkUserIds = bulkUsers.map((u) => u.id);

    if (bulkUserIds.length > 0) {
      await db.delete(auditLogs).where(inArray(auditLogs.userId, bulkUserIds));
      await db.delete(userRoles).where(inArray(userRoles.userId, bulkUserIds));
      await db.delete(farmers).where(inArray(farmers.userId, bulkUserIds));
      await db.delete(users).where(inArray(users.id, bulkUserIds));
    }

    // Delete Admin
    if (adminUser[0]) {
      await db.delete(auditLogs).where(eq(auditLogs.userId, adminUser[0].id));
      await db.delete(userRoles).where(eq(userRoles.userId, adminUser[0].id));
      await db.delete(users).where(eq(users.id, adminUser[0].id));
      if (adminUser[0].tenantId) {
        await db.delete(tenants).where(eq(tenants.id, adminUser[0].tenantId));
      }
    }

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All FPO module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
