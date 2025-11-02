import Control from '../control.js';

export default class SearchCategories extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            const categories = await this.categoriesEntity
                .searchCategories(req.query.keyword);

            res.status(200).send({ categories });
        });
    };
}