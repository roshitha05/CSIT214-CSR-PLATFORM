import { eq, and, ilike, gt, or, lt, asc, gte, lte } from 'drizzle-orm';
import { serviceRequestsTable } from '../database/tables.js';
import Entity from './entity.js';
import UsersEntity from './users.js';


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

        const serviceRequests = await query;

        await Promise.all(
            serviceRequests.map( async serviceRequest => {
                serviceRequest.user = (await new UsersEntity()
                    .getUsers({ 
                        user_id: serviceRequest.created_by 
                    }))[0]
                }
            )
        )

        return serviceRequests;
    }

    async getServiceRequestView(service_request_id) {
        return await this.db.select({ view_count: serviceRequestsTable.view_count })
            .from(serviceRequestsTable)
            .where(eq(serviceRequestsTable.service_request_id, service_request_id))
    }

    async searchServiceRequests(filters) {
        const conditions = [];
        const keywordConditions = []
        
        if (filters.keyword !== undefined) {
            const search = `%${filters.keyword}%`;

            keywordConditions.push(ilike(serviceRequestsTable.title, search));
            keywordConditions.push(ilike(serviceRequestsTable.description, search));
            keywordConditions.push(ilike(serviceRequestsTable.category, search));
            keywordConditions.push(ilike(serviceRequestsTable.status, search));

            const intKeyword = parseInt(filters.keyword);
            if (!isNaN(intKeyword)) {
                keywordConditions
                    .push(eq(serviceRequestsTable.service_request_id, intKeyword));
                keywordConditions
                    .push(eq(serviceRequestsTable.created_by, intKeyword));
                keywordConditions
                    .push(eq(serviceRequestsTable.view_count, intKeyword));
            }
        }
        console.log(filters.date_from)
        if (filters.service_request_id !== undefined)
            conditions.push(eq(serviceRequestsTable.service_request_id, filters.service_request_id));
        if (filters.created_by !== undefined)
            conditions.push(eq(serviceRequestsTable.created_by, filters.created_by));
        if (filters.category !== undefined)
            conditions.push(ilike(serviceRequestsTable.category, filters.category));
        if (filters.date_from !== undefined) {
            conditions.push(
                and(
                    gte(serviceRequestsTable.date_created, new Date(filters.date_from + 'T00:00:00+08:00')),
                    gte(serviceRequestsTable.date_completed, new Date(filters.date_from + 'T00:00:00+08:00'))
                )
            );
        }
        if (filters.date_to !== undefined) {
            conditions.push(
                and(
                    lte(serviceRequestsTable.date_created, new Date(filters.date_to + 'T00:00:00+08:00')),
                    lte(serviceRequestsTable.date_completed, new Date(filters.date_to + 'T00:00:00+08:00'))
                )
                
            );
        }
        if (filters.date_completed_from !== undefined)
            conditions.push(gte(serviceRequestsTable.date_completed, new Date(filters.date_completed_from + 'T00:00:00+08:00')));
        if (filters.date_completed_to !== undefined)
            conditions.push(lte(serviceRequestsTable.date_completed, new Date(filters.date_completed_to + 'T00:00:00+08:00')));
        if (filters.status !== undefined)
            conditions.push(ilike(serviceRequestsTable.status, filters.status));

        let serviceRequests = await this.db
            .select()
            .from(serviceRequestsTable)
            .where(
                and(
                    and(...conditions),
                    or(...keywordConditions)
                )
            )
            .orderBy(serviceRequestsTable.service_request_id);

        await Promise.all(
            serviceRequests.map( async serviceRequest => {
                serviceRequest.user = (await new UsersEntity()
                    .getUsers({ 
                        user_id: serviceRequest.created_by 
                    }))[0]
                }
            )
        )

        serviceRequests = serviceRequests.filter(serviceRequest => 
            this.containsKeyword(serviceRequest, filters.keyword)
        );
        
        return serviceRequests;
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
