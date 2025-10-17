import Control from '../control.js';

export default class CreateUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', this.requireAuth("User Admin"), async (req, res, next) => {
            const success = await this.userProfileEntity
                .insertUserProfile({...req.body, status: 'ACTIVE' });

            if (success) res.status(200).send(true);
            res.status(400).send(false)
        });
    }
}