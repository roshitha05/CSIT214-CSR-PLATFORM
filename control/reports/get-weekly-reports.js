import Control from '../control.js';

export default class GetWeeklyReport extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/weekly', async (req, res, next) => {
            const from = new Date(req.body.date)
            const to = new Date(req.body.date)
            to.setDate(from.getDate() + 7)

            const report = await this.reportsEntity.getReport(from, to)

            res.status(200).send(report);
        });
    };
}