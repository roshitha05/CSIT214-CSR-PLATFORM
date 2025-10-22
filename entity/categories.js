import { eq, and, ilike } from 'drizzle-orm';
import { categoriesTable, usersTable } from '../database/tables.js';
import Entity from './entity.js';


export default class CategoriesEntity extends Entity {
    constructor() {
        super();
    }

    async getCategories(searchBy = {}) {
        let query = this.db.select().from(categoriesTable).$dynamic();

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && categoriesTable[key]) {
                conditions.push(ilike(categoriesTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        return await query;
    }

    async insertCategory(category) {
        if (await this.nameExists(category.name)) return false;

        await this.db.insert(categoriesTable)
            .values(category)
            .returning();

        return true;
    }

    async updateCategory(name, update) {
        if (Object.keys(update).length == 0) return true;
        if (
            name !== update.name
            && update.name !== undefined
        ) {
            if (!await this.nameExists(name)) return false;
            if (await this.nameExists(update.name)) return false;
        };

        const setQuery = {};
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined && categoriesTable[key]) {
                setQuery[key] = update[key];
            };
        });

        await this.db
            .update(categoriesTable)
            .set(setQuery)
            .where(eq(categoriesTable.name, name));

        return true;
    }

    async nameExists(name) {
        const nameCheck = await this.getCategories({ name });

        if (nameCheck.length > 0) return true;
        return false
    }
}
