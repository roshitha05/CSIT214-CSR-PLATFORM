import {
    integer,
    pgTable,
    varchar,
    text,
    timestamp,
    date,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
    user_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    fullname: varchar({ length: 256 }).notNull(),
    email: varchar({ length: 256 }).notNull().unique(),
    username: varchar({ length: 256 }).notNull().unique(),
    password: text().notNull(),
    phone_number: varchar({ length: 256 }).notNull(),
    address: text().notNull(),
    date_of_birth: date(),
    status: varchar({ length: 256 }).notNull(),
    user_profile: varchar({ length: 256 })
        .references(() => userProfilesTable.name, {
            onDelete: 'cascade'
        })
        .notNull(),
    created_at: timestamp().defaultNow(),
});

export const userProfilesTable = pgTable('user_profiles', {
    name: varchar({ length: 256 }).primaryKey(),
    description: text().notNull(),
    status: varchar({ length: 256 }).notNull(),
    other: text(),
});
