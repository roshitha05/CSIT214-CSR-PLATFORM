import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { usersTable } from '../database/tables.js';

export const insertUserSchema = createInsertSchema(usersTable, {
    fullname: z.string(),
    email: z
        .string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
    username: z.string().min(1, 'Username must be at least 1 character'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone_number: z
        .string()
        .regex(/^[1-9][0-9]{7}$/, 'Invalid phone number format'),
    address: z.string(),
    date_of_birth: z
        .string()
        .regex(
            /^[1-2][0-9]{3}-([0][1-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|[3][0-1])$/,
            'Date must be in YYYY-MM-DD format'
        ),
    status: z.string(),
    user_profile: z.string(),
});

export const searchUsersSchema = z.object({
    user_id: z.string().optional(),
    fullname: z.string().optional(),
    email: z.string().optional(),
    username: z.string().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    date_of_birth: z.string().optional(),
    status: z.string().optional(),
    created_at: z.date().optional(),
});

export const updateUserSchema = z.object({
    fullname: z.string().optional(),
    email: z.string()
        .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
        .optional(),
    username: z.string()
        .min(1, 'Username must be at least 1 character')
        .optional(),
    phone_number: z.string()
        .regex(/^[1-9][0-9]{7}$/, 'Invalid phone number format')
        .optional(),
    address: z.string().optional(),
    date_of_birth: z.string()
        .regex(
            /^[1-2][0-9]{3}-([0][1-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|[3][0-1])$/,
            'Date must be in YYYY-MM-DD format'
        )
        .optional(),
});