import Control from '../control.js';

export default class DeleteCategory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.delete('/:name', async (req, res, next) => {
            const success = await this.categoriesEntity
                .updateCategory(req.params.name, { status: 'DELETED' });
                
            if (success) return res.status(200).send(true);
            res.status(400).send(false);
        });
    }
}