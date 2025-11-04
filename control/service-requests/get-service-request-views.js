import Control from '../control.js';

export default class GetServiceRequestViews extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:service_request_id/views', async (req, res, next) => {
            const serviceRequest = await this.serviceRequestsEntity
                .getServiceRequestView(req.params.service_request_id);

            return res.status(200).send(serviceRequest[0].view_count)
        });
    }
}