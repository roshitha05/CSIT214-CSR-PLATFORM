import Control from '../control.js';

export default class UpdateServiceRequest extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:service_request_id', async (req, res, next) => {
            const success = await this.serviceRequestsEntity
                .updateServiceRequest(req.params.service_request_id, req.body);

            if (success) return res.status(200).send(true);
            return res.status(400).send(false);
        });
    }
}