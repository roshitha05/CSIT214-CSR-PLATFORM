import Control from '../control.js';

export default class SearchServiceRequestsHistory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/history/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .searchServiceRequests({ ...req.query, status: "COMPLETED" });

            return res.status(200).send(serviceRequests);
        });
    }
}