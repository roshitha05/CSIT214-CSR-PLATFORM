import { userProfilesTable } from '../database/tables.js';
import Entity from './entity.js';

export default class UserProfilesEntity extends Entity {
    constructor() {
        super();
    }

    async insertUserProfile(name, description, other) {
        await this.db.insert(userProfilesTable).values({
            name: name,
            description: description,
            other: other,
        });
    }
}
