import Control from '../control.js';

export default class GetServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests();
            serviceRequests.map( request => 
                delete request.view_count
            );

            return res.status(200).send(serviceRequests);
        });
    }
}