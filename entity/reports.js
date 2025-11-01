import Entity from './entity.js';
import ServiceRequestsEntity from './service-requests.js';
import ShortlistsEntity from './shortlists.js';
import MatchesEntity from './matches.js';


export default class ReportsEntity extends Entity {
    constructor() {
        super();
    }

    async getReport(date, to) {
        console.log(date)
        console.log(to)
        const requestsCreated = (await new ServiceRequestsEntity()
            .searchServiceRequests({
                date_from: date,
                date_to: to
            })).length
        const completedRequests = (await new ServiceRequestsEntity()
            .searchServiceRequests({
                date_completed_from: date,
                date_completed_to: to
            })).length
        const shortlists = (await new ShortlistsEntity()
            .searchShortlists({
                date_from: date,
                date_to: to
            })).length
        const matches = (await new MatchesEntity()
            .searchMatches({
                date_from: date,
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
