import express from 'express';

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

    getRouter() {
        return this.router;
    }
}
