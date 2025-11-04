import Control from '../control.js';

export default class SearchMatches extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            const matches = await this.matchesEntity
                .searchMatches(req.query);

            res.status(200).send({ matches });
        });
    };
}