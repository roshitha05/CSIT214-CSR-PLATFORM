import { and, eq, ilike } from 'drizzle-orm';
import { userProfilesTable } from '../database/tables.js';
import Entity from './entity.js';

export default class UserProfilesEntity extends Entity {
    constructor() {
        super();
    }

    async getUserProfiles(searchBy = {}) {
        let query = this.db.select().from(userProfilesTable).$dynamic();

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && userProfilesTable[key]) {
                if (key === "name") {
                    conditions.push(ilike(userProfilesTable[key], searchBy[key]))
                } else {
                conditions.push(eq(userProfilesTable[key], searchBy[key]));
                }
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

    async updateUserProfile(name, update) {
        const setQuery = {};
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined && userProfilesTable[key]) {
                setQuery[key] = update[key]
            }
        });

        const query = this.db
            .update(userProfilesTable)
            .set(setQuery)
            .where(ilike(userProfilesTable.name, name))

        return await query;
    }
}
