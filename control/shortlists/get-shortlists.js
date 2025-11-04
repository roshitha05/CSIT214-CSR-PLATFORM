import Control from '../control.js';

export default class GetShortlists extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            const shortlists = await this.shortlistsEntity
                .getShortlists();

            res.status(200).send({ shortlists });
        });
    };
}