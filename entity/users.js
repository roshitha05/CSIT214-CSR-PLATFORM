import { usersTable } from '../database/tables.js';
import Entity from './entity.js';

export default class UsersEntity extends Entity {
    constructor() {
        super();
    }

    async insertUser(user) {
        const { user_id } = (
            await this.db.insert(usersTable).values(user).returning()
        )[0];

        return user_id;
    }
}
