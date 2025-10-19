ALTER TABLE "service_requests" DROP CONSTRAINT "service_requests_category_categories_name_fk";
--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE cascade ON UPDATE cascade;