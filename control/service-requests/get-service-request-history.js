import Control from '../control.js';

export default class GetServiceRequestsHistory extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/history', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ status: "COMPLETED" });
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