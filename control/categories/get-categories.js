import Control from '../control.js';

export default class GetCategories extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            const categories = await this.categoriesEntity.getCategories();

            res.status(200).send({ categories });
        });
    }
}