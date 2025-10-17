import Control from '../control.js';

export default class UpdateUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:user_id', this.requireAuth('User Admin'), async (req, res, next) => {
            const success = await this.usersEntity
                .updateUser(req.params.user_id, req.body);
            
            if (success) res.status(200).send(true);
            res.status(400).send(false);
        });
    };
}