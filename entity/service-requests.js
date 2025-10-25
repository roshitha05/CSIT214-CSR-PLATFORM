import { eq, and, ilike } from 'drizzle-orm';
import { serviceRequestsTable } from '../database/tables.js';
import Entity from './entity.js';


export default class ServiceRequestsEntity extends Entity {
    constructor() {
        super();
    }

    async getServiceRequests(searchBy = {}) {
        let query = this.db.select().from(serviceRequestsTable).$dynamic();

        const conditions = [];
        Object.keys(searchBy).forEach((key) => {
            if (searchBy[key] !== undefined && serviceRequestsTable[key]) {
                conditions.push(eq(serviceRequestsTable[key], searchBy[key]));
            }
        });

        if (conditions.length > 0) {
            query = query.where(and(...conditions));
        }

        return await query;
    }

    async insertServiceRequest(serviceRequest) {
        if (await this.titleExists(serviceRequest.title)) return false;

        await this.db.insert(serviceRequestsTable)
            .values(serviceRequest)
            .returning();

        return true;
    }

    async updateServiceRequest(service_request_id, update) {
        if (Object.keys(update).length == 0) return true;

        if (!await this.idExists(service_request_id)) return false;
        const serviceRequest = (await this.getServiceRequests({ service_request_id }))[0];
        if (
            serviceRequest.title !== update.title
            && update.title !== undefined
        ) {
            if (await this.titleExists(update.title)) return false;
        };

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

    async idExists(service_request_id) {
        const idCheck = await this.getServiceRequests({ service_request_id });

        if (idCheck.length > 0) return true;
        return false;
    }

    async titleExists(title) {
        const titleCheck = await this.getServiceRequests({ title });

        if (titleCheck.length > 0) return true;
        return false;
    }
}
