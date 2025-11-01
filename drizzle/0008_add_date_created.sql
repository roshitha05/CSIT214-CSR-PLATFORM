ALTER TABLE "matches" ADD COLUMN "date_created" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "shortlists" ADD COLUMN "date_created" timestamp DEFAULT now();