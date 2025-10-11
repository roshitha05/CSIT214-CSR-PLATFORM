import { userProfilesTable } from '../database/tables.js';
import Entity from './entity.js';

export default class UserProfilesEntity extends Entity {
    constructor() {
        super();
    }

    async getUserProfiles() {
        const userProfiles = await this.db.select().from(userProfilesTable);

        return userProfiles;
    }

    async insertUserProfile(userProfile) {
        await this.db.insert(userProfilesTable).values(userProfile);
    }
}
