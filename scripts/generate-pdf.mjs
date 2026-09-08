import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = 'c:\\Temp Files\\My Projects\\AgriBridge-AI';
const DOCS_IMG_DIR = path.join(ROOT_DIR, 'docs', 'screenshots');
const LOGO_PATH = path.join(ROOT_DIR, 'client', 'dist', 'logos', 'logo-option3.jpg');
const OUTPUT_PDF_PATH = path.join(ROOT_DIR, 'AgriBridge_Platform_System_Manual.pdf');
const ARTIFACT_PDF_PATH = 'C:\\Users\\6point3_FA0018\\.gemini\\antigravity-ide\\brain\\17ef9662-027f-4bc0-8520-30bd2e22090e\\AgriBridge_Platform_System_Manual.pdf';

function toBase64Image(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return '';
  }
  const ext = path.extname(filePath).replace('.', '').toLowerCase();
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

const logoBase64 = toBase64Image(LOGO_PATH);

const screenshotFiles = [
  { id: '01', file: '01_login.png', title: '01. Standard Login Page', route: '/login', roles: 'Public / All Users', storage: 'users table / JWT in localStorage', desc: 'Secure authentication portal supporting email and password login. Features direct password toggling, role validation, and redirects to dashboard upon JWT issuance.' },
  { id: '02', file: '02_demo_login.png', title: '02. 1-Click Demo Sandbox', route: '/demo/login', roles: 'Public / Reviewers & Evaluators', storage: 'Pre-seeded accounts in phase1Store.users', desc: 'Instant zero-friction evaluation portal. Allows clicking on any of the 7 pre-seeded platform roles with prefilled credentials to inspect role-specific UI immediately.' },
  { id: '03', file: '03_forgot_password.png', title: '03. Password Recovery', route: '/forgot-password', roles: 'Public', storage: 'POST /api/v1/auth/forgot-password OTP tokens', desc: 'Self-service password recovery flow. Users enter their registered email address to receive an OTP or secure reset link.' },
  { id: '04', file: '04_dashboard_hub.png', title: '04. Unified Platform Dashboard Hub', route: '/dashboard', roles: 'All 7 Roles (Farmer, Farm Manager, Worker, Buyer, Mandi Agent, Admin Maker, Admin)', storage: 'Aggregates farms, tasks, crop_cycles, mandi_prices, weather API', desc: 'Central command center displaying live weather warnings, active farm overview, quick actions, today\'s field tasks, dual-channel pricing benchmarks, and recent transactions.' },
  { id: '05', file: '05_farms_plots.png', title: '05. Farms & Plots Management', route: '/farms', roles: 'Farmer, Farm Manager, Admin, SuperAdmin', storage: 'farms & plots tables via /api/v1/farms', desc: 'Master land parcel registry. Left side lists registered farm holdings with acreage and soil type. Right side breaks down each farm into cultivable plots with irrigation methods.' },
  { id: '06', file: '06_crops_lifecycle.png', title: '06. Crop Lifecycle & Harvest Tracking', route: '/crops', roles: 'Farmer, Farm Manager, Admin, SuperAdmin', storage: 'crop_cycles table via /api/v1/crop-cycles', desc: 'Tracks crop progression across growth stages: Sowing -> Vegetative -> Flowering -> Harvest. Records harvest yield, quality grade, and feeds production data into cost-per-kg calculations.' },
  { id: '07', file: '07_field_tasks.png', title: '07. Field Tasks & Operations', route: '/tasks', roles: 'Farmer, Farm Manager, Worker, Admin, SuperAdmin', storage: 'tasks table via /api/v1/tasks', desc: 'Operational field work management. Farm Managers and Farmers create, prioritize, and assign daily agronomic tasks (irrigation, spraying, fertilizing, weeding, harvesting) to Workers with real-time status updates.' },
  { id: '08', file: '08_expenses_cost_basis.png', title: '08. Cost Basis & Cultivation Expenses', route: '/expenses', roles: 'Farmer, Farm Manager, Admin, SuperAdmin', storage: 'expenses table & phase1Store.calculateCropCost()', desc: 'Dynamic financial cost-basis calculator. Tracks every rupee spent on seeds, fertilizers, chemical sprays, irrigation power, labor wages, and machinery to calculate true break-even cost per kg.' },
  { id: '09', file: '09_inventory_consumables.png', title: '09. Inventory & Consumables Stock', route: '/inventory', roles: 'Farm Manager, Farmer, Admin, SuperAdmin', storage: 'inventory_items table via /api/v1/inventory', desc: 'Consumable stock management for agricultural inputs (seeds, bio-fertilizers, pesticides, fuel, drip filters). Tracks quantities on hand, unit costs, and triggers low-stock warnings.' },
  { id: '10', file: '10_produce_marketplace.png', title: '10. Produce Marketplace — Direct Farmgate Sale', route: '/marketplace', roles: 'Farmer, Buyer, Admin, SuperAdmin', storage: 'produce_listings & offers tables', desc: 'Digital B2B farmgate marketplace. Farmers publish harvested lots with quality grades and asking prices. Buyers submit purchase offers. Features an integrated 3-Way Profit Comparison Engine.' },
  { id: '11', file: '11_mandi_slot_booking.png', title: '11. Mandi Slot Booking & Yard Auctions', route: '/mandi', roles: 'Farmer, Mandi Agent, Admin, SuperAdmin', storage: 'mandi_slots & mandi_prices tables', desc: 'Regulated APMC Mandi slot reservation and auction ledger. Farmers pre-book yard arrival tokens with vehicle details. Mandi agents record arrivals, auction weights, commission fees, and final realized prices.' },
  { id: '12', file: '12_orders_logistics.png', title: '12. Orders & Logistics Tracking', route: '/orders', roles: 'Farmer, Buyer, Admin, SuperAdmin', storage: 'orders table via /api/v1/orders', desc: 'End-to-end commercial order fulfillment tracker. Manages order status from confirmation, farmgate collection, transport carrier assignment, delivery verification, to final escrow payout release.' },
  { id: '13', file: '13_profit_reports.png', title: '13. Profit Reports Engine', route: '/profit-reports', roles: 'Farmer, Admin, SuperAdmin', storage: 'Computed via phase1Store.generateProfitReport()', desc: 'Financial analytics and net profit report generator. Correlates gross harvest revenue from both Marketplace and Mandi sales against cumulative cost-basis to display net profit margins.' },
  { id: '14', file: '14_admin_maker_request.png', title: '14. Request New User & Role (Maker)', route: '/admin-maker/create-request', roles: 'Admin Maker, Admin, SuperAdmin', storage: 'user_requests table (PENDING_APPROVAL)', desc: 'Maker input portal. Admin Makers fill out candidate user applications (name, email, phone, requested role, and verification dossier notes) to submit them into the Admin review queue.' },
  { id: '15', file: '15_admin_maker_tracker.png', title: '15. My Role Requests Tracker', route: '/admin-maker/requests', roles: 'Admin Maker, Admin, SuperAdmin', storage: 'user_requests table filtered by requestedBy', desc: 'Real-time tracker for Admin Makers to audit the status of all proposed user requests (Pending Admin Review, Approved, or Rejected with reviewer notes).' },
  { id: '16', file: '16_admin_users_queue.png', title: '16. User Management & Admin Approval Queue (Checker)', route: '/admin/users', roles: 'Admin, SuperAdmin', storage: 'users & user_requests tables', desc: 'High-density enterprise master data table. Admins approve or reject maker requests, directly create instant active accounts across all roles, execute batch CSV bulk imports, toggle account suspension, and export user directories to Excel/CSV.' },
  { id: '17', file: '17_admin_moderation.png', title: '17. Produce Marketplace Moderation', route: '/admin/moderation', roles: 'Admin, SuperAdmin', storage: 'produce_listings table (status: FLAGGED/REMOVED)', desc: 'Quality compliance and market integrity oversight. Admins audit produce listings against Mandi benchmark prices and remove or flag fraudulent lots, poor grade representations, or speculative pricing.' },
  { id: '18', file: '18_admin_disputes.png', title: '18. Disputes & Mediation Center', route: '/admin/disputes', roles: 'Admin, SuperAdmin', storage: 'disputes table via /api/v1/admin/disputes', desc: 'Commercial arbitration queue. Mediates conflicts between Farmers and Buyers regarding produce quality defects, transit delays, weight discrepancies, or payment adjustments.' },
  { id: '19', file: '19_admin_audit_logs.png', title: '19. Security Compliance Audit Logs', route: '/admin/audit-logs', roles: 'Admin, SuperAdmin', storage: 'audit_logs table (Immutable append-only)', desc: 'Immutable compliance log. Records every security-sensitive action taken across the platform: role requests, approvals, account suspensions, listing removals, and arbitration settlements with actor emails and timestamps.' },
];

console.log('Encoding screenshots to Base64...');
const screenshotCardsHtml = screenshotFiles.map((s) => {
  const imgPath = path.join(DOCS_IMG_DIR, s.file);
  const base64 = toBase64Image(imgPath);
  return `
    <div class="view-section">
      <div class="view-header">
        <div class="view-title-row">
          <span class="view-badge">View #${s.id}</span>
          <h3 class="view-title">${s.title}</h3>
        </div>
        <div class="view-meta-row">
          <span class="meta-item"><strong>Route:</strong> <code>${s.route}</code></span>
          <span class="meta-item"><strong>Roles:</strong> <span class="role-badge">${s.roles}</span></span>
        </div>
      </div>
      
      <p class="view-desc">${s.desc}</p>
      
      <div class="screenshot-frame">
        <img class="screenshot-img" src="${base64}" alt="${s.title}" />
      </div>

      <div class="storage-box">
        <span class="storage-icon">💾</span>
        <div>
          <span class="storage-title">Data Storage Location:</span>
          <span class="storage-desc">${s.storage}</span>
        </div>
      </div>
    </div>
  `;
}).join('\n');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AgriBridge-AI Platform System Manual</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.5;
      font-size: 11pt;
    }

    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 40px 20px 60px 20px;
      page-break-after: always;
    }

    .cover-logo-wrapper {
      margin-top: 50px;
    }

    .cover-logo {
      width: 170px;
      height: 170px;
      object-fit: contain;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(0, 0, 0, 0.08);
      background: #ffffff;
      padding: 10px;
    }

    .cover-title-group {
      margin-top: 30px;
    }

    .cover-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 16px;
      border-radius: 9999px;
      margin-bottom: 20px;
    }

    .cover-title {
      font-size: 28pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin-bottom: 12px;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: #475569;
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.45;
    }

    .cover-divider {
      width: 80px;
      height: 4px;
      background: linear-gradient(90deg, #10b981, #059669);
      border-radius: 2px;
      margin: 25px auto;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      max-width: 560px;
      width: 100%;
      text-align: left;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px 24px;
    }

    .cover-meta-item {
      font-size: 9.5pt;
    }

    .cover-meta-item .label {
      color: #64748b;
      font-weight: 600;
      display: block;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .cover-meta-item .val {
      color: #0f172a;
      font-weight: 700;
    }

    .cover-footer {
      font-size: 8.5pt;
      color: #94a3b8;
      letter-spacing: 0.04em;
    }

    /* Section Headings */
    h2.section-heading {
      font-size: 17pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #10b981;
      padding-bottom: 6px;
      margin-top: 28px;
      margin-bottom: 14px;
      letter-spacing: -0.01em;
    }

    h3.subsection-heading {
      font-size: 13pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 18px;
      margin-bottom: 10px;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
      line-height: 1.55;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .badge-yes {
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      display: inline-block;
    }

    .badge-no {
      background: #fee2e2;
      color: #991b1b;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      display: inline-block;
    }

    /* Page-break rules */
    .page-break {
      page-break-after: always;
    }

    .view-section {
      page-break-inside: avoid;
      margin-top: 24px;
      margin-bottom: 24px;
      padding: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    .view-header {
      margin-bottom: 10px;
    }

    .view-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .view-badge {
      background: #0f172a;
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .view-title {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
    }

    .view-meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 8.5pt;
      color: #64748b;
    }

    .meta-item code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 600;
    }

    .role-badge {
      background: #ecfdf5;
      color: #047857;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #a7f3d0;
    }

    .view-desc {
      font-size: 9.5pt;
      color: #334155;
      margin-bottom: 12px;
      line-height: 1.45;
    }

    .screenshot-frame {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #0f172a;
      margin-bottom: 10px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
    }

    .screenshot-img {
      width: 100%;
      height: auto;
      display: block;
    }

    .storage-box {
      background: #f8fafc;
      border-left: 4px solid #10b981;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      font-size: 8.5pt;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-top: 6px;
    }

    .storage-icon {
      font-size: 11pt;
      line-height: 1;
    }

    .storage-title {
      font-weight: 700;
      color: #0f172a;
      margin-right: 4px;
    }

    .storage-desc {
      color: #475569;
    }

    /* Callouts */
    .callout {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 16px;
      margin: 14px 0;
      border-radius: 0 8px 8px 0;
      font-size: 9.5pt;
    }

    .callout-title {
      font-weight: 800;
      color: #1e3a8a;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.05em;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 14px;
      font-size: 9.5pt;
      color: #334155;
    }

    li {
      margin-bottom: 5px;
      line-height: 1.5;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div class="cover-logo-wrapper">
      <img class="cover-logo" src="${logoBase64}" alt="AgriBridge-AI Logo" />
    </div>

    <div class="cover-title-group">
      <span class="cover-badge">Enterprise Platform Documentation</span>
      <h1 class="cover-title">AgriBridge-AI Platform</h1>
      <p class="cover-subtitle">System Architecture, Role-Based Access Control, Agronomy Financials & Complete Page-by-Page Operational Manual</p>
      <div class="cover-divider"></div>
    </div>

    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <span class="label">Document Version</span>
        <span class="val">1.0.0 Enterprise Production</span>
      </div>
      <div class="cover-meta-item">
        <span class="label">Publication Date</span>
        <span class="val">September 8, 2026</span>
      </div>
      <div class="cover-meta-item">
        <span class="label">Platform Coverage</span>
        <span class="val">All 7 User Roles (19 Platform Views)</span>
      </div>
      <div class="cover-meta-item">
        <span class="label">Architecture</span>
        <span class="val">React 18 + Node.js API + PostgreSQL + Maker-Checker</span>
      </div>
    </div>

    <div class="cover-footer">
      CONFIDENTIAL & PROPRIETARY — AGRIBRIDGE TECHNOLOGIES PVT. LTD.
    </div>
  </div>

  <!-- TABLE OF CONTENTS & EXECUTIVE SUMMARY -->
  <div class="page-break">
    <h2 class="section-heading">1. Executive Summary & Core Platform Vision</h2>
    <p><strong>AgriBridge-AI</strong> is an enterprise-grade agricultural intelligence, farm operations, and dual-channel commerce platform engineered specifically for Indian agrarian supply chains.</p>

    <div class="callout">
      <div class="callout-title">Core Problem Solved</div>
      Farmers traditionally harvest crops without visibility into their real cumulative cost-basis (seed, water, fertilizer, labor, and machinery costs per acre). AgriBridge-AI provides a real-time <strong>Cost Basis Engine</strong> calculating true cultivation cost per kilogram, enabling farmers to negotiate with high confidence.
    </div>

    <h3 class="subsection-heading">Key Platform Pillars:</h3>
    <ul>
      <li><strong>Cost-Basis Derivation:</strong> Aggregates verified operational inputs to derive actual cost-per-kg before harvest commitments.</li>
      <li><strong>Dual Selling Channels:</strong> Provides a 3-way margin comparison between <em>Direct Farmgate Bulk Sales</em> (prompt payout, farm pickup) vs. <em>APMC Mandi Yard Auctions</em> (commission deductions, arrival queue).</li>
      <li><strong>Maker-Checker Governance:</strong> Prevents unauthorized administrative actions. <code>Admin Maker</code> proposes new users and credentials; only <code>Admin</code> possesses approval authority.</li>
      <li><strong>Immutable Auditability:</strong> Every role approval, listing moderation, and dispute arbitration writes an append-only audit record.</li>
    </ul>

    <h2 class="section-heading" style="margin-top: 24px;">2. Technology Stack & Persistence Model</h2>
    <table>
      <thead>
        <tr>
          <th>Layer</th>
          <th>Technology</th>
          <th>Primary Responsibilities</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Client Frontend</strong></td>
          <td>React 18, Vite 5, TypeScript, TailwindCSS, Redux Toolkit</td>
          <td>Responsive web app, Enterprise Data Tables, CSV bulk uploaders, high-density views.</td>
        </tr>
        <tr>
          <td><strong>Backend API</strong></td>
          <td>Node.js v24, Express, TypeScript, Crypto</td>
          <td>REST endpoints, JWT authentication, SHA-256 password hashing, CSV export formatting.</td>
        </tr>
        <tr>
          <td><strong>Data Storage</strong></td>
          <td>Supabase PostgreSQL + In-Memory Store</td>
          <td>Hybrid relational storage, real-time calculations, offline seed state resilience.</td>
        </tr>
        <tr>
          <td><strong>Browser State</strong></td>
          <td><code>localStorage</code></td>
          <td>JWT Bearer tokens, active tenant context, and user session cache.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- RBAC MATRIX -->
  <div class="page-break">
    <h2 class="section-heading">3. Role-Based Access Control (RBAC) Matrix</h2>
    <p>AgriBridge-AI enforces strict privilege separation across 7 distinct platform roles:</p>

    <table>
      <thead>
        <tr>
          <th>Module / Route</th>
          <th>Farmer</th>
          <th>Farm Mgr</th>
          <th>Worker</th>
          <th>Buyer</th>
          <th>Mandi Agent</th>
          <th>Admin Maker</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Dashboard Hub</strong> (<code>/dashboard</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Farms & Plots</strong> (<code>/farms</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Crop Lifecycle</strong> (<code>/crops</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Field Tasks</strong> (<code>/tasks</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Cost Basis & Expenses</strong> (<code>/expenses</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Consumables Inventory</strong> (<code>/inventory</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Produce Marketplace</strong> (<code>/marketplace</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Mandi Slot Booking</strong> (<code>/mandi</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Orders & Logistics</strong> (<code>/orders</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Profit Reports</strong> (<code>/profit-reports</code>)</td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Request User Role</strong> (<code>/admin-maker/create-request</code>)</td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>User Requests Tracker</strong> (<code>/admin-maker/requests</code>)</td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Admin Users Queue</strong> (<code>/admin/users</code>)</td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Produce Moderation</strong> (<code>/admin/moderation</code>)</td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Disputes Center</strong> (<code>/admin/disputes</code>)</td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
        <tr>
          <td><strong>Audit Compliance Logs</strong> (<code>/admin/audit-logs</code>)</td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-no">NO</span></td>
          <td><span class="badge-yes">YES</span></td>
        </tr>
      </tbody>
    </table>

    <h2 class="section-heading" style="margin-top: 24px;">4. Data Storage & Schema Mapping ("Where Is It Stored?")</h2>
    <table>
      <thead>
        <tr>
          <th>Entity / Table</th>
          <th>Storage Layer</th>
          <th>What Data Is Stored</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>users</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Email, SHA-256 password hash, role array, account status (active/suspended).</td>
        </tr>
        <tr>
          <td><code>user_requests</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Maker-created role applications, applicant dossiers, reviewer notes, status.</td>
        </tr>
        <tr>
          <td><code>farms</code> & <code>plots</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Land parcels, boundaries, soil classifications, irrigation types (drip, canal).</td>
        </tr>
        <tr>
          <td><code>crop_cycles</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Variety, sowing date, growth stage milestones, harvest yield (kg).</td>
        </tr>
        <tr>
          <td><code>tasks</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Operational assignments, priority, worker assignment, completion proof.</td>
        </tr>
        <tr>
          <td><code>expenses</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Cultivation costs (seeds, fertilizer, labor wages, machinery, electricity).</td>
        </tr>
        <tr>
          <td><code>produce_listings</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Marketplace harvested lots, quality grade (A/B/C), asking price, pickup point.</td>
        </tr>
        <tr>
          <td><code>offers</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Buyer bids, negotiation history, counter-offers, acceptance status.</td>
        </tr>
        <tr>
          <td><code>mandi_slots</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Arrival reservations, vehicle details, yard weighments, commission deductions.</td>
        </tr>
        <tr>
          <td><code>orders</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Fulfilled purchases, transport tracking, escrow delivery milestones.</td>
        </tr>
        <tr>
          <td><code>disputes</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Arbitration cases, evidence files, mediator rulings, settlement refunds.</td>
        </tr>
        <tr>
          <td><code>audit_logs</code></td>
          <td>PostgreSQL / In-Memory</td>
          <td>Immutable security log: timestamp, actor email, action taken, entity ID.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- SECTION 5: COMPLETE PAGE-BY-PAGE MANUAL WITH SCREENSHOTS -->
  <h2 class="section-heading" style="margin-top: 20px;">5. Complete Page-by-Page Manual with Visual Screenshots</h2>
  <p>The following pages document every screen in AgriBridge-AI with live captured screenshots, route URLs, role permissions, operational workflows, and backend storage locations:</p>

  ${screenshotCardsHtml}

  <!-- SECTION 6: COMPLIANCE & AUDITABILITY -->
  <div class="view-section">
    <h2 class="section-heading" style="margin-top: 0;">6. Enterprise Compliance & Security Guarantees</h2>
    <ul>
      <li><strong>Maker-Checker Privilege Separation:</strong> Administrative accounts cannot be created by a single party. An <code>Admin Maker</code> initiates the request, while an independent <code>Admin</code> must approve it before credentials become active.</li>
      <li><strong>Immutable Audit Logging:</strong> Critical state modifications (user approval, account suspension, listing moderation, dispute resolution) trigger an append-only audit log entry with actor email and timestamp.</li>
      <li><strong>Farmer Cost Privacy:</strong> Cultivation expense figures and cost-per-kg calculations are strictly private to the farmer and farm manager. External buyers only see market asking prices and mandi reference benchmarks.</li>
      <li><strong>RFC 4180 CSV & Excel Export Compatibility:</strong> All high-density enterprise tables support one-click bulk CSV export with UTF-8 BOM encoding for seamless Microsoft Excel rendering.</li>
    </ul>
  </div>

</body>
</html>
`;

const tempHtmlPath = path.join(ROOT_DIR, 'scripts', 'temp_manual_for_pdf.html');
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
console.log(`Wrote temporary HTML to ${tempHtmlPath}`);

async function generatePdf() {
  console.log('Launching Google Chrome for PDF printing...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log('Loading HTML template into Chrome...');
  await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' });

  console.log('Generating PDF with A4 layout and background graphics...');
  await page.pdf({
    path: OUTPUT_PDF_PATH,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<div style="font-size: 7.5pt; color: #94a3b8; width: 100%; text-align: right; padding-right: 14mm; font-family: -apple-system, sans-serif;">AgriBridge-AI Enterprise System Manual</div>',
    footerTemplate: '<div style="font-size: 7.5pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm; font-family: -apple-system, sans-serif;"><span>Confidential & Proprietary</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '14mm',
      right: '14mm',
    },
  });

  console.log(`PDF successfully saved to: ${OUTPUT_PDF_PATH}`);

  // Also copy to artifact directory
  fs.copyFileSync(OUTPUT_PDF_PATH, ARTIFACT_PDF_PATH);
  console.log(`Copied PDF to artifact directory: ${ARTIFACT_PDF_PATH}`);

  await browser.close();

  // Clean up temp file
  try {
    fs.unlinkSync(tempHtmlPath);
  } catch (e) {}

  console.log('DONE!');
}

generatePdf().catch((err) => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
