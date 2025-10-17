import { 
    updateUserProfileSchema
} from '../../schemas/userProfiles.schema.js';
import ServerError from '../../exception/Error.js';
import Control from '../control.js';

export default class UpdateUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.put('/:name', this.requireAuth('User Admin'), async (req, res, next) => {
            const name = req.params.name
            const body = req.body
            const parsed = updateUserProfileSchema.parse(body)

            if (
                name.toLowerCase() === 'user admin'
                && parsed.name.toLowerCase() !== 'user admin'
            ) return next(new ServerError(400, 'Cannot change user admin name'));

            const userProfile = (await this.userProfileEntity.getUserProfiles({ name }))[0];

            if (userProfile === undefined) 
                return next(new ServerError(400, 'User profile not found'));

            await this.userProfileEntity.updateUserProfile(name, parsed);
            
            res.status(200).send({
                message: `User profile ${name} updated`
            });
        })
    }
}