import { eq, and } from 'drizzle-orm';
import { matchesTable } from '../database/tables.js';
import Entity from './entity.js';


export default class MatchesEntity extends Entity {
    constructor() {
        super();
    }

    async getMatches(searchBy = {}) {
        let query = this.db.select()
            .from(matchesTable)
            .orderBy(matchesTable.service_request);

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && matchesTable[key]) {
                conditions.push(eq(matchesTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query
                .where(and(...conditions));
        }

        return await query;
    }

    async insertMatch(match) {
        if (this.hasMatch(match)) return false;

        await this.db.insert(matchesTable)
            .values(match)
            .returning();

        return true;
    }

    async updateMatch(service_request, update) {
        if (Object.keys(update).length == 0) return true;

        if (!await this.hasMatch(service_request)) return false;

        const setQuery = {};
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined && matchesTable[key]) {
                setQuery[key] = update[key];
            };
        });

        await this.db
            .update(matchesTable)
            .set(setQuery)
            .where(eq(matchesTable.service_request, service_request));

        return true;
    }

    async hasMatch(service_request) {
        const idCheck = await this.getMatches({ service_request });

        if (idCheck.length > 0) return true;
        return false;
    }
}
