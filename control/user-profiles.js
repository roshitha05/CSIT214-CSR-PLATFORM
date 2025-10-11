import { insertUserProfileSchema } from '../entity/user-profiles.js';
import ServerError from '../exception/Error.js';
import Control from './control.js';

export class CreateUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', async (req, res, next) => {
            const body = req.body;

            try {
                var parsed = insertUserProfileSchema.parse(body);
            } catch (error) {
                return next(new ServerError(400, error.issues[0].message));
            }

            const nameCheck = await this.userProfileEntity.getUserProfiles({
                name: parsed.name,
            });

            if (nameCheck.length > 0)
                return next(new ServerError(400, 'Name already exists'));

            await this.userProfileEntity.insertUserProfile(parsed);

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
