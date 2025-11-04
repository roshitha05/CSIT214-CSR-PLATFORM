import Control from '../control.js';

export default class GetPinServiceRequestsHistory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:user_id/history', async (req, res, next) => {
            const serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ created_by: req.params.user_id, status: "COMPLETED" });
                
            return res.status(200).send(serviceRequests)
        });
    }
}