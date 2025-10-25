import Control from '../control.js';

export default class RestoreServiceRequest extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:service_request_id/restore', async (req, res, next) => {
            const success = await this.serviceRequestsEntity
                .updateServiceRequest(req.params.service_request_id, { status: 'ACTIVE' });
                
            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    }
}