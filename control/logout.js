import Control from "./control.js";

export default class Logout extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/logout', (req, res, next) => {
            req.session.destroy((err) => {
                if (err) return res.status(500).send(false);
                res.status(200).json(true);
            });
        });
    }
}