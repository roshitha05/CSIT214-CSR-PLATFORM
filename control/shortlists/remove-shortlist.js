import Control from '../control.js';

export default class RemoveShortlist extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.delete('/:shortlist_id', async (req, res, next) => {
            const success = await this.shortlistsEntity
                .deleteShortlist(req.params.shortlist_id);
                
            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    }
}