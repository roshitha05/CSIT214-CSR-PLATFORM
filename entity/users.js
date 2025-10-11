import { eq, and } from 'drizzle-orm';
import { usersTable } from '../database/tables.js';
import Entity from './entity.js';

export default class UsersEntity extends Entity {
    constructor() {
        super();
    }

    async getUser(user) {
        let query = this.db.select().from(usersTable).$dynamic();

        const conditions = [];
        Object.keys(user).forEach((key) => {
            if (user[key] !== undefined && usersTable[key]) {
                conditions.push(eq(usersTable[key], user[key]));
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
