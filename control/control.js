import express from 'express';
import ServerError from '../exception/Error.js';
import UsersEntity from '../entity/users.js';
import UserProfilesEntity from '../entity/user-profiles.js';

export default class Control {
    constructor() {
        this.router = express.Router({
            caseSensitive: true,
            strict: true,
        });
        this.userProfileEntity = new UserProfilesEntity();
        this.usersEntity = new UsersEntity();

        this.createController();
    }

    createController() {
        throw new Error('createController() must be implemented');
    }

    requireAuth(allowedProfiles) {
        return async (req, res, next) => {
            if (!req.app.locals.config.requireAuth) return next();
            
            if (req.session.user_id === undefined) 
                return next(new ServerError(403, 'Not authenticated'));

            const { user_profile } = (await this.usersEntity.getUsers({
                user_id: req.session.user_id,
            }))[0];

            const checkRole = (user_profile, allowed) => 
                user_profile.toLowerCase() === allowed.toLowerCase();

            if (typeof allowedProfiles === 'string') {
                if (checkRole(user_profile, allowedProfiles)) return next();
            }
            
            if (Array.isArray(allowedProfiles)) {
                for (const profile of allowedProfiles) {
                    if (checkRole(user_profile, profile)) return next();
                }
            }
            if (allowedProfiles === undefined) return next();

            next(new ServerError(403, 'Not authenticated'));
        };
    }

    getRouter() {
        return this.router;
    }
}
