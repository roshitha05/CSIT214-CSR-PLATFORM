import Control from '../control.js';

export default class SuspendUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:user_id/suspend', this.requireAuth('User Admin'), async (req, res, next) => { 
            const success = await this.usersEntity
                .updateUser(req.params.user_id, { status: 'SUSPENDED'});
            
            if (success) res.status(200).send(true);
            res.status(400).send(false);
        });
    };
}