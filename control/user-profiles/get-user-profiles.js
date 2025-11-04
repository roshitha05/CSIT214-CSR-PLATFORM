import Control from '../control.js';

export default class GetUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', this.requireAuth('User Admin'), async (req, res) => {
            let userProfiles = await this.userProfileEntity
                .getUserProfiles();

            res.status(200).send({ userProfiles });
        });
    }
}