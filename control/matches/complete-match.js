import Control from '../control.js';

export default class CompleteMatch extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:service_request/complete', async (req, res, next) => {
            let success = await this.matchesEntity
                .updateMatch(req.params.service_request, { status: "COMPLETED" });

            if (!success) return res.status(400).send(false)

            success = await this.serviceRequestsEntity
                .updateServiceRequest(
                    req.params.service_request, 
                    { 
                        status: "COMPLETED",
                        date_completed: new Date()
                    }); 

            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    };
}