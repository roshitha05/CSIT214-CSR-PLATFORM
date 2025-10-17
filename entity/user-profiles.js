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
        if (await this.nameExists(userProfile.name)) return false;

        await this.db.insert(userProfilesTable).values(userProfile);
        return true;
    }

    async updateUserProfile(name, update) {
        if (!await this.nameExists(name)) return false;
        if (
            update.name !== undefined
            && !await this.nameExists(update.name)
        ) return false;

        const setQuery = {};
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined && userProfilesTable[key]) {
                setQuery[key] = update[key]
            }
        });

        await this.db
            .update(userProfilesTable)
            .set(setQuery)
            .where(ilike(userProfilesTable.name, name))

        return true;
    }

    async nameExists(name) {
        const nameExists = await this.getUserProfiles({ name });

        if (nameExists.length > 0) return true;
        return false;
    }
}
