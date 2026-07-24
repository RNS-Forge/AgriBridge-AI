import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { users, tenants, farmers, farms, auditLogs, userRoles } from '../db/schema.js';
import { eq, isNull, or } from 'drizzle-orm';

async function runTests() {
  const port = 8011;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1`;
  const email = `fpo_admin_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let token = '';
  let tenantId = '';
  let farmerId = '';

  try {
    console.log('\n--- Step 1: Register Tenant ---');
    const tenantRes = await fetch(`${baseUrl}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantName: 'Farmer Test FPO',
        email,
        password,
        firstName: 'Rajesh',
        lastName: 'Sharma',
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
        firstName: 'Ramesh',
        lastName: 'Kumar',
        aadhaarNumber: Math.floor(100000000000 + Math.random() * 899999999999).toString(),
        registrationNumber: `REG-${Date.now()}`,
        bankName: 'State Bank of India',
        accountNumber: '100029384756',
        ifscCode: 'SBIN0001234',
        farmName: 'Ramesh Green Farms',
        soilType: 'Black Clay',
        totalAreaHectares: 4.5,
        latitude: 23.0225,
        longitude: 72.5714,
        surveyNumber: 'SRV-1029',
        boundaryCoordinates: '{"type":"Polygon","coordinates":[[[72.57,23.02],[72.58,23.02],[72.58,23.03],[72.57,23.03],[72.57,23.02]]]}',
        documentUrl: 'https://storage.googleapis.com/agribridge-docs/land-record-ramesh.pdf',
      }),
    });
    const farmerJson: any = await regFarmerRes.json();
    console.log('Register Farmer Status:', regFarmerRes.status);
    console.log('Register Farmer Body:', farmerJson);
    if (regFarmerRes.status !== 201) throw new Error('Farmer registration failed');
    farmerId = farmerJson.data.farmerId;

    console.log('\n--- Step 5: Get Farmer Details ---');
    const getFarmerRes = await fetch(`${baseUrl}/farmer/${farmerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    });
    const getJson: any = await getFarmerRes.json();
    console.log('Get Farmer Status:', getFarmerRes.status);
    console.log('Farmer Geo Location:', getJson.data.farm.latitude, ',', getJson.data.farm.longitude);
    console.log('Farmer Bank Details:', getJson.data.bankName, getJson.data.accountNumber);
    if (getFarmerRes.status !== 200) throw new Error('Get Farmer details failed');

    console.log('\n--- Step 6: List Farmers under Tenant ---');
    const listRes = await fetch(`${baseUrl}/farmer/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    });
    const listJson: any = await listRes.json();
    console.log('List Farmers Status:', listRes.status);
    console.log('Total Farmers under FPO:', listJson.data.length);
    if (listRes.status !== 200) throw new Error('List farmers failed');

    console.log('\n--- Step 7: Update Farmer & Verify KYC ---');
    const updateRes = await fetch(`${baseUrl}/farmer/${farmerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        bankName: 'HDFC Bank',
        kycStatus: 'verified',
        totalAreaHectares: 5.2,
      }),
    });
    const updateJson: any = await updateRes.json();
    console.log('Update Farmer Status:', updateRes.status);
    console.log('Updated KYC Status:', updateJson.data.kycStatus);
    console.log('Updated KYC Verification Time:', updateJson.data.kycVerifiedAt);
    console.log('Updated Land Area:', updateJson.data.farm.totalAreaHectares);
    if (updateRes.status !== 200) throw new Error('Update farmer failed');

    console.log('\n--- Step 8: Delete Farmer ---');
    const deleteRes = await fetch(`${baseUrl}/farmer/${farmerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    });
    console.log('Delete Farmer Status:', deleteRes.status);
    if (deleteRes.status !== 200) throw new Error('Delete farmer failed');

    // Clean up FPO Tenant Admin & Farmer
    console.log('\n--- Step 9: Clean up database ---');
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

    console.log('\n[SUCCESS] All Farmer module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
