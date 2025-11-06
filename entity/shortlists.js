import { eq, and, lte, gte, count } from 'drizzle-orm';
import { shortlistsTable } from '../database/tables.js';
import Entity from './entity.js';
import ServiceRequestsEntity from './service-requests.js';
import UsersEntity from './users.js';


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

        const shortlists = await query;

        await Promise.all(
            shortlists.map( async shortlist => {
                const serviceRequest = await new ServiceRequestsEntity()
                    .getServiceRequests({ server_request_id: shortlist.service_request })
                const user = await new UsersEntity()
                    .getUsers({ user_id: shortlist.shortlisted_by })

                shortlist.service_request = serviceRequest[0];
                shortlist.shortlisted_by = user[0];

                delete shortlist.shortlisted_by.password;                    
            })
        );

        return shortlists;
    }

    async getShortlistCount(service_request) {
        return await this.db.select({ count: count() })
            .from(shortlistsTable)
            .where(eq(shortlistsTable.service_request, service_request));
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
            conditions.push(gte(shortlistsTable.date_created, new Date(filters.date_from + 'T00:00:00+08:00')));
        if (filters.date_to !== undefined)
            conditions.push(lte(shortlistsTable.date_created, new Date(filters.date_to + 'T00:00:00+08:00')));

        const shortlists = await this.db
            .select()
            .from(shortlistsTable)
            .where(
                and(...conditions)
            )
            .orderBy(shortlistsTable.shortlist_id);

        await Promise.all(
            shortlists.map( async shortlist => {
                const serviceRequest = await new ServiceRequestsEntity()
                    .getServiceRequests({ service_request_id: shortlist.service_request })
                const user = await new UsersEntity()
                    .getUsers({ user_id: shortlist.shortlisted_by })

                shortlist.service_request = serviceRequest[0];
                shortlist.shortlisted_by = user[0];

                delete shortlist.shortlisted_by.password;                    
            })
        );

        return shortlists;
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
