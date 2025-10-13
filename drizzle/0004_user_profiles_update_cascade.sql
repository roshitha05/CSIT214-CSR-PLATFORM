ALTER TABLE "users" DROP CONSTRAINT "users_user_profile_user_profiles_name_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_profile_user_profiles_name_fk" FOREIGN KEY ("user_profile") REFERENCES "public"."user_profiles"("name") ON DELETE cascade ON UPDATE cascade;