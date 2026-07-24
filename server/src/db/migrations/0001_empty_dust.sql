CREATE TYPE "public"."kyc_status" AS ENUM('pending', 'verified', 'rejected');--> statement-breakpoint
ALTER TABLE "farmers" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "farmers" ADD COLUMN "account_number" varchar(50);--> statement-breakpoint
ALTER TABLE "farmers" ADD COLUMN "ifsc_code" varchar(20);--> statement-breakpoint
ALTER TABLE "farmers" ADD COLUMN "kyc_status" "kyc_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "farmers" ADD COLUMN "kyc_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "farmers" ADD COLUMN "document_url" text;--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "survey_number" varchar(100);--> statement-breakpoint
ALTER TABLE "farms" ADD COLUMN "boundary_coordinates" text;