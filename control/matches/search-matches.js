import Control from '../control.js';

export default class SearchMatches extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            const matches = await this.matchesEntity
                .getMatches(req.query);

            await Promise.all(
                matches.map( async match => {
                    const serviceRequest = await this.serviceRequestsEntity
                        .getServiceRequests({ service_request_id: match.service_request })
                    const user = await this.usersEntity
                        .getUsers({ user_id: match.matched_by })

                    match.service_request = serviceRequest[0];
                    match.matched_by = user[0];

                    delete match.matched_by.password;                    
                })
            );

            res.status(200).send({ matches });
        });
    };
}