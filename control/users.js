import { 
    insertUserSchema, 
    searchUsersSchema, 
    updateUserSchema,
} from '../schemas/users.schema.js';
import ServerError from '../exception/Error.js';
import Control from './control.js';

export class CreateUser extends Control {
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

export class GetUsers extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', this.requireAuth('User Admin'), async (req, res, next) => {
            const query = req.query
            const parsed = searchUsersSchema.parse(query)
            const users = await this.usersEntity.getUsers(parsed);

            for (let user of users) {
                delete user.password
            }

            res.status(200).send({
                message: 'Users retrieved',
                data: users
            })
        });
    };
}

export class UpdateUser extends Control {
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

export class SuspendUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:user_id/suspend', this.requireAuth('User Admin'), async (req, res, next) => { 
            const user_id = req.params.user_id
            const user = (await this.usersEntity.getUsers(user_id))[0];

            if (user === undefined) 
                return next(new ServerError(400, 'User not found'));

            await this.usersEntity.updateUser(user_id, { status: 'SUSPENDED '});
            
            res.status(200).send({
                message: `User ${user_id} suspended`
            });
        });
    };
}