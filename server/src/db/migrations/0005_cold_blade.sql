CREATE TABLE "mandi_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_id" uuid NOT NULL,
	"commodity_name" varchar(150) NOT NULL,
	"variety" varchar(150),
	"arrival_volume_tonnes" numeric(12, 2),
	"min_price" numeric(10, 2),
	"max_price" numeric(10, 2),
	"modal_price" numeric(10, 2),
	"price_date" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "markets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"state" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mandi_prices" ADD CONSTRAINT "mandi_prices_market_id_markets_id_fk" FOREIGN KEY ("market_id") REFERENCES "public"."markets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mandi_prices_commodity_date_idx" ON "mandi_prices" USING btree ("commodity_name","price_date");--> statement-breakpoint
CREATE INDEX "markets_region_idx" ON "markets" USING btree ("state","district");