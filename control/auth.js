import z from 'zod';
import ServerError from '../exception/Error.js';
import Control from './control.js';
import { responseUserSchema } from '../schemas/users.schema.js';

export class Login extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/login', async (req, res, next) => {
            const loginSchema = z
                .object({
                    login: z.string(),
                    password: z.string(),
                })

            try {
                var parsed = loginSchema.parse(req.body);
            } catch (error) {
                return next(400, error.issues[0].message);
            }
            
            var userArray = await this.usersEntity.getUsers({
                username: parsed.login,
                password: parsed.password,
            });
            if (userArray.length === 0) {
                var userArray = await this.usersEntity.getUsers({
                    email: parsed.login,
                    password: parsed.password,
                });
            }

            if (userArray.length === 0) {
                return next(new ServerError(
                    401,
                    'Invalid username, email or password'
                ));
            }

            const user = userArray[0];
            const user_profile = (await this.userProfileEntity.getUserProfiles({ 
                name: user.user_profile 
            }))[0];
            // dont encrypt password first
            //
            // const validPassword = await bcrypt.compare(
            //     password,
            //     user.password_hash
            // );
            if (!user.password === parsed.password) {
                return next(new ServerError(
                    401,
                    'Invalid username, email or password'
                ));
            }
            if (user.status.toLowerCase() !== 'ACTIVE'.toLowerCase())
                return next(new ServerError(400, 'Account is not active'));
            if (user_profile.status.toLowerCase() !== 'ACTIVE'.toLowerCase())
                return next(new ServerError(400, 'User profile is not active'));

            req.session.regenerate((err) => {
                if (err) next(new ServerError(500, err));
                
                req.session.user_id = user.user_id;

                req.session.save((err) => {
                    if (err) next(new ServerError(500, err));

                    const data = responseUserSchema.parse(user);
                    res.status(200).json({
                        message: 'Logged in',
                        data: data,
                    });
                });
            });
        });
    }
}

export class Logout extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/logout', (req, res, next) => {
            req.session.destroy((err) => {
                if (err) next(new ServerError(500, err));

                res.status(200).json({
                    message: 'Logged out',
                });
            });
        });
    }
}
