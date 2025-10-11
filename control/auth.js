import ServerError from '../exception/Error.js';
import Control from './control.js';

export class Login extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/login', async (req, res, next) => {
            const { username, email, password } = req.body ?? {};
            if ((!username && !email) || !password) {
                next(
                    new ServerError(
                        400,
                        'Please provide username or email and password'
                    )
                );
            }

            if (username !== undefined) {
                var userArray = await this.usersEntity.getUsers({
                    username,
                    password,
                });
            }
            if (email !== undefined) {
                var userArray = await this.usersEntity.getUsers({
                    email,
                    password,
                });
            }

            if (userArray.length === 0) {
                return next(
                    new ServerError(401, 'Invalid username, email or password')
                );
            }

            const user = userArray[0];
            // dont encrypt password first
            //
            // const validPassword = await bcrypt.compare(
            //     password,
            //     user.password_hash
            // );
            if (!user.password === password) {
                return next(
                    new ServerError(401, 'Invalid username, email or password')
                );
            }
            req.session.regenerate((err) => {
                if (err) next(new ServerError(500, err));

                req.session.user_id = user.user_id;

                req.session.save((err) => {
                    if (err) next(new ServerError(500, err));

                    res.sendStatus(200);
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

                res.sendStatus(200);
            });
        });
    }
}
