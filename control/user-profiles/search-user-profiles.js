import Control from '../control.js';

export default class SearchUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/search', this.requireAuth('User Admin'), async (req, res) => {
            const userProfiles = await this.userProfileEntity
                .searchUserProfiles(req.query.keyword);

            userProfiles.map(userProfile => 
                delete userProfile.password
            );

            res.status(200).send({ userProfiles });
        });
    }
}