import Control from '../control.js';

export default class SearchPinServiceRequestsHistory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:user_id/history/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .searchServiceRequests({ 
                    ...req.query, 
                    created_by: req.params.user_id, 
                    status: "COMPLETED" 
                });

            return res.status(200).send(serviceRequests);
        });
    }
}