import { eq, and } from 'drizzle-orm';
import { usersTable } from '../database/tables.js';
import Entity from './entity.js';


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

    async updateUser(user_id, update) {
            const setQuery = {};
            Object.keys(update).forEach((key) => {
                if (update[key] !== undefined && usersTable[key]) {
                    setQuery[key] = update[key]
                }
            });
    
            const query = this.db
                .update(usersTable)
                .set(setQuery)
                .where(eq(usersTable.user_id, user_id))
    
            return await query;
        }
}
