import Control from '../control.js';

export default class DeleteServiceRequest extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.delete('/:service_request_id', async (req, res, next) => {
            const success = await this.serviceRequestsEntity
                .updateServiceRequest(req.params.service_request_id, { status: 'CANCELLED' });
                
            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    }
}