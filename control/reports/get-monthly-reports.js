import Control from '../control.js';

export default class GetMonthlyReport extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/monthly', async (req, res, next) => {
            const from = new Date(req.body.date)
            const to = new Date(req.body.date)
            to.setMonth(from.getMonth() + 1)

            const report = await this.reportsEntity.getReport(from, to)

            res.status(200).send(report);
        });
    };
}