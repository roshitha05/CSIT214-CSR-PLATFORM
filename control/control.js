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
            if (!req.app.config.requireAuth) next();

            req.session.id ?? next(new ServerError(403, 'Not authenticated'));
            const { user_profile } = this.usersEntity.getUsers({
                user_id: req.session.id,
            });

            const checkRole = (user_profile, allowed) =>
                user_profile === allowed;

            if (typeof allowedProfiles === 'string') {
                if (checkRole(user_profile, allowedProfiles)) next();
            }
            if (Array.isArray(allowedProfiles)) {
                allowedProfiles.forEach((profile) => {
                    if (checkRole(user_profile, profile)) next();
                });
            }
            if (allowedProfiles === undefined) next();

            next(new ServerError(403, 'Not authenticated'));
        };
    }

    getRouter() {
        return this.router;
    }
}
