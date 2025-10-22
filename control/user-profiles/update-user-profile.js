import Control from '../control.js';

export default class UpdateUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:user_profile_id', this.requireAuth('User Admin'), async (req, res, next) => {
            const success = await this.userProfileEntity
                .updateUserProfile(req.params.user_profile_id, req.body);

            if (success) return res.status(200).send(true);
            res.status(400).send(false);
        })
    }
}