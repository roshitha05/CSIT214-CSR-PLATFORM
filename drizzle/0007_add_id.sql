ALTER TABLE "service_requests" DROP CONSTRAINT "service_requests_category_categories_name_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_user_profile_user_profiles_name_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'categories'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "categories" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'user_profiles'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "user_profiles" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_profile" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "category_id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "match_id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "matches_match_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "user_profile_id" integer PRIMARY KEY NOT NULL GENERATED ALWAYS AS IDENTITY (sequence name "user_profiles_user_profile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_category_categories_category_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("category_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_profile_user_profiles_user_profile_id_fk" FOREIGN KEY ("user_profile") REFERENCES "public"."user_profiles"("user_profile_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_name_unique" UNIQUE("name");