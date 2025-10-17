import Control from '../control.js';

export default class SuspendUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:name/suspend', this.requireAuth('User Admin'), async (req, res, next) => {    
            const success = await this.userProfileEntity
                .updateUserProfile(req.params.name, { status: 'SUSPENDED'});
            
            if (success) res.status(200).send(true);
            res.status(400).send(false);
        });
    }
}