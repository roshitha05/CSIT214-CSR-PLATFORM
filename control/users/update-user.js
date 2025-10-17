import { 
    updateUserSchema
} from '../../schemas/users.schema.js';
import ServerError from '../../exception/Error.js';
import Control from '../control.js';

export default class UpdateUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:user_id', this.requireAuth('User Admin'), async (req, res, next) => {
            debugger         
            const user_id = req.params.user_id
            const body = req.body
            const parsed = updateUserSchema.parse(body)
            const user = (await this.usersEntity.getUsers({ user_id }))[0];

            if (user === undefined) 
                return next(new ServerError(400, 'User not found'));

            await this.usersEntity.updateUser(user_id, parsed);
            
            res.status(200).send({
                message: `User ${user_id} updated`
            });
        });
    };
}