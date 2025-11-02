import Control from '../control.js';

export default class GetShortlistCount extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:service_request/count', async (req, res, next) => {
            const shortlists = await this.shortlistsEntity
                .getShortlists({ service_request: req.params.service_request });

            res.status(200).send(shortlists.length);
        });
    };
}