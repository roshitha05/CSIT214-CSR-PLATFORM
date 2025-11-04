import Control from '../control.js';

export default class GetMonthlyReport extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/monthly', async (req, res, next) => {
            const report = await this.reportsEntity.getReport(req.body.date, "monthly");

            res.status(200).send(report);
        });
    };
}