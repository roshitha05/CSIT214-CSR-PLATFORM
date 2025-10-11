import ServerError from '../exception/Error.js';
import Control from './control.js';

export class CreateUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', async (req, res, next) => {
            const body = {
                ...req.body,
                status: 'ACTIVE',
            };

            const emailCheck = await this.usersEntity.getUser({
                email: req.body.email,
            });
            const usernameCheck = await this.usersEntity.getUser({
                username: req.body.username,
            });

            if (emailCheck.length > 0)
                return next(new ServerError(400, 'Email already exist'));
            if (usernameCheck.length > 0)
                return next(new ServerError(400, 'Username already exist'));

            const id = await this.usersEntity.insertUser(body);

            res.status(200).send({
                message: `User ${id} created`,
            });
        });
    }
}
