import { 
    searchUsersSchema, 
    responseUserSchema
} from '../../schemas/users.schema.js';
import Control from '../control.js';

export default class GetUsers extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', this.requireAuth('User Admin'), async (req, res, next) => {
            const query = req.query
            const parsed = searchUsersSchema.parse(query)
            let users = await this.usersEntity.getUsers(parsed);

            users = users.map(userProfile => 
                responseUserSchema.parse(userProfile)
            );

            res.status(200).send({
                message: 'Users retrieved',
                data: users
            })
        });
    };
}