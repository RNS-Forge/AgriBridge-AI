ALTER TABLE "exports" ADD COLUMN "commercial_invoice_number" varchar(100);--> statement-breakpoint
ALTER TABLE "exports" ADD COLUMN "commercial_invoice_url" text;--> statement-breakpoint
ALTER TABLE "exports" ADD COLUMN "packing_list_url" text;--> statement-breakpoint
ALTER TABLE "exports" ADD COLUMN "eligibility_status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "exports" ADD COLUMN "notes" text;