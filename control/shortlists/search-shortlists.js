import Control from '../control.js';

export default class SearchShortlists extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            const shortlists = await this.shortlistsEntity
                .searchShortlists(req.query);
            
            res.status(200).send({ shortlists });
        });
    };
}