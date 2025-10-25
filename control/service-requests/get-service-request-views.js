import Control from '../control.js';

export default class GetServiceRequestViews extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:service_request_id/views', async (req, res, next) => {
            const serviceRequest = await this.serviceRequestsEntity
                .getServiceRequests({ service_request_id });
            const view_count = serviceRequest[0].view_count;

            return res.status(200).send(view_count)
        });
    }
}