import { eq, and, lte, gte } from 'drizzle-orm';
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

    async searchShortlists(filters) {
        const conditions = [];

        if (filters.shortlist_id !== undefined)
            conditions.push(eq(shortlistsTable.shortlist_id, filters.shortlist_id));
        if (filters.service_request !== undefined)
            conditions.push(eq(shortlistsTable.service_request, filters.service_request));
        if (filters.shortlisted_by !== undefined)
            conditions.push(eq(shortlistsTable.shortlisted_by, filters.shortlisted_by));
        if (filters.date_from !== undefined)
            conditions.push(gte(shortlistsTable.date_created, new Date(filters.date_from)));
        if (filters.date_to !== undefined)
            conditions.push(lte(shortlistsTable.date_created, new Date(filters.date_to)));

        return await this.db
            .select()
            .from(shortlistsTable)
            .where(
                and(...conditions)
            )
            .orderBy(shortlistsTable.shortlist_id);
    }

    async insertShortlist(shortlist) {
        if (await this.hasShortlisted(shortlist)) return false;

        await this.db.insert(shortlistsTable)
            .values(shortlist)
            .returning();

        return true;
    }

    async deleteShortlist(shortlist_id) {
        if (!await this.idExists(shortlist_id)) return false;

        await this.db.delete(shortlistsTable)
            .where(eq(shortlistsTable.shortlist_id, shortlist_id));

        return true;
    }

    async idExists(shortlist_id) {
        const idCheck = await this.getShortlists({ shortlist_id });

        if (idCheck.length > 0) return true;
        return false;
    }

    async hasShortlisted(shortlist) {
        const idCheck = await this.getShortlists(shortlist);

        if (idCheck.length > 0) return true;
        return false;
    }
}
