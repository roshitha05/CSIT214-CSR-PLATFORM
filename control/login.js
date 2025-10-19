import Control from './control.js';
import AuthEntity from '../entity/auth.js';

export default class Login extends Control {
    constructor() {
        super();

        this.authEntity = new AuthEntity();
    }

    createController() {
        this.router.post('/login', async (req, res, next) => {
            const user = await this.authEntity
                .authenticateUser(req.body);

            if (user === false) return res.status(403).send();
            delete user.password;

            req.session.regenerate((err) => {
                if (err) return res.status(500).send();
                
                req.session.user_id = user.user_id;

                req.session.save((err) => {
                    if (err) return res.status(500).send();
                    res.status(200).json({ user });
                });
            });
        });
    }
}


