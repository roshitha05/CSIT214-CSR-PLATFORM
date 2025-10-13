import { eq, and } from 'drizzle-orm';
import { usersTable } from '../database/tables.js';
import Entity from './entity.js';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

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
    address: z.string('Address is not a string'),
    date_of_birth: z
        .string()
        .regex(
            /^[1-2][0-9]{3}-([0][1-9]|[1][0-2])-([0][1-9]|[1-2][0-9]|[3][0-1])$/,
            'Date must be in YYYY-MM-DD format'
        ),
    status: z.string(),
    user_profile: z.string(),
});

export default class UsersEntity extends Entity {
    constructor() {
        super();
    }

    async getUsers(searchBy = {}) {
        let query = this.db.select().from(usersTable).$dynamic();

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && usersTable[key]) {
                conditions.push(eq(usersTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        return await query;
    }

    async insertUser(user) {
        const { user_id } = (
            await this.db.insert(usersTable).values(user).returning()
        )[0];

        return user_id;
    }
}
