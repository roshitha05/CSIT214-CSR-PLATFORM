import ServerError from '../../exception/Error.js';
import Control from '../control.js';

export default class SuspendUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:user_id/suspend', this.requireAuth('User Admin'), async (req, res, next) => { 
            const user_id = req.params.user_id
            const user = (await this.usersEntity.getUsers(user_id))[0];

            if (user === undefined) 
                return next(new ServerError(400, 'User not found'));

            await this.usersEntity.updateUser(user_id, { status: 'SUSPENDED'});
            
            res.status(200).send({
                message: `User ${user_id} suspended`
            });
        });
    };
}