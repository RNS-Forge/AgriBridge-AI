import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CLIENT_BASE = 'http://localhost:3000';
const API_BASE = 'http://localhost:8000/api/v1';
const DIR = 'C:\\Users\\6point3_FA0018\\.gemini\\antigravity-ide\\brain\\17ef9662-027f-4bc0-8520-30bd2e22090e';

async function main() {
  console.log('Logging in as ADMIN...');
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@agribridge.com', password: 'AgriBridgeAI@2026' }),
  });
  const data = await res.json();
  if (!data.success) {
    console.error('Login failed:', data);
    process.exit(1);
  }
  const { accessToken, user } = data.data;

  console.log('Launching Chrome with 1280x632 viewport...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,632'],
    defaultViewport: {
      width: 1280,
      height: 632,
    },
  });

  const page = await browser.newPage();

  // Set credentials
  await page.goto(`${CLIENT_BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((token, u) => {
    localStorage.setItem('token', token);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
      if (u.tenantId) localStorage.setItem('tenantId', u.tenantId);
    }
  }, accessToken, user);

  // ── TEST 1: LIVE PRICES MONITOR WITH GOVT EMBLEM ──
  console.log('Navigating to Live Prices page (/admin/live-prices)...');
  await page.goto(`${CLIENT_BASE}/admin/live-prices`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  const livePricesInfo = await page.evaluate(() => {
    const mainEl = document.querySelector('main');
    const tableEl = document.querySelector('table');
    const tableContainer = tableEl ? tableEl.parentElement : null;
    const emblemImg = document.querySelector('img[alt*="Government of India"]');

    return {
      emblemFound: !!emblemImg,
      emblemSrc: emblemImg ? emblemImg.src : null,
      docScrollHeight: document.documentElement.scrollHeight,
      docClientHeight: document.documentElement.clientHeight,
      hasDocVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      mainScrollHeight: mainEl ? mainEl.scrollHeight : null,
      mainClientHeight: mainEl ? mainEl.clientHeight : null,
      hasMainVerticalScroll: mainEl ? mainEl.scrollHeight > mainEl.clientHeight : null,
      hasTableVerticalScroll: tableContainer ? tableContainer.scrollHeight > tableContainer.clientHeight : null,
      rowCount: document.querySelectorAll('tbody tr').length,
    };
  });
  console.log('Live Prices Verification:', JSON.stringify(livePricesInfo, null, 2));

  const livePricesShot = path.join(DIR, 'live_prices_zero_scroll.png');
  await page.screenshot({ path: livePricesShot });
  console.log(`Saved screenshot to ${livePricesShot}`);

  // ── TEST 2: USERS DIRECTORY WITH PROFILE PICTURES ──
  console.log('Navigating to Admin Users page (/admin/users)...');
  await page.goto(`${CLIENT_BASE}/admin/users`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('table tbody tr', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1000));

  const usersInfo = await page.evaluate(() => {
    const mainEl = document.querySelector('main');
    const userImages = Array.from(document.querySelectorAll('table tbody tr td img')).map((img) => img.src);
    const tableEl = document.querySelector('table');
    const tableContainer = tableEl ? tableEl.parentElement : null;

    return {
      userImagesCount: userImages.length,
      sampleImages: userImages.slice(0, 5),
      docScrollHeight: document.documentElement.scrollHeight,
      docClientHeight: document.documentElement.clientHeight,
      hasDocVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      mainScrollHeight: mainEl ? mainEl.scrollHeight : null,
      mainClientHeight: mainEl ? mainEl.clientHeight : null,
      hasMainVerticalScroll: mainEl ? mainEl.scrollHeight > mainEl.clientHeight : null,
      hasTableVerticalScroll: tableContainer ? tableContainer.scrollHeight > tableContainer.clientHeight : null,
      rowCount: document.querySelectorAll('tbody tr').length,
    };
  });
  console.log('Admin Users Verification:', JSON.stringify(usersInfo, null, 2));

  const usersShot = path.join(DIR, 'admin_users_with_avatars.png');
  await page.screenshot({ path: usersShot });
  console.log(`Saved screenshot to ${usersShot}`);

  // ── TEST 3: DASHBOARD HUB ZERO SCROLL ──
  console.log('Navigating to Dashboard Hub (/dashboard)...');
  await page.goto(`${CLIENT_BASE}/dashboard`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));

  const dashboardInfo = await page.evaluate(() => {
    const mainEl = document.querySelector('main');
    return {
      docScrollHeight: document.documentElement.scrollHeight,
      docClientHeight: document.documentElement.clientHeight,
      hasDocVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      mainScrollHeight: mainEl ? mainEl.scrollHeight : null,
      mainClientHeight: mainEl ? mainEl.clientHeight : null,
      hasMainVerticalScroll: mainEl ? mainEl.scrollHeight > mainEl.clientHeight : null,
    };
  });
  console.log('Dashboard Hub Verification:', JSON.stringify(dashboardInfo, null, 2));

  const dashShot = path.join(DIR, 'dashboard_zero_scroll.png');
  await page.screenshot({ path: dashShot });
  console.log(`Saved screenshot to ${dashShot}`);

  await browser.close();
}

main().catch((err) => {
  console.error('Error running test script:', err);
  process.exit(1);
});
