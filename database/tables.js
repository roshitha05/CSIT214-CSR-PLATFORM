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
    date_of_birth: date().notNull(),
    status: varchar({ length: 256 }).notNull(),
    user_profile: varchar({ length: 256 })
        .references(() => userProfilesTable.name, {
            onDelete: 'cascade',
            onUpdate: 'cascade'
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

export const categoriesTable = pgTable('categories', {
    name: varchar({ length: 256 }).primaryKey(),
    description: text().notNull(),
    status: varchar({ length: 256 }).notNull()
});

export const matchesTable = pgTable('matches', {
    service_request: integer()
        .references(() => serviceRequestsTable.service_request_id, {
            onDelete: 'cascade'
        })
        .notNull(),
    matched_by: integer()
        .references(() => usersTable.user_id, {
            onDelete: 'cascade'
        })
        .notNull(),
    status: varchar({ length: 256 }).notNull(),
});

export const serviceRequestsTable = pgTable('service_requests', {
    service_request_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    description: text().notNull(),
    category: varchar({ length: 256 })
        .references(() => categoriesTable.name)
        .notNull(),
    status: varchar({ length: 256 }).notNull(),
    created_by: integer()
        .references(() => usersTable.user_id, {
            onDelete: 'cascade'
        })
        .notNull(),
    view_count: integer().default(0).notNull()
});

export const shortlistsTable = pgTable('shortlists', {
    shortlist_id: integer().primaryKey().generatedAlwaysAsIdentity(),
    service_request: integer()
        .references(() => serviceRequestsTable.service_request_id, {
            onDelete: 'cascade'
        })
        .notNull(),
    shortlisted_by: integer()
        .references(() => usersTable.user_id, {
            onDelete: 'cascade'
        })
        .notNull()
});
