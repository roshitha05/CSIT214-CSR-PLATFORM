import { 
    searchUserProfilesSchema,
    responseUserProfileSchema
} from '../../schemas/userProfiles.schema.js';
import Control from '../control.js';

export default class GetUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', this.requireAuth('User Admin'), async (req, res) => {
            const query = req.query
            const parsed = searchUserProfilesSchema.parse(query)
            let userProfiles = await this.userProfileEntity.getUserProfiles(parsed);
            debugger
            userProfiles = userProfiles.map(userProfile => 
                responseUserProfileSchema.parse(userProfile)
            );

            res.status(200).send({
                message: 'User profiles retrieved',
                data: userProfiles,
            });
        });
    }
}