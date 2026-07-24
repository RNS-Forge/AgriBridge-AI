import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';
import { db } from './index.js';
import { 
  users, 
  tenants,
  auditLogs, 
  userRoles,
  roles,
  platformSettings
} from '../db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  const port = 8020;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}/api/v1`;
  const email = `super_admin_${Date.now()}@example.com`;
  const password = 'Password@12345';
  let token = '';
  let tenantId = '';
  let superUserId = '';

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
        tenantName: 'Platform Base FPO',
        email,
        password,
        firstName: 'System',
        lastName: 'Admin',
      }),
    });
    const tenantJson: any = await tenantRes.json();
    console.log('Register Tenant Status:', tenantRes.status);
    if (tenantRes.status !== 201) throw new Error('Tenant registration failed');
    tenantId = tenantJson.data.user.tenantId;
    superUserId = tenantJson.data.user.id;

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

    console.log('\n--- Step 3: Escalate Role to SuperAdmin ---');
    const superAdminRole = await db.select().from(roles).where(eq(roles.name, 'SuperAdmin')).limit(1);
    if (!superAdminRole[0]) throw new Error('SuperAdmin role missing from DB');
    
    // Clear other roles and map user to SuperAdmin
    await db.delete(userRoles).where(eq(userRoles.userId, superUserId));
    await db.insert(userRoles).values({
      userId: superUserId,
      roleId: superAdminRole[0].id,
    });
    console.log('Role escalated to SuperAdmin successfully.');

    console.log('\n--- Step 4: Login as Super Admin ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginJson: any = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    if (loginRes.status !== 200) throw new Error('Login failed');
    token = loginJson.data.accessToken;

    console.log('\n--- Step 5: Get Super Admin Dashboard ---');
    const dashRes = await fetch(`${baseUrl}/superadmin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const dashJson: any = await dashRes.json();
    console.log('Dashboard Status:', dashRes.status);
    console.log('Total Platform Tenants:', dashJson.data.totalTenants);
    console.log('Total Platform Users:', dashJson.data.totalUsers);
    if (dashRes.status !== 200) throw new Error('Dashboard stats query failed');

    console.log('\n--- Step 6: List Tenants & Upgrade Subscription ---');
    const listTenantsRes = await fetch(`${baseUrl}/superadmin/tenants`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const listTenantsJson: any = await listTenantsRes.json();
    console.log('List Tenants Status:', listTenantsRes.status);
    console.log('Current Tenant Plan:', listTenantsJson.data[0]?.subscriptionPlan);

    const upgradeRes = await fetch(`${baseUrl}/superadmin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscriptionPlan: 'enterprise',
      }),
    });
    const upgradeJson: any = await upgradeRes.json();
    console.log('Upgrade Subscription Status:', upgradeRes.status);
    console.log('New Tenant Plan:', upgradeJson.data.subscriptionPlan);
    if (upgradeJson.data.subscriptionPlan !== 'enterprise') throw new Error('Plan upgrade failed');

    console.log('\n--- Step 7: Suspend Tenant FPO ---');
    const suspendRes = await fetch(`${baseUrl}/superadmin/tenants/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'suspended',
      }),
    });
    const suspendJson: any = await suspendRes.json();
    console.log('Suspend Tenant Status:', suspendRes.status);
    console.log('Updated Tenant Status:', suspendJson.data.status);
    if (suspendJson.data.status !== 'suspended') throw new Error('Tenant suspension failed');

    console.log('\n--- Step 8: Update Global Platform Settings ---');
    const settingsRes = await fetch(`${baseUrl}/superadmin/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        settingKey: 'ALLOW_EXPORTS_GLOBAL',
        settingValue: 'true',
      }),
    });
    const settingsJson: any = await settingsRes.json();
    console.log('Save Settings Status:', settingsRes.status);
    console.log('Saved setting:', settingsJson.data.settingKey, '=', settingsJson.data.settingValue);
    if (settingsRes.status !== 200) throw new Error('Save settings failed');

    console.log('\n--- Step 9: List Platform Audit Logs ---');
    const auditRes = await fetch(`${baseUrl}/superadmin/audit-logs?page=1&limit=10`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const auditJson: any = await auditRes.json();
    console.log('Audit Logs Status:', auditRes.status);
    console.log('Logs returned:', auditJson.data.length);
    console.log('Latest log action:', auditJson.data[0]?.action);
    if (auditRes.status !== 200) throw new Error('Audit logs query failed');

    // Database Teardown
    console.log('\n--- Step 10: Clean up database ---');
    await db.delete(platformSettings).where(eq(platformSettings.settingKey, 'ALLOW_EXPORTS_GLOBAL'));
    await db.delete(auditLogs).where(eq(auditLogs.userId, superUserId));
    await db.delete(userRoles).where(eq(userRoles.userId, superUserId));
    await db.delete(users).where(eq(users.id, superUserId));
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    console.log('Database cleaned successfully.');
    console.log('\n[SUCCESS] All Super Admin module integration tests passed!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
