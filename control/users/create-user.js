import { 
    insertUserSchema
} from '../../schemas/users.schema.js';
import ServerError from '../../exception/Error.js';
import Control from '../control.js';

export default class CreateUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', this.requireAuth("User Admin"), async (req, res, next) => {
            const body = {
                ...req.body,
                status: 'ACTIVE',
            };

            try {
                var parsed = insertUserSchema.parse(body);
            } catch (error) {
                return next(new ServerError(400, error.issues[0].message));
            }

            const emailCheck = await this.usersEntity.getUsers({
                email: parsed.email,
            });
            const usernameCheck = await this.usersEntity.getUsers({
                username: parsed.username,
            });
            const userProfileCheck =
                await this.userProfileEntity.getUserProfiles({
                    name: parsed.user_profile,
                });

            if (emailCheck.length > 0)
                return next(new ServerError(400, 'Email already exists'));
            if (usernameCheck.length > 0)
                return next(new ServerError(400, 'Username already exists'));
            if (userProfileCheck.length === 0)
                return next(new ServerError(400, 'Invalid user profile'));

            const id = await this.usersEntity.insertUser(parsed);

            res.status(200).send({
                message: `User ${id} created`,
            });
        });
    }
}