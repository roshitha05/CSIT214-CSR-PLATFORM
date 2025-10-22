import Control from '../control.js';

export default class ArchiveCategory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:name/archive', async (req, res, next) => {
            const success = await this.categoriesEntity
                .updateCategory(req.params.name, { status: 'ARCHIVED' });
                
            if (success) return res.status(200).send(true);
            res.status(400).send(false);
        });
    }
}