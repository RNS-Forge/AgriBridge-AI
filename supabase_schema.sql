-- ==============================================================================
-- AgriBridge-AI: Supabase PostgreSQL Schema
-- Paste and execute this script directly in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/biiajpvusqmuozowpeha/sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT ('usr-' || gen_random_uuid()),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  roles TEXT[] NOT NULL DEFAULT ARRAY['FARMER']::TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  tenant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Registration Requests (Closed Registration & Admin Maker Queue)
CREATE TABLE IF NOT EXISTS public.user_requests (
  id TEXT PRIMARY KEY DEFAULT ('req-' || gen_random_uuid()),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  requested_role TEXT NOT NULL,
  requested_by TEXT NOT NULL DEFAULT 'SELF_REGISTER',
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
  id TEXT PRIMARY KEY DEFAULT ('frm-' || gen_random_uuid()),
  farmer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  total_area_acres NUMERIC NOT NULL DEFAULT 1.0,
  soil_type TEXT NOT NULL DEFAULT 'Loamy',
  water_source TEXT NOT NULL DEFAULT 'Borewell & Canal',
  ownership_type TEXT NOT NULL DEFAULT 'Owned',
  latitude NUMERIC,
  longitude NUMERIC,
  manager_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Plots Table
CREATE TABLE IF NOT EXISTS public.plots (
  id TEXT PRIMARY KEY DEFAULT ('plt-' || gen_random_uuid()),
  farm_id TEXT NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area_acres NUMERIC NOT NULL DEFAULT 1.0,
  soil_type TEXT NOT NULL DEFAULT 'Black Soil',
  water_source TEXT NOT NULL DEFAULT 'Drip Irrigation',
  current_crop_cycle_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Crop Cycles Table
CREATE TABLE IF NOT EXISTS public.crop_cycles (
  id TEXT PRIMARY KEY DEFAULT ('cc-' || gen_random_uuid()),
  plot_id TEXT NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  season TEXT NOT NULL DEFAULT 'Kharif',
  sowing_date DATE NOT NULL,
  expected_harvest_date DATE NOT NULL,
  actual_harvest_date DATE,
  stage TEXT NOT NULL DEFAULT 'Sowing',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  expected_yield_kg NUMERIC NOT NULL DEFAULT 1000,
  harvested_quantity_kg NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Field Operations & Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT ('tsk-' || gen_random_uuid()),
  plot_id TEXT NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  crop_cycle_id TEXT REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL DEFAULT 'IRRIGATION',
  description TEXT,
  assigned_to TEXT NOT NULL,
  assigned_to_name TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Consumables Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY DEFAULT ('inv-' || gen_random_uuid()),
  farm_id TEXT NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'FERTILIZER',
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  reorder_level NUMERIC NOT NULL DEFAULT 10,
  batch_number TEXT,
  supplier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Cultivation & Field Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || gen_random_uuid()),
  farm_id TEXT NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_cycle_id TEXT REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'FERTILIZER',
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Mandi Yards & Physical Infrastructure
CREATE TABLE IF NOT EXISTS public.mandi_yards (
  id TEXT PRIMARY KEY DEFAULT ('mandi-' || gen_random_uuid()),
  name TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  commodities_traded TEXT[] NOT NULL DEFAULT ARRAY['Wheat', 'Cotton', 'Soybean']::TEXT[],
  default_commission_rate NUMERIC NOT NULL DEFAULT 2.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Mandi Booking Slots
CREATE TABLE IF NOT EXISTS public.mandi_slots (
  id TEXT PRIMARY KEY DEFAULT ('mslot-' || gen_random_uuid()),
  mandi_id TEXT NOT NULL REFERENCES public.mandi_yards(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_window TEXT NOT NULL DEFAULT '08:00 AM - 12:00 PM',
  capacity_quintals NUMERIC NOT NULL DEFAULT 100,
  booked_quintals NUMERIC NOT NULL DEFAULT 0,
  commodities_accepted TEXT[] NOT NULL DEFAULT ARRAY['Wheat', 'Cotton']::TEXT[],
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Mandi Slot Bookings
CREATE TABLE IF NOT EXISTS public.slot_bookings (
  id TEXT PRIMARY KEY DEFAULT ('sbk-' || gen_random_uuid()),
  slot_id TEXT NOT NULL REFERENCES public.mandi_slots(id) ON DELETE CASCADE,
  mandi_id TEXT NOT NULL REFERENCES public.mandi_yards(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL,
  farmer_name TEXT,
  crop_cycle_id TEXT REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  expected_quantity_kg NUMERIC NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Mandi Sales Records
CREATE TABLE IF NOT EXISTS public.mandi_sales (
  id TEXT PRIMARY KEY DEFAULT ('msale-' || gen_random_uuid()),
  booking_id TEXT NOT NULL REFERENCES public.slot_bookings(id) ON DELETE CASCADE,
  mandi_id TEXT NOT NULL REFERENCES public.mandi_yards(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL,
  crop_cycle_id TEXT,
  crop_name TEXT NOT NULL,
  actual_quantity_kg NUMERIC NOT NULL,
  grade TEXT NOT NULL DEFAULT 'Grade A',
  auction_sale_price_per_kg NUMERIC NOT NULL,
  gross_revenue NUMERIC NOT NULL,
  commission_rate NUMERIC NOT NULL DEFAULT 2.5,
  commission_amount NUMERIC NOT NULL,
  net_payout NUMERIC NOT NULL,
  sold_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Mandi Market Prices (Benchmark MSP / APMC)
CREATE TABLE IF NOT EXISTS public.market_prices (
  id TEXT PRIMARY KEY DEFAULT ('mmp-' || gen_random_uuid()),
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  mandi_name TEXT NOT NULL,
  district TEXT NOT NULL,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  modal_price NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Produce Marketplace Listings
CREATE TABLE IF NOT EXISTS public.produce_listings (
  id TEXT PRIMARY KEY DEFAULT ('lst-' || gen_random_uuid()),
  farmer_id TEXT NOT NULL,
  crop_cycle_id TEXT REFERENCES public.crop_cycles(id) ON DELETE SET NULL,
  crop_name TEXT NOT NULL,
  variety TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'Export Grade A',
  quantity_kg NUMERIC NOT NULL,
  min_order_quantity_kg NUMERIC NOT NULL DEFAULT 100,
  asking_price_per_kg NUMERIC NOT NULL,
  location TEXT NOT NULL,
  harvest_date DATE,
  certifications TEXT[] DEFAULT ARRAY['GlobalGAP']::TEXT[],
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Produce Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY DEFAULT ('ord-' || gen_random_uuid()),
  listing_id TEXT REFERENCES public.produce_listings(id) ON DELETE SET NULL,
  crop_cycle_id TEXT,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT,
  farmer_id TEXT NOT NULL,
  farmer_name TEXT,
  crop_name TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  agreed_price_per_kg NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  delivery_address TEXT NOT NULL,
  scheduled_pickup_date DATE,
  actual_pickup_date DATE,
  actual_delivery_date DATE,
  proof_of_delivery_url TEXT,
  proof_of_delivery_note TEXT,
  logistics_arranged_by TEXT NOT NULL DEFAULT 'PLATFORM',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Platform Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('aud-' || gen_random_uuid()),
  user_id TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Governance Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id TEXT PRIMARY KEY DEFAULT ('disp-' || gen_random_uuid()),
  reference_type TEXT NOT NULL DEFAULT 'ORDER',
  reference_id TEXT NOT NULL,
  raised_by TEXT NOT NULL,
  raised_by_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  admin_notes TEXT,
  resolution_outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Success Confirmation
SELECT 'AgriBridge-AI Schema Successfully Deployed to Supabase' AS status;
