import Control from '../control.js';

export default class InsertMatch extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', async (req, res, next) => {
            let success = await this.matchesEntity
                .insertMatch({ ...req.body, status: "COMPLETED" });

            if (!success) return res.status(400).send(false)

            success = await this.serviceRequestsEntity
                .updateServiceRequest(
                    req.body.service_request, 
                    { 
                        status: "COMPLETED",
                        date_completed: new Date()
                    });

            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    };
}