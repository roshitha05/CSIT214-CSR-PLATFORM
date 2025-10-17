import Control from '../control.js';

export default class GetUsers extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', this.requireAuth('User Admin'), async (req, res, next) => {
            const users = await this.usersEntity.getUsers();
            users.forEach(user => delete user.password);

            res.status(200).send({ users })
        });
    };
}