import Control from '../control.js';

export default class RestoreCategory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:category_id/restore', async (req, res, next) => {
            const success = await this.categoriesEntity
                .updateCategory(req.params.category_id, { status: 'ACTIVE' });
                
            if (success) return res.status(200).send(true);
            res.status(400).send(false);
        });
    }
}