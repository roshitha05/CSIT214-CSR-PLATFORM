import Control from '../control.js';

export default class GetWeeklyReport extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/weekly', async (req, res, next) => {
            const report = await this.reportsEntity.getReport(req.body.date, "weekly");

            res.status(200).send(report);
        });
    };
}