import Control from '../control.js';

export default class SearchServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ ...req.query });
            serviceRequests.map( request => 
                delete request.view_count
            );

            return res.status(200).send(serviceRequests);
        });
    }
}