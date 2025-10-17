import ServerError from '../../exception/Error.js';
import Control from '../control.js';

export default class ReinstateUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:name/reinstate', this.requireAuth('User Admin'), async (req, res, next) => {    
            const name = req.params.name
            const userProfile = (await this.userProfileEntity.getUserProfiles({ name }))[0];

            if (userProfile === undefined) 
                return next(new ServerError(400, 'User profile not found'));

            await this.userProfileEntity.updateUserProfile(name, { status: 'ACTIVE'});
            
            res.status(200).send({
                message: `User profile ${name} reinstated`
            });
        });
    }
}