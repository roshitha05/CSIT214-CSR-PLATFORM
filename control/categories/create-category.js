import Control from '../control.js';

export default class CreateCategory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', async (req, res, next) => {
            const success = await this.categoriesEntity
                .insertCategory({ ...req.body, status: 'ACTIVE' });
                
            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    }
}