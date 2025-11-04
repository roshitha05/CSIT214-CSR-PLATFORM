import Control from '../control.js';

export default class RetrieveServiceRequest extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:service_request_id/detail', async (req, res, next) => {
            const serviceRequest = (await this.serviceRequestsEntity
                .getServiceRequests({ 
                    service_request_id: req.params.service_request_id 
                }))[0];

            await this.serviceRequestsEntity
                .increaseView(serviceRequest)
            
            return res.status(200).send(serviceRequest);
        });
    }
}