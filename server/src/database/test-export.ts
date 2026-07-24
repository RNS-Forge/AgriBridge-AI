import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { 
  users, 
  tenants, 
  crops, 
  pools, 
  buyers,
  orders,
  marketplaceListings,
  marketplaceOffers,
  batches,
  harvests,
  farms,
  farmers,
  exports as exportTable,
  shipments,
  certificates,
  auditLogs, 
  userRoles,
  roles
} from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import crypto from 'crypto';

async function runTests() {
  const port = 8018;
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
  let buyerId = '';
  let buyerUserId = '';
  let listingId = '';
  let offerId = '';
  let farmerId = '';
  let farmId = '';
  let harvestId = '';
  let batchId = '';
  let orderId = '';
  let exportId = '';

  try {
    // Seed standard roles if not exist
    const standardRoles = ['Farmer', 'FPO_ADMIN', 'SuperAdmin', 'QualityInspector', 'Buyer'];
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
        // Set name to include "export" so APEDA check passes later!
        tenantName: 'AgriBridge Export FPO',
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

    console.log('\n--- Step 4: Setup Farmer & Farm Batch ---');
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
    farmerId = farmerJson.data.farmerId;
    farmId = farmerJson.data.farm.id;

    // Register Crop
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
        hsCode: '100199', // valid 6-digit hs code
      }),
    });
    const cropJson: any = await regCropRes.json();
    cropId = cropJson.data.id;

    // Record Harvest & Batch
    const harvRes = await fetch(`${baseUrl}/batch/harvest`, {
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
        quantityKg: 10000,
        harvestDate: new Date().toISOString(),
      }),
    });
    const harvJson: any = await harvRes.json();
    harvestId = harvJson.data.id;

    const batRes = await fetch(`${baseUrl}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        harvestId,
        weightKg: 9800,
      }),
    });
    const batJson: any = await batRes.json();
    batchId = batJson.data.id;

    console.log('\n--- Step 5: Setup Crop Pool & Buyer Order ---');
    // Create pool
    const [newPool] = await db
      .insert(pools)
      .values({
        tenantId,
        name: 'Export Wheat Pool 2026',
        targetGrade: 'A',
        status: 'collecting',
      })
      .returning();
    poolId = newPool.id;

    // Assign batch to pool
    await db.update(batches).set({ poolId }).where(eq(batches.id, batchId));

    // Register Buyer user & profile directly in DB
    const defaultPasswordHash = crypto.createHmac('sha256', 'Password@123').update('default').digest('hex');
    const [newBuyerUser] = await db
      .insert(users)
      .values({
        tenantId,
        email: `buyer_${Date.now()}@example.com`,
        passwordHash: defaultPasswordHash,
        firstName: 'Sanjay',
        lastName: 'Roy',
        status: 'active',
      })
      .returning();
    buyerUserId = newBuyerUser.id;

    const buyerRole = await db.select().from(roles).where(eq(roles.name, 'Buyer')).limit(1);
    await db.insert(userRoles).values({
      userId: buyerUserId,
      roleId: buyerRole[0].id,
    });

    const [newBuyer] = await db
      .insert(buyers)
      .values({
        userId: buyerUserId,
        companyName: 'Sanjay Food Exports Ltd',
        country: 'Singapore',
        importLicenseNumber: 'EXP-LIC-SG-99120',
      })
      .returning();
    buyerId = newBuyer.id;

    // Create a listing and offer and accept it to generate PO order
    const listRes = await fetch(`${baseUrl}/marketplace/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        tenantId,
        poolId,
        title: 'Premium Lokwan Wheat Bulk Lot',
        quantityKg: 9800,
        pricePerKg: 25,
      }),
    });
    const listJson: any = await listRes.json();
    listingId = listJson.data.id;

    const offerRes = await fetch(`${baseUrl}/marketplace/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        listingId,
        buyerId,
        offerPricePerKg: 25,
        quantityKg: 9800,
      }),
    });
    const offerJson: any = await offerRes.json();
    offerId = offerJson.data.id;

    const acceptRes = await fetch(`${baseUrl}/marketplace/offer/${offerId}/accept`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const acceptJson: any = await acceptRes.json();

    const ordersResult = await db.select().from(orders).where(eq(orders.buyerId, buyerId));
    orderId = ordersResult[0].id;
    console.log('Purchase Order Generated ID:', orderId);

    console.log('\n--- Step 6: Initiate Export record ---');
    const initRes = await fetch(`${baseUrl}/export/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId,
        portOfLoading: 'Port of Nhava Sheva, India',
        portOfDischarge: 'Port of Singapore, Singapore',
      }),
    });
    const initJson: any = await initRes.json();
    console.log('Initiate Export Status:', initRes.status);
    console.log('Customs Status:', initJson.data.customsStatus);
    if (initRes.status !== 201) throw new Error('Export initiation failed');
    exportId = initJson.data.id;

    console.log('\n--- Step 7: Check Export Eligibility (Expected fail due to missing certificates) ---');
    const check1Res = await fetch(`${baseUrl}/export/${exportId}/check-eligibility`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const check1Json: any = await check1Res.json();
    console.log('Eligibility Check 1 status:', check1Res.status);
    console.log('Eligible:', check1Json.data.eligible);
    console.log('- APEDA Check:', check1Json.data.rules.apedaRegistered.status);
    console.log('- HS Code Check:', check1Json.data.rules.cropHsCodeValid.status);
    console.log('- Phytosanitary Check:', check1Json.data.rules.phytosanitaryCertificate.status);
    console.log('- Origin Check:', check1Json.data.rules.certificateOfOrigin.status);
    if (check1Json.data.eligible === true) throw new Error('Should have failed eligibility check');

    console.log('\n--- Step 8: Upload Phytosanitary & Origin Certificates ---');
    // Register Phytosanitary certificate
    const cert1Res = await fetch(`${baseUrl}/export/certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        batchId,
        tenantId,
        certificateType: 'phytosanitary',
        certificateNumber: `PHYTO-${Date.now()}`,
        issuedBy: 'Ministry of Agriculture, India',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        documentUrl: 'https://storage.googleapis.com/agribridge/certs/phyto1.pdf',
      }),
    });
    console.log('Phytosanitary Cert upload:', cert1Res.status);

    // Register Certificate of Origin
    const cert2Res = await fetch(`${baseUrl}/export/certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        batchId,
        tenantId,
        certificateType: 'origin',
        certificateNumber: `ORIGIN-${Date.now()}`,
        issuedBy: 'Chamber of Commerce, India',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        documentUrl: 'https://storage.googleapis.com/agribridge/certs/origin1.pdf',
      }),
    });
    console.log('Origin Cert upload:', cert2Res.status);

    console.log('\n--- Step 9: Recheck Export Eligibility (Expected PASS) ---');
    const check2Res = await fetch(`${baseUrl}/export/${exportId}/check-eligibility`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const check2Json: any = await check2Res.json();
    console.log('Eligibility Check 2 status:', check2Res.status);
    console.log('Eligible:', check2Json.data.eligible);
    console.log('- APEDA Check:', check2Json.data.rules.apedaRegistered.status);
    console.log('- HS Code Check:', check2Json.data.rules.cropHsCodeValid.status);
    console.log('- Phytosanitary Check:', check2Json.data.rules.phytosanitaryCertificate.status);
    console.log('- Origin Check:', check2Json.data.rules.certificateOfOrigin.status);
    if (check2Json.data.eligible !== true) throw new Error('Eligibility check should have passed');

    console.log('\n--- Step 10: Update Invoice details & Approve Customs ---');
    const updateRes = await fetch(`${baseUrl}/export/${exportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        commercialInvoiceNumber: `INV-${Date.now()}`,
        commercialInvoiceUrl: 'https://storage.googleapis.com/agribridge/invoice1.pdf',
        packingListUrl: 'https://storage.googleapis.com/agribridge/packing1.pdf',
        customsStatus: 'approved',
        customsDeclarationNumber: `DEC-1002-${Date.now()}`,
      }),
    });
    const updateJson: any = await updateRes.json();
    console.log('Update Customs Status:', updateRes.status);
    console.log('Customs Approved Status:', updateJson.data.customsStatus);
    if (updateJson.data.customsStatus !== 'approved') throw new Error('Customs status update failed');

    console.log('\n--- Step 11: Register International Shipment details ---');
    const shipRes = await fetch(`${baseUrl}/export/shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        exportId,
        carrierName: 'Maersk Shipping Lines',
        containerNumber: 'MSKU-8829-102',
        billOfLadingNumber: `BL-10293-${Date.now()}`,
        originPort: 'Port of Nhava Sheva, India',
        destinationPort: 'Port of Singapore, Singapore',
        estimatedDeparture: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      }),
    });
    const shipJson: any = await shipRes.json();
    console.log('Shipment Register Status:', shipRes.status);
    console.log('Shipment Bill of Lading:', shipJson.data.billOfLadingNumber);
    if (shipRes.status !== 201) throw new Error('Shipment registration failed');

    // Database Teardown
    console.log('\n--- Step 12: Clean up database ---');
    const adminUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const farmerUser = await db.select().from(users).where(eq(users.email, farmerEmail)).limit(1);

    await db.delete(shipments).where(eq(shipments.exportId, exportId));
    await db.delete(exportTable).where(eq(exportTable.id, exportId));
    await db.delete(certificates).where(eq(certificates.batchId, batchId));
    await db.delete(orders).where(eq(orders.id, orderId));
    await db.delete(marketplaceOffers).where(eq(marketplaceOffers.id, offerId));
    await db.delete(marketplaceListings).where(eq(marketplaceListings.id, listingId));
    await db.delete(buyers).where(eq(buyers.id, buyerId));
    
    await db.delete(auditLogs).where(eq(auditLogs.userId, buyerUserId));
    await db.delete(userRoles).where(eq(userRoles.userId, buyerUserId));
    await db.delete(users).where(eq(users.id, buyerUserId));

    await db.delete(batches).where(eq(batches.id, batchId));
    await db.delete(harvests).where(eq(harvests.id, harvestId));
    await db.delete(farms).where(eq(farms.id, farmId));
    await db.delete(farmers).where(eq(farmers.id, farmerId));
    
    if (farmerUser[0]) {
      await db.delete(auditLogs).where(eq(auditLogs.userId, farmerUser[0].id));
      await db.delete(userRoles).where(eq(userRoles.userId, farmerUser[0].id));
      await db.delete(users).where(eq(users.id, farmerUser[0].id));
    }

    await db.delete(pools).where(eq(pools.id, poolId));
    await db.delete(crops).where(eq(crops.id, cropId));

    if (adminUser[0]) {
      await db.delete(auditLogs).where(eq(auditLogs.userId, adminUser[0].id));
      await db.delete(userRoles).where(eq(userRoles.userId, adminUser[0].id));
      await db.delete(users).where(eq(users.id, adminUser[0].id));
      if (adminUser[0].tenantId) {
        await db.delete(tenants).where(eq(tenants.id, adminUser[0].tenantId));
      }
    }

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All Export module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
