CREATE TABLE "user_profiles" (
	"user_profile_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_profiles_user_profile_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"other" text,
	CONSTRAINT "user_profiles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(256) NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" text NOT NULL,
	"phone_number" varchar(256) NOT NULL,
	"address" text NOT NULL,
	"data_of_birth" date,
	"status" varchar(256) NOT NULL,
	"user_profile" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_user_profile_user_profiles_user_profile_id_fk" FOREIGN KEY ("user_profile") REFERENCES "public"."user_profiles"("user_profile_id") ON DELETE no action ON UPDATE no action;