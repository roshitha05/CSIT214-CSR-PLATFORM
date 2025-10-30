import { eq, and } from 'drizzle-orm';
import { shortlistsTable } from '../database/tables.js';
import Entity from './entity.js';


export default class ShortlistsEntity extends Entity {
    constructor() {
        super();
    }

    async getShortlists(searchBy = {}) {
        let query = this.db.select()
            .from(shortlistsTable)
            .orderBy(shortlistsTable.shortlist_id);

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && shortlistsTable[key]) {
                conditions.push(eq(shortlistsTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        return await query;
    }

    async insertShortlist(shortlist) {
        if (this.hasShortlisted(shortlist)) return false;

        await this.db.insert(shortlistsTable)
            .values(shortlist)
            .returning();

        return true;
    }

    async hasShortlisted(shortlist) {
        const idCheck = await this.getShortlists(shortlist);

        if (idCheck.length > 0) return true;
        return false;
    }
}
