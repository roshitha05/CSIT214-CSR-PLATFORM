CREATE TABLE "categories" (
	"name" varchar(256) PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"status" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"service_request" integer NOT NULL,
	"matched_by" integer NOT NULL,
	"status" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"service_request_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "service_requests_service_request_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" varchar(256) NOT NULL,
	"status" varchar(256) NOT NULL,
	"created_by" integer NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shortlists" (
	"shortlist_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "shortlists_shortlist_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"service_request" integer NOT NULL,
	"shortlisted_by" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "date_of_birth" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_service_request_service_requests_service_request_id_fk" FOREIGN KEY ("service_request") REFERENCES "public"."service_requests"("service_request_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_matched_by_users_user_id_fk" FOREIGN KEY ("matched_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_service_request_service_requests_service_request_id_fk" FOREIGN KEY ("service_request") REFERENCES "public"."service_requests"("service_request_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortlists" ADD CONSTRAINT "shortlists_shortlisted_by_users_user_id_fk" FOREIGN KEY ("shortlisted_by") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;