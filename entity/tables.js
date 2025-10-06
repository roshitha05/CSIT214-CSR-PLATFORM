import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
    user_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    email: varchar({ length: 256 }).notNull().unique(),
    username: varchar({ length: 256 }).notNull(),
    password: text().notNull(),
    phone_number: varchar({ length: 256 }).notNull(),
    address: text().notNull(),
    data_of_birth: date(),
    status: varchar({ length: 256 }).notNull(),
    user_profile: integer()
        .references(() => userProfilesTable.user_profile_id)
        .notNull(),
    created_at: timestamp().defaultNow(),
});

export const userProfilesTable = pgTable('user_profiles', {
    user_profile_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 256 }).notNull().unique(),
    description: text().notNull(),
    other: text(),
});
