import Control from '../control.js';

export default class SearchServiceRequestsHistory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/history/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .searchServiceRequests({ ...req.query, status: "COMPLETED" });
            await Promise.all(
                serviceRequests.map( async serviceRequest => {
                    delete serviceRequest.view_count
                    serviceRequest.user = (await this.usersEntity
                        .getUsers({ 
                            user_id: serviceRequest.created_by 
                        }))[0]
                    }
                )
            )

            return res.status(200).send(serviceRequests);
        });
    }
}