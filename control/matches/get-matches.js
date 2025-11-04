import Control from '../control.js';

export default class GetMatches extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            const matches = await this.matchesEntity
                .getMatches();

            res.status(200).send({ matches });
        });
    };
}