import Control from './control.js';

export class CreateUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', async (req, res) => {
            const body = req.body;

            // todo: error checking for body contents

            await this.userProfileEntity.insertUserProfile(body);

            res.status(200).send({
                message: `User profile ${body.name} created`,
            });
        });
    }
}

export class GetUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.get('/', async (req, res) => {
            const userProfiles = await this.userProfileEntity.getUserProfiles();

            res.status(200).send({
                data: userProfiles,
            });
        });
    }
}
