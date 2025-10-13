import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { userProfilesTable } from '../database/tables.js';

export const insertUserProfileSchema = createInsertSchema(userProfilesTable, {
    name: z.string(),
    description: z.string(),
    other: z.string().optional(),
});

export const searchUserProfilesSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    other: z.string().optional()
})

export const updateUserProfileSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    other: z.string().optional(),
})

export const responseUserProfileSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    other: z.string().optional()
})