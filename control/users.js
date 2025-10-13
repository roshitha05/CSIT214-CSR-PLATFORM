import z from 'zod';
import { insertUserSchema } from '../entity/users.js';
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
            const searchUsersSchema = z.object({
                user_id: z.string().optional(),
                fullname: z.string().optional(),
                email: z.string().optional(),
                username: z.string().optional(),
                phone_number: z.string().optional(),
                address: z.string().optional(),
                date_of_birth: z.string().optional(),
                status: z.string().optional(),
                created_at: z.date().optional(),
            })
            
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