import Control from '../control.js';

export default class GetServiceRequestsHistory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/history', async (req, res, next) => {
            const serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ status: "COMPLETED" });

            return res.status(200).send(serviceRequests);
        });
    }
}