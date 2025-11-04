import Control from '../control.js';

export default class SearchPinServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:user_id/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .searchServiceRequests({ ...req.query, created_by: req.params.user_id });

            return res.status(200).send(serviceRequests);
        });
    }
}