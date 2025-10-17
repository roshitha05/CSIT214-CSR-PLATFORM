import Control from '../control.js';

export default class SearchUsers extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', this.requireAuth('User Admin'), async (req, res, next) => {
            const users = await this.usersEntity.getUsers(req.query);
            users.forEach(user => delete user.password);

            res.status(200).send({ users });
        });
    };
}