import Control from '../control.js';

export default class UpdateCategory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:name', async (req, res, next) => {
            const success = await this.categoriesEntity
                .updateCategory(req.params.name, req.body);
            
            if (success) return res.status(200).send(true);
            res.status(400).send(false);
        });
    };
}