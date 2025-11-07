import { eq, and, gte, lte, ilike } from 'drizzle-orm';
import { matchesTable } from '../database/tables.js';
import Entity from './entity.js';
import ServiceRequestsEntity from './service-requests.js';
import UsersEntity from './users.js';


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

        const matches = await query;

        await Promise.all(
            matches.map( async match => {
                const serviceRequest = await new ServiceRequestsEntity()
                    .getServiceRequests({ service_request_id: match.service_request })
                const user = await new UsersEntity()
                    .getUsers({ user_id: match.matched_by })

                match.service_request = serviceRequest[0];
                match.matched_by = user[0];

                delete match.matched_by.password;                    
            })
        );

        return matches;
    }

    async searchMatches(filters) {
        const conditions = [];

        if (filters.status !== undefined)
            conditions.push(ilike(matchesTable.status, `%${filters.status}%`));
        if (filters.service_request !== undefined)
            conditions.push(eq(matchesTable.service_request, filters.service_request));
        if (filters.matched_by !== undefined)
            conditions.push(eq(matchesTable.matched_by, filters.matched_by));
        if (filters.date_from !== undefined)
            conditions.push(gte(matchesTable.date_created, new Date(filters.date_from + 'T00:00:00+08:00')));
        if (filters.date_to !== undefined)
            conditions.push(lte(matchesTable.date_created, new Date(filters.date_to + 'T00:00:00+08:00')));

        const matches = await this.db
            .select()
            .from(matchesTable)
            .where(
                and(...conditions)
            )
            .orderBy(matchesTable.service_request);

        await Promise.all(
            matches.map( async match => {
                const serviceRequest = await new ServiceRequestsEntity()
                    .getServiceRequests({ service_request_id: match.service_request })
                const user = await new UsersEntity()
                    .getUsers({ user_id: match.matched_by })

                match.service_request = serviceRequest[0];
                match.matched_by = user[0];

                delete match.matched_by.password;                    
            })
        );

        return matches;
    }

    async insertMatch(match) {
        if (await this.hasMatch(match.service_request)) return false;

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
