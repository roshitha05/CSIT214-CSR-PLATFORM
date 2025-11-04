import Control from '../control.js';

export default class GetServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            const serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests();

            return res.status(200).send(serviceRequests);
        });
    }
}