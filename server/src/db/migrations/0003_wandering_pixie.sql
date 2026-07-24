CREATE TABLE "farmer_crops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"farmer_id" uuid NOT NULL,
	"farm_id" uuid NOT NULL,
	"crop_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sowing_date" timestamp with time zone,
	"expected_harvest_date" timestamp with time zone,
	"expected_yield_kg" numeric(12, 2),
	"season" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_farmer_id_farmers_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."farmers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "public"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_crops" ADD CONSTRAINT "farmer_crops_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "farmer_crops_farmer_idx" ON "farmer_crops" USING btree ("farmer_id");--> statement-breakpoint
CREATE INDEX "farmer_crops_farm_idx" ON "farmer_crops" USING btree ("farm_id");--> statement-breakpoint
CREATE INDEX "farmer_crops_crop_idx" ON "farmer_crops" USING btree ("crop_id");--> statement-breakpoint
CREATE INDEX "farmer_crops_tenant_idx" ON "farmer_crops" USING btree ("tenant_id");