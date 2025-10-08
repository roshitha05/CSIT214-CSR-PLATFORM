import Control from './control.js';
import UsersEntity from '../entity/users.js';

export default class Users extends Control {
    constructor() {
        super();
        this.usersEntity = new UsersEntity();

        this.init();
    }

    init() {
        this.router.post('/', async (req, res) => {
            const body = req.body;

            // todo: error checking for body contents

            const id = await this.usersEntity.insertUser(body);

            res.status(200).send({
                message: `User ${id} created`,
            });
        });
    }

    getRouter() {
        return this.router;
    }
}
