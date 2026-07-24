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
  marketplaceWishlists,
  auditLogs, 
  userRoles,
  roles
} from '../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import crypto from 'crypto';

async function runTests() {
  const port = 8017;
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
        tenantName: 'Marketplace Test FPO',
        email,
        password,
        firstName: 'Vijay',
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

    console.log('\n--- Step 4: Create Buyer Profile ---');
    // Register a buyer user directly in DB
    const defaultPasswordHash = crypto.createHmac('sha256', 'Password@123').update('default').digest('hex');
    const [newBuyerUser] = await db
      .insert(users)
      .values({
        tenantId,
        email: `buyer_${Date.now()}@example.com`,
        passwordHash: defaultPasswordHash,
        firstName: 'Aman',
        lastName: 'Gupta',
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
        companyName: 'Aman Food Exports LLC',
        country: 'United Arab Emirates',
        importLicenseNumber: 'EXP-LIC-UAE-99120',
      })
      .returning();
    buyerId = newBuyer.id;
    console.log('Buyer Profile Registered:', newBuyer.companyName);

    console.log('\n--- Step 5: Register Crop & Pool ---');
    const cropName = `Wheat-${Date.now()}`;
    const regCropRes = await fetch(`${baseUrl}/crop/master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: cropName,
        variety: 'Lokwan Premium',
        hsCode: '1001',
      }),
    });
    const cropJson: any = await regCropRes.json();
    cropId = cropJson.data.id;

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
    console.log('Pool registered:', newPool.name);

    console.log('\n--- Step 6: Create FPO Sales Listing ---');
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
        description: 'Excellent moisture content, 12% max. Machine-cleaned.',
        quantityKg: 10000,
        pricePerKg: 25.5,
      }),
    });
    const listJson: any = await listRes.json();
    console.log('Listing Creation Status:', listRes.status);
    console.log('Listing Body:', listJson);
    if (listRes.status !== 201) throw new Error('Listing failed');
    listingId = listJson.data.id;

    console.log('\n--- Step 7: Search, Filter, & Paginate Listings ---');
    const searchRes = await fetch(`${baseUrl}/marketplace/listings?search=Lokwan&minPrice=20&maxPrice=30&sortBy=price&sortOrder=desc&page=1&limit=5`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const searchJson: any = await searchRes.json();
    console.log('Search Query Status:', searchRes.status);
    console.log('Total Results Found:', searchJson.data.length);
    console.log('Matching Title:', searchJson.data[0]?.title);
    if (searchRes.status !== 200 || searchJson.data.length === 0) throw new Error('Search failed');

    console.log('\n--- Step 8: Manage Buyer Wishlist ---');
    // Add to wishlist
    const addWishRes = await fetch(`${baseUrl}/marketplace/wishlist/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ buyerId, listingId }),
    });
    console.log('Add Wishlist Status:', addWishRes.status);

    const getWishRes = await fetch(`${baseUrl}/marketplace/wishlist/${buyerId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const getWishJson: any = await getWishRes.json();
    console.log('Buyer Wishlist items count:', getWishJson.data.length);
    console.log('Wishlisted Listing Title:', getWishJson.data[0]?.listing.title);
    if (getWishJson.data.length === 0) throw new Error('Wishlist query failed');

    console.log('\n--- Step 9: Submit Buyer Offer ---');
    const offerRes = await fetch(`${baseUrl}/marketplace/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        listingId,
        buyerId,
        offerPricePerKg: 22,
        quantityKg: 10000,
      }),
    });
    const offerJson: any = await offerRes.json();
    console.log('Submit Offer Status:', offerRes.status);
    if (offerRes.status !== 201) throw new Error('Offer submit failed');
    offerId = offerJson.data.id;

    console.log('\n--- Step 10: Counter Offer (FPO Negotiation) ---');
    const counterRes = await fetch(`${baseUrl}/marketplace/offer/${offerId}/counter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      body: JSON.stringify({
        counterPricePerKg: 24,
      }),
    });
    const counterJson: any = await counterRes.json();
    console.log('Counter Offer Status:', counterRes.status);
    console.log('Offered By:', counterJson.data.offeredBy);
    console.log('New Counter Price:', counterJson.data.counterPricePerKg);
    if (counterRes.status !== 200) throw new Error('Counter failed');

    console.log('\n--- Step 11: Accept Counter-Offer & Generate Purchase Order ---');
    const acceptRes = await fetch(`${baseUrl}/marketplace/offer/${offerId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const acceptJson: any = await acceptRes.json();
    console.log('Accept Offer Status:', acceptRes.status);
    console.log('Updated Offer Status:', acceptJson.data.status);
    if (acceptRes.status !== 200) throw new Error('Accept failed');

    // Confirm order was generated automatically
    const ordersResult = await db.select().from(orders).where(eq(orders.buyerId, buyerId));
    console.log('Purchase Orders count in database:', ordersResult.length);
    console.log('Purchase Order Total price:', ordersResult[0]?.totalPriceUsd, ordersResult[0]?.currency);
    if (ordersResult.length === 0) throw new Error('PO was not generated');

    // Database Teardown
    console.log('\n--- Step 12: Clean up database ---');
    const adminUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    await db.delete(orders).where(eq(orders.buyerId, buyerId));
    await db.delete(marketplaceOffers).where(eq(marketplaceOffers.listingId, listingId));
    await db.delete(marketplaceWishlists).where(eq(marketplaceWishlists.buyerId, buyerId));
    await db.delete(marketplaceListings).where(eq(marketplaceListings.id, listingId));
    await db.delete(buyers).where(eq(buyers.id, buyerId));
    
    await db.delete(auditLogs).where(eq(auditLogs.userId, buyerUserId));
    await db.delete(userRoles).where(eq(userRoles.userId, buyerUserId));
    await db.delete(users).where(eq(users.id, buyerUserId));

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
    console.log('\n[SUCCESS] All Marketplace module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
