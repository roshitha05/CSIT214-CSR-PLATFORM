import Control from '../control.js';

export default class RetrieveServiceRequest extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/:service_request_id/detail', async (req, res, next) => {
            let serviceRequest = (await this.serviceRequestsEntity
                .getServiceRequests({ 
                    service_request_id: req.params.service_request_id 
                }))[0];

            await this.serviceRequestsEntity
                .increaseView(serviceRequest)
            delete serviceRequest.view_count
            const user = (await this.usersEntity.getUsers({ 
                user_id: serviceRequest.created_by
            }))[0]
            serviceRequest.user = user

            return res.status(200).send(serviceRequest);
        });
    }
}