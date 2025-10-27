import Control from '../control.js';

export default class SearchServiceRequests extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', async (req, res, next) => {
            let serviceRequests = await this.serviceRequestsEntity
                .getServiceRequests({ ...req.query });

            await Promise.all(
                serviceRequests.map( async (request) => {
                    await this.serviceRequestsEntity
                        .increaseView(request)
                    delete request.view_count
                    const user = (await this.usersEntity.getUsers({ 
                        user_id: request.created_by
                    }))[0]
                    request.user = user
                })
            )

            return res.status(200).send(serviceRequests);
        });
    }
}