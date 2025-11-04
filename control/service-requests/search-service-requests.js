import Control from '../control.js';

export default class SearchServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .searchServiceRequests(req.query);

            return res.status(200).send(serviceRequests);
        });
    }
}