import z from 'zod';
import ServerError from '../exception/Error.js';
import Control from './control.js';

export class Login extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/login', async (req, res, next) => {
            const loginSchema = z
                .object({
                    username: z.string().optional(),
                    email: z.string().optional(),
                    password: z.string(),
                    user_profile: z.string(),
                })
                .refine(
                    (data) => {
                        return data.username || data.email;
                    },
                    {
                        message: 'Please provide username or email',
                    }
                );

            try {
                var parsed = loginSchema.parse(req.body);
            } catch (error) {
                return next(400, error.issues[0].message);
            }

            if (parsed.username !== undefined) {
                var userArray = await this.usersEntity.getUsers({
                    username: parsed.username,
                    password: parsed.password,
                });
            }
            if (parsed.password !== undefined) {
                var userArray = await this.usersEntity.getUsers({
                    email: parsed.email,
                    password: parsed.password,
                });
            }

            if (userArray.length === 0) {
                return next(
                    new ServerError(
                        401,
                        'Invalid username, email, password or user profile'
                    )
                );
            }

            const user = userArray[0];
            // dont encrypt password first
            //
            // const validPassword = await bcrypt.compare(
            //     password,
            //     user.password_hash
            // );
            if (!user.password === parsed.password) {
                return next(
                    new ServerError(
                        401,
                        'Invalid username, email, password or user profile'
                    )
                );
            }

            req.session.regenerate((err) => {
                if (err) next(new ServerError(500, err));
                
                req.session.user_id = user.user_id;

                req.session.save((err) => {
                    if (err) next(new ServerError(500, err));

                    res.status(200).json({
                        message: 'Logged in',
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
