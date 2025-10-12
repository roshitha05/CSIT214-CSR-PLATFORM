import { and, eq } from 'drizzle-orm';
import { userProfilesTable } from '../database/tables.js';
import Entity from './entity.js';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';

export const insertUserProfileSchema = createInsertSchema(userProfilesTable, {
    name: z.string(),
    description: z.string(),
    other: z.string().optional(),
});

export default class UserProfilesEntity extends Entity {
    constructor() {
        super();
    }

    async getUserProfiles(searchBy = {}) {
        let query = this.db.select().from(userProfilesTable).$dynamic();

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && userProfilesTable[key]) {
                conditions.push(eq(userProfilesTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        return await query;
    }

    async insertUserProfile(userProfile) {
        await this.db.insert(userProfilesTable).values(userProfile);
    }
}
