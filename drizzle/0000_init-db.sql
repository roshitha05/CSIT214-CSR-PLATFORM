CREATE TABLE "user_profiles" (
	"name" varchar(256) PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"other" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(256) NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" text NOT NULL,
	"phone_number" varchar(256) NOT NULL,
	"address" text NOT NULL,
	"date_of_birth" date,
	"status" varchar(256) NOT NULL,
	"user_profile" varchar(256) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_profile_user_profiles_name_fk" FOREIGN KEY ("user_profile") REFERENCES "public"."user_profiles"("name") ON DELETE no action ON UPDATE no action;