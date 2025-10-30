import { eq, and, ilike, gt, or, lt, asc } from 'drizzle-orm';
import { serviceRequestsTable } from '../database/tables.js';
import Entity from './entity.js';


export default class ServiceRequestsEntity extends Entity {
    constructor() {
        super();
    }

    async getServiceRequests(searchBy = {}) {
        let query = this.db.select()
            .from(serviceRequestsTable)
            .orderBy(serviceRequestsTable.service_request_id);

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && serviceRequestsTable[key]) {
                conditions.push(eq(serviceRequestsTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query
                .where(and(...conditions));
        }

        return await query;
    }

    async searchServiceRequests(filters) {
        const conditions = [];

        if (filters.created_by !== undefined)
            conditions.push(eq(serviceRequestsTable.created_by, filters.created_by));
        if (filters.title !== undefined) 
            conditions.push(ilike(serviceRequestsTable.title, `%${filters.title}%`));
        if (filters.category !== undefined)
            conditions.push(ilike(serviceRequestsTable.category, filters.category));
        if (filters.date_from !== undefined)
            conditions.push(gt(serviceRequestsTable.date_created, new Date(filters.date_from)));
        if (filters.date_to !== undefined)
            conditions.push(lt(serviceRequestsTable.date_created, new Date(filters.date_to)));
        if (filters.status !== undefined)
            conditions.push(ilike(serviceRequestsTable.status, filters.status));

        return await this.db
            .select()
            .from(serviceRequestsTable)
            .where(
                and(...conditions)
            )
            .orderBy(serviceRequestsTable.service_request_id);
    }

    async insertServiceRequest(serviceRequest) {
        await this.db.insert(serviceRequestsTable)
            .values(serviceRequest)
            .returning();

        return true;
    }

    async updateServiceRequest(service_request_id, update) {
        if (Object.keys(update).length == 0) return true;

        if (!await this.idExists(service_request_id)) return false;

        const setQuery = {};
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined && serviceRequestsTable[key]) {
                setQuery[key] = update[key];
            };
        });

        await this.db
            .update(serviceRequestsTable)
            .set(setQuery)
            .where(eq(serviceRequestsTable.service_request_id, service_request_id));

        return true;
    }

    async increaseView(serviceRequest) {
        if (!await this.idExists(serviceRequest.service_request_id)) return false;

        await this.updateServiceRequest(
            serviceRequest.service_request_id, 
            { view_count: serviceRequest.view_count + 1 }
        );

        return true;
    }

    async idExists(service_request_id) {
        const idCheck = await this.getServiceRequests({ service_request_id });

        if (idCheck.length > 0) return true;
        return false;
    }
}
