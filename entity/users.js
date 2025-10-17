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
        if (await this.emailExists(user.email)) return false;
        if (await this.usernameExists(user.username)) return false;

        await this.db.insert(usersTable).values(user).returning();

        return true;
    }

    async updateUser(user_id, update) {
        if (Object.keys(update).length == 0) return true;
        if (!await this.userIdExists(user_id)) return false;
        if (
            update.email !== undefined
            && await this.emailExists(update.email)
        ) return false;
        if (
            update.username !== undefined
            && await this.usernameExists(update.username)
        ) return false;

        const setQuery = {};
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined && usersTable[key]) {
                setQuery[key] = update[key];
            };
        });

        await this.db
            .update(usersTable)
            .set(setQuery)
            .where(eq(usersTable.user_id, user_id));

        return true;
    }

    async emailExists(email) {
        const emailCheck = await this.getUsers({ email });

        if (emailCheck.length > 0) return true;
        return false
    }

    async usernameExists(username) {
        const usernameCheck = await this.getUsers({ username });

        if (usernameCheck.length > 0) return true;
        return false
    }

    async userIdExists(user_id) {
        const userIdCheck = await this.getUsers({ user_id });

        if (userIdCheck.length > 0) return true;
        return false;
    }
}
