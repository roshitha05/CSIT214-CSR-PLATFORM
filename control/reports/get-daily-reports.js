import Control from '../control.js';

export default class GetDailyReport extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/daily', async (req, res, next) => {
            const report = await this.reportsEntity.getReport(req.body.date, "daily");

            res.status(200).send(report);
        });
    };
}