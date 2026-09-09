import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\6point3_FA0018\\.gemini\\antigravity-ide\\brain\\17ef9662-027f-4bc0-8520-30bd2e22090e\\screenshots';
const CLIENT_BASE = 'http://localhost:3000';
const API_BASE = 'http://localhost:8000/api/v1';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Credentials for each role
const USERS = {
  ADMIN: { email: 'admin@agribridge.com', password: 'AgriBridgeAI@2026' },
  ADMIN_MAKER: { email: 'adminmaker@agribridge.com', password: 'AgriBridgeAI@2026' },
  FARMER: { email: 'farmer@agribridge.com', password: 'AgriBridgeAI@2026' },
  FARM_MANAGER: { email: 'farmmanager@agribridge.com', password: 'AgriBridgeAI@2026' },
  WORKER: { email: 'worker@agribridge.com', password: 'AgriBridgeAI@2026' },
  BUYER: { email: 'buyer@agribridge.com', password: 'AgriBridgeAI@2026' },
  MANDI_AGENT: { email: 'mandiagent@agribridge.com', password: 'AgriBridgeAI@2026' },
};

// Login cache
const authTokens = {};

async function fetchTokens() {
  console.log('Obtaining auth tokens for all roles...');
  for (const [role, creds] of Object.entries(USERS)) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (data.success && data.data) {
        authTokens[role] = {
          token: data.data.accessToken,
          user: data.data.user,
        };
        console.log(`✓ Authenticated: ${role} (${creds.email})`);
      } else {
        console.error(`✗ Login failed for ${role}:`, data.message);
      }
    } catch (err) {
      console.error(`✗ Error logging in for ${role}:`, err.message);
    }
  }
}

const PAGES_TO_CAPTURE = [
  // ── Public Pages ──
  {
    id: '01_login',
    title: 'Standard Login Page',
    path: '/login',
    role: null,
  },
  {
    id: '02_demo_login',
    title: '1-Click Demo Sandbox',
    path: '/demo/login',
    role: null,
  },
  {
    id: '03_forgot_password',
    title: 'Password Recovery',
    path: '/forgot-password',
    role: null,
  },

  // ── Platform Hub ──
  {
    id: '04_dashboard_hub',
    title: 'Farmer Platform Dashboard',
    path: '/dashboard',
    role: 'FARMER',
  },
  {
    id: '04b_admin_dashboard',
    title: 'Admin Governance Console',
    path: '/dashboard',
    role: 'ADMIN',
  },

  // ── Farmer Operations & Cultivation ──
  {
    id: '05_farms_plots',
    title: 'Farms & Land Parcel Registry',
    path: '/farms',
    role: 'FARMER',
  },
  {
    id: '06_crops_lifecycle',
    title: 'Crop Cycles & Phenological Stages',
    path: '/crops',
    role: 'FARMER',
  },
  {
    id: '07_field_tasks',
    title: 'Work Orders & Field Tasks',
    path: '/tasks',
    role: 'FARMER',
  },
  {
    id: '08_expenses_cost_basis',
    title: 'Expense Ledger & True Cost-Basis',
    path: '/expenses',
    role: 'FARMER',
  },
  {
    id: '09_inventory_consumables',
    title: 'Consumables & Input Stock',
    path: '/inventory',
    role: 'FARM_MANAGER',
  },

  // ── Direct Marketplace & Commerce ──
  {
    id: '10_produce_marketplace',
    title: 'Direct Produce Marketplace',
    path: '/marketplace',
    role: 'BUYER',
  },
  {
    id: '11_mandi_slot_booking',
    title: 'Mandi APMC Slot Booking',
    path: '/mandi',
    role: 'MANDI_AGENT',
  },
  {
    id: '12_orders_logistics',
    title: 'B2B Trade Orders & Logistics',
    path: '/orders',
    role: 'BUYER',
  },
  {
    id: '13_profit_reports',
    title: 'Profit Report Engine',
    path: '/profit-reports',
    role: 'FARMER',
  },

  // ── Admin Maker Console ──
  {
    id: '14_admin_maker_request',
    title: 'Request New User & Role (Admin Maker)',
    path: '/admin-maker/create-request',
    role: 'ADMIN_MAKER',
  },
  {
    id: '15_admin_maker_tracker',
    title: 'My Role Requests Tracker (Admin Maker)',
    path: '/admin-maker/requests',
    role: 'ADMIN_MAKER',
  },

  // ── Admin Governance & Master Tables ──
  {
    id: '16_admin_users_queue',
    title: 'User Management & Approvals Directory',
    path: '/admin/users',
    role: 'ADMIN',
  },
  {
    id: '16b_admin_create_user',
    title: 'Direct User Provisioning (Admin)',
    path: '/admin/create-user',
    role: 'ADMIN',
  },
  {
    id: '17_admin_moderation',
    title: 'Produce Marketplace Moderation',
    path: '/admin/moderation',
    role: 'ADMIN',
  },
  {
    id: '18_admin_disputes',
    title: 'Disputes & Mediation Center',
    path: '/admin/disputes',
    role: 'ADMIN',
  },
  {
    id: '19_admin_audit_logs',
    title: 'Security Compliance Audit Logs',
    path: '/admin/audit-logs',
    role: 'ADMIN',
  },
];

async function main() {
  await fetchTokens();

  console.log(`\nLaunching Chrome from ${CHROME_PATH}...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1.5,
    },
  });

  const page = await browser.newPage();

  console.log('\nCapturing screenshots for all 19 platform views...');
  for (const item of PAGES_TO_CAPTURE) {
    const targetUrl = `${CLIENT_BASE}${item.path}`;
    const outputPath = path.join(SCREENSHOT_DIR, `${item.id}.png`);

    try {
      // If authentication is required for this view, set localStorage credentials
      if (item.role && authTokens[item.role]) {
        const { token, user } = authTokens[item.role];
        await page.goto(`${CLIENT_BASE}/login`, { waitUntil: 'domcontentloaded' });
        await page.evaluate(
          (t, u) => {
            localStorage.setItem('token', t);
            localStorage.setItem('user', JSON.stringify(u));
            if (u.tenantId) localStorage.setItem('tenantId', u.tenantId);
          },
          token,
          user
        );
      } else if (!item.role) {
        // Clear auth for public pages
        await page.goto(`${CLIENT_BASE}/login`, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenantId');
        });
      }

      console.log(`[${item.id}] Navigating to ${targetUrl} as ${item.role || 'Guest'}...`);
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });

      // Small delay for animations and fonts to settle
      await new Promise((r) => setTimeout(r, 1200));

      await page.screenshot({
        path: outputPath,
        fullPage: false,
      });

      const repoPath = path.resolve('docs/screenshots', `${item.id}.png`);
      fs.copyFileSync(outputPath, repoPath);

      console.log(`  ✓ Saved: ${item.id}.png (${item.title})`);
    } catch (err) {
      console.error(`  ✗ Failed capturing ${item.id}:`, err.message);
    }
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
  console.log(`Location: ${SCREENSHOT_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error running capture script:', err);
  process.exit(1);
});
