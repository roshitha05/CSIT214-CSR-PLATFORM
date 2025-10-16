import { 
    insertUserProfileSchema,
    searchUserProfilesSchema,
    updateUserProfileSchema,
    responseUserProfileSchema
} from '../schemas/userProfiles.schema.js';
import ServerError from '../exception/Error.js';
import Control from './control.js';

export class CreateUserProfiles extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/', this.requireAuth("User Admin"), async (req, res, next) => {
            const body = {
                ...req.body,
                status: 'ACTIVE'
            }

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

export class UpdateUserProfile extends Control {
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

export class SuspendUserProfile extends Control {
    constructor() {
        super();
    }

    createController() {
        this.router.post('/:name/suspend', this.requireAuth('User Admin'), async (req, res, next) => {    
            const name = req.params.name
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

export class ReinstateUserProfile extends Control {
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