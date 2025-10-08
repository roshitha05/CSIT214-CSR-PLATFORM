import { userProfilesTable } from '../database/tables.js';
import Entity from './entity.js';

export default class UserProfilesEntity extends Entity {
    constructor() {
        super();
    }

    async insertUserProfile(userProfile) {
        await this.db.insert(userProfilesTable).values(userProfile);
    }
}
