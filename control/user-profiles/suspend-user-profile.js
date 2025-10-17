import ServerError from '../../exception/Error.js';
import Control from '../control.js';

export default class SuspendUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:name/suspend', this.requireAuth('User Admin'), async (req, res, next) => {    
            const name = req.params.name

            if (name.toLowerCase() === 'user admin') 
                return next(new ServerError(400, 'Cannot suspend user admin'));

            const userProfile = (await this.userProfileEntity.getUserProfiles({ name }))[0];

            if (userProfile === undefined) 
                return next(new ServerError(400, 'User profile not found'));

            await this.userProfileEntity.updateUserProfile(name, { status: 'SUSPENDED'});
            
            res.status(200).send({
                message: `User profile ${name} suspended`
            });
        });
    }
}