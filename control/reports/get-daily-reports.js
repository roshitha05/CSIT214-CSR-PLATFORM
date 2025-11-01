import Control from '../control.js';

export default class GetDailyReport extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/daily', async (req, res, next) => {
            const from = new Date(req.body.date)
            const to = new Date(from)
            to.setDate(from.getDate() + 1)

            const report = await this.reportsEntity.getReport(from, to)

            res.status(200).send(report);
        });
    };
}