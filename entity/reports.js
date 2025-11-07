import Entity from './entity.js';
import ServiceRequestsEntity from './service-requests.js';
import ShortlistsEntity from './shortlists.js';
import MatchesEntity from './matches.js';


export default class ReportsEntity extends Entity {
    constructor() {
        super();
    }

    async getReport(date, type) {
        let from = new Date(date)
        let to = new Date(from)

        switch (type) {
            case 'daily':
                to.setDate(from.getDate() + 1);
                break;
            case 'weekly':
                to.setDate(from.getDate() + 7);
                break;
            case 'monthly':
                to.setMonth(from.getMonth() + 1);
                break;
        }

        from = from.toISOString().split('T')[0];
        to = to.toISOString().split('T')[0];

        const requestsCreated = (await new ServiceRequestsEntity()
            .searchServiceRequests({
                date_from: from,
                date_to: to
            })).length
        const completedRequests = (await new ServiceRequestsEntity()
            .searchServiceRequests({
                date_completed_from: from,
                date_completed_to: to
            })).length
        const shortlists = (await new ShortlistsEntity()
            .searchShortlists({
                date_from: from,
                date_to: to
            })).length
        const matches = (await new MatchesEntity()
            .searchMatches({
                date_from: from,
                date_to: to
            })).length

        return {
            requestsCreated,
            completedRequests,
            shortlists,
            matches
        };
    }
}
