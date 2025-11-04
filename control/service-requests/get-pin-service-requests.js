import Control from '../control.js';

export default class GetPinServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:user_id', async (req, res, next) => {
            const serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ created_by: req.params.user_id });
                
            return res.status(200).send(serviceRequests)
        });
    }
}