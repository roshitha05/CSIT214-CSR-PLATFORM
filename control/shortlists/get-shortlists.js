import Control from '../control.js';

export default class GetShortlists extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res, next) => {
            const shortlists = await this.shortlistsEntity
                .getShortlists();

            await Promise.all(
                shortlists.map( async shortlist => {
                    const serviceRequest = await this.serviceRequestsEntity
                        .getServiceRequests({ server_request_id: shortlist.service_request })
                    const user = await this.usersEntity
                        .getUsers({ user_id: shortlist.shortlisted_by })

                    shortlist.service_request = serviceRequest[0];
                    shortlist.shortlisted_by = user[0];

                    delete shortlist.shortlisted_by.password;                    
                })
            );

            res.status(200).send({ shortlists });
        });
    };
}