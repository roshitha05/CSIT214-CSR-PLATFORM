import Control from '../control.js';

export default class InsertMatch extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            const success = await this.matchesEntity
                .insertMatch({ ...req.query, status: "ACTIVE" });

            if (success) return res.status(200).send(true)
            res.status(400).send(false)
        });
    };
}