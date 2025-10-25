import Control from '../control.js';

export default class SearchPinServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:user_id/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ ...req.query, created_by: req.params.user_id });
            serviceRequests.map( request => 
                delete request.view_count
            );

            return res.status(200).send(serviceRequests);
        });
    }
}