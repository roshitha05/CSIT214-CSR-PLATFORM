import Control from './control.js';

export default class CreateUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', async (req, res) => {
            const body = {
                ...req.body,
                status: 'ACTIVE',
            };
            console.log(body);
            // todo: error checking for body contents

            const id = await this.usersEntity.insertUser(body);

            res.status(200).send({
                message: `User ${id} created`,
            });
        });
    }
}
