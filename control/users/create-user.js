import Control from '../control.js';

export default class CreateUser extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', this.requireAuth("User Admin"), async (req, res, next) => {
            const success = await this.usersEntity
                .insertUser({ ...req.body, status: 'ACTIVE' });
            
            if (success) res.status(200).send(true)
            res.status(400).send(false)
        });
    }
}