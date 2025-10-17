import Control from '../control.js';

export default class UpdateUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:name', this.requireAuth('User Admin'), async (req, res, next) => {
            const success = await this.userProfileEntity
                .updateUserProfile(req.params.name, req.body);

            if (success) return res.status(200).send(true);
            res.status(400).send(false);
        })
    }
}