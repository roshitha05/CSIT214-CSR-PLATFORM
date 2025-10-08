import Control from './control.js';
import UserProfilesEntity from '../entity/user-profiles.js';

export default class UserProfiles extends Control {
    constructor() {
        super();
        this.userProfileEntity = new UserProfilesEntity();

        this.init();
    }

    init() {
        this.router.post('/', async (req, res) => {
            const body = req.body;

            // todo: error checking for body contents

            await this.userProfileEntity.insertUserProfile(
                body.name,
                body.description,
                body.other
            );

            res.status(200).send({
                message: `User profile ${body.name} created`,
            });
        });
    }

    getRouter() {
        return this.router;
    }
}
