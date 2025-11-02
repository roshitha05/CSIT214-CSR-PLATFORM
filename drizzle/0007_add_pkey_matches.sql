ALTER TABLE "matches" ADD PRIMARY KEY ("service_request");--> statement-breakpoint
ALTER TABLE "service_requests" ADD COLUMN "date_created" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "service_requests" ADD COLUMN "date_completed" timestamp;