ALTER TABLE "batches" ADD COLUMN "traceability_code" varchar(150);--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "status" varchar(50) DEFAULT 'created' NOT NULL;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "qr_code_url" text;--> statement-breakpoint
ALTER TABLE "batches" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_traceability_code_unique" UNIQUE("traceability_code");