import Control from '../control.js';

export default class CompleteMatch extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:service_request/complete', async (req, res, next) => {
            const success = await this.matchesEntity
                .updateMatch(req.params.service_request, { status: "COMPLETED" });

            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    };
}