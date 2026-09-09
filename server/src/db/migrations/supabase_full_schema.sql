CREATE TYPE "public"."booking_status" AS ENUM('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "public"."crop_cycle_status" AS ENUM('ACTIVE', 'HARVESTED', 'ABANDONED');
CREATE TYPE "public"."crop_stage" AS ENUM('SOWING', 'GERMINATION', 'VEGETATIVE', 'FLOWERING', 'FRUIT_DEVELOPMENT', 'MATURITY', 'HARVEST');
CREATE TYPE "public"."dispute_status" AS ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED');
CREATE TYPE "public"."expense_source" AS ENUM('MANUAL', 'INVENTORY_CONSUMPTION', 'TASK_LABOUR');
CREATE TYPE "public"."inventory_type" AS ENUM('PURCHASE', 'CONSUMPTION');
CREATE TYPE "public"."offer_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED');
CREATE TYPE "public"."produce_listing_status" AS ENUM('ACTIVE', 'OFFERED', 'SOLD', 'CANCELLED');
CREATE TYPE "public"."produce_order_status" AS ENUM('LISTED', 'OFFERED', 'ACCEPTED', 'SCHEDULED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "public"."slot_status" AS ENUM('OPEN', 'FULL', 'CLOSED');
CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'pending', 'pending_approval');
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(150) NOT NULL,
	"entity_name" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"old_value" text,
	"new_value" text,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "crop_cycles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plot_id" uuid NOT NULL,
	"farm_id" uuid NOT NULL,
	"crop_name" varchar(150) NOT NULL,
	"variety" varchar(100),
	"season" varchar(50) DEFAULT 'Kharif 2026',
	"sowing_date" timestamp with time zone NOT NULL,
	"expected_harvest_date" timestamp with time zone NOT NULL,
	"current_stage" "crop_stage" DEFAULT 'SOWING' NOT NULL,
	"status" "crop_cycle_status" DEFAULT 'ACTIVE' NOT NULL,
	"actual_harvest_date" timestamp with time zone,
	"harvested_quantity_kg" numeric(12, 2),
	"harvest_grade" varchar(20),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "crops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"variety" varchar(100),
	"category" varchar(100),
	"typical_duration_days" integer DEFAULT 90,
	"hs_code" varchar(20),
	CONSTRAINT "crops_name_unique" UNIQUE("name")
);

CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_type" varchar(50) NOT NULL,
	"reference_id" uuid NOT NULL,
	"raised_by" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "dispute_status" DEFAULT 'OPEN' NOT NULL,
	"admin_notes" text,
	"resolution_outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone
);

CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"crop_cycle_id" uuid NOT NULL,
	"category" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"vendor" varchar(255),
	"receipt_url" text,
	"notes" text,
	"source" "expense_source" DEFAULT 'MANUAL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "farm_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"farm_id" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"granted_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "farms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location" text NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"total_area_acres" numeric(10, 2) NOT NULL,
	"soil_type" varchar(100),
	"water_source" varchar(100),
	"ownership_type" varchar(100) DEFAULT 'Owned',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "inventory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"current_stock" numeric(12, 2) DEFAULT '0' NOT NULL,
	"average_unit_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"low_stock_threshold" numeric(12, 2) DEFAULT '10' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "inventory_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"type" "inventory_type" NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_cost" numeric(10, 2) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"crop_cycle_id" uuid,
	"supplier_name" varchar(255),
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "mandi_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop_name" varchar(150) NOT NULL,
	"mandi_name" varchar(255) NOT NULL,
	"district" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"min_price" numeric(10, 2) NOT NULL,
	"max_price" numeric(10, 2) NOT NULL,
	"modal_price" numeric(10, 2) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"arrival_volume_quintals" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "mandi_sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"crop_cycle_id" uuid,
	"crop_name" varchar(150) NOT NULL,
	"actual_quantity_kg" numeric(12, 2) NOT NULL,
	"grade" varchar(20) NOT NULL,
	"auction_sale_price_per_kg" numeric(10, 2) NOT NULL,
	"gross_revenue" numeric(15, 2) NOT NULL,
	"commission_rate" numeric(5, 2) NOT NULL,
	"commission_amount" numeric(15, 2) NOT NULL,
	"net_payout" numeric(15, 2) NOT NULL,
	"sale_date" timestamp with time zone DEFAULT now() NOT NULL,
	"agent_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mandi_sales_booking_id_unique" UNIQUE("booking_id")
);

CREATE TABLE "mandi_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mandi_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"time_window" varchar(100) NOT NULL,
	"capacity_quintals" numeric(10, 2) NOT NULL,
	"booked_quintals" numeric(10, 2) DEFAULT '0' NOT NULL,
	"commodities_accepted" text,
	"status" "slot_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "mandis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"agent_id" uuid NOT NULL,
	"location" text NOT NULL,
	"district" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"commodities_traded" text,
	"default_commission_rate" numeric(5, 2) DEFAULT '2.50' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);

CREATE TABLE "plots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"area_acres" numeric(10, 2) NOT NULL,
	"soil_type" varchar(100) NOT NULL,
	"water_source" varchar(100) NOT NULL,
	"ownership_type" varchar(100) DEFAULT 'Owned' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "produce_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop_cycle_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"crop_name" varchar(150) NOT NULL,
	"variety" varchar(100),
	"quantity_kg" numeric(12, 2) NOT NULL,
	"asking_price_per_kg" numeric(10, 2) NOT NULL,
	"cost_per_kg" numeric(10, 2),
	"nearest_mandi_modal_price" numeric(10, 2),
	"grade" varchar(20),
	"pickup_location" text NOT NULL,
	"available_from" timestamp with time zone NOT NULL,
	"available_until" timestamp with time zone NOT NULL,
	"photos" text,
	"status" "produce_listing_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "produce_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"offered_price_per_kg" numeric(10, 2) NOT NULL,
	"quantity_kg" numeric(12, 2) NOT NULL,
	"total_offer_amount" numeric(15, 2) NOT NULL,
	"counter_price_per_kg" numeric(10, 2),
	"message" text,
	"status" "offer_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "produce_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"offer_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"crop_name" varchar(150) NOT NULL,
	"quantity_kg" numeric(12, 2) NOT NULL,
	"agreed_price_per_kg" numeric(10, 2) NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"status" "produce_order_status" DEFAULT 'LISTED' NOT NULL,
	"scheduled_pickup_date" timestamp with time zone,
	"actual_pickup_date" timestamp with time zone,
	"actual_delivery_date" timestamp with time zone,
	"proof_of_delivery_url" text,
	"proof_of_delivery_note" text,
	"logistics_arranged_by" varchar(50) DEFAULT 'BUYER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "profit_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop_cycle_id" uuid NOT NULL,
	"crop_name" varchar(150) NOT NULL,
	"farm_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"sale_type" varchar(50) NOT NULL,
	"reference_id" uuid NOT NULL,
	"quantity_sold_kg" numeric(12, 2) NOT NULL,
	"sale_price_per_kg" numeric(10, 2) NOT NULL,
	"gross_revenue" numeric(15, 2) NOT NULL,
	"deductions" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_revenue" numeric(15, 2) NOT NULL,
	"total_cost" numeric(15, 2) NOT NULL,
	"net_profit" numeric(15, 2) NOT NULL,
	"margin_percent" numeric(6, 2) NOT NULL,
	"profit_per_kg" numeric(10, 2) NOT NULL,
	"profit_per_acre" numeric(12, 2) NOT NULL,
	"category_breakdown" text,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);

CREATE TABLE "slot_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slot_id" uuid NOT NULL,
	"mandi_id" uuid NOT NULL,
	"farmer_id" uuid NOT NULL,
	"crop_cycle_id" uuid,
	"crop_name" varchar(150) NOT NULL,
	"expected_quantity_kg" numeric(12, 2) NOT NULL,
	"status" "booking_status" DEFAULT 'REQUESTED' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"crop_cycle_id" uuid NOT NULL,
	"farm_id" uuid NOT NULL,
	"plot_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"assigned_to" uuid,
	"priority" "task_priority" DEFAULT 'NORMAL' NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"status" "task_status" DEFAULT 'TODO' NOT NULL,
	"evidence_photo_url" text,
	"completion_notes" text,
	"completed_at" timestamp with time zone,
	"wage_amount" numeric(10, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"license_number" varchar(100),
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"phone" varchar(30),
	"requested_role" varchar(50) NOT NULL,
	"requested_by" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"notes" text,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"phone" varchar(30),
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"tenant_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "weather_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farm_id" uuid NOT NULL,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"actionable_message" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_plot_id_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "crop_cycles" ADD CONSTRAINT "crop_cycles_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_users_id_fk" FOREIGN KEY ("raised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_plot_id_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "farm_permissions" ADD CONSTRAINT "farm_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "farm_permissions" ADD CONSTRAINT "farm_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_inventory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."inventory_items"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "mandi_sales" ADD CONSTRAINT "mandi_sales_booking_id_slot_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."slot_bookings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "mandi_sales" ADD CONSTRAINT "mandi_sales_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "mandi_sales" ADD CONSTRAINT "mandi_sales_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "mandi_sales" ADD CONSTRAINT "mandi_sales_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "mandi_slots" ADD CONSTRAINT "mandi_slots_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "mandis" ADD CONSTRAINT "mandis_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "plots" ADD CONSTRAINT "plots_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "produce_offers" ADD CONSTRAINT "produce_offers_listing_id_produce_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."produce_listings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "produce_offers" ADD CONSTRAINT "produce_offers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_listing_id_produce_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."produce_listings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_offer_id_produce_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."produce_offers"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "profit_reports" ADD CONSTRAINT "profit_reports_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "profit_reports" ADD CONSTRAINT "profit_reports_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "profit_reports" ADD CONSTRAINT "profit_reports_plot_id_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_slot_id_mandi_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."mandi_slots"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_mandi_id_mandis_id_fk" FOREIGN KEY ("mandi_id") REFERENCES "public"."mandis"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "slot_bookings" ADD CONSTRAINT "slot_bookings_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_crop_cycle_id_crop_cycles_id_fk" FOREIGN KEY ("crop_cycle_id") REFERENCES "public"."crop_cycles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_plot_id_plots_id_fk" FOREIGN KEY ("plot_id") REFERENCES "public"."plots"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_requests" ADD CONSTRAINT "user_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "weather_alerts" ADD CONSTRAINT "weather_alerts_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "users_email_uidx" ON "users" USING btree ("email");
